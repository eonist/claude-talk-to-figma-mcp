/**
 * WebSocket transport module for the Talk to Figma MCP server.
 *
 * Manages connection lifecycle, command dispatch, response handling, and automatic reconnection.
 *
 * Exposes:
 *   - connectToFigma(serverUrl, port, reconnectInterval): void
 *   - joinChannel(channelName): Promise<void>
 *   - getCurrentChannel(): string | null
 *   - sendCommandToFigma(command, params, timeoutMs?): Promise<unknown>
 *   - processFigmaNodeResponse(result): any
 *   - isConnectedToFigma(): boolean
 *
 * @module websocket
 * @example
 * import { connectToFigma, sendCommandToFigma, onResponse } from './websocket.js';
 * connectToFigma('localhost', 3055, 2000);
 * const result = await sendCommandToFigma('get_document_info', {});
 * console.log(result);
 */
import WebSocket from "ws";
import { ReconnectingWebSocket } from "../utils/reconnecting-websocket.js";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger.js";
import { FigmaCommand, PendingRequest, WebSocketMessage } from "../types/commands.js";

// WebSocket connection and request tracking
let ws: any = null;
let currentChannel: string | null = null;
const pendingRequests = new Map<string, PendingRequest>();

// Saved config for lazy connection
let savedServerUrl: string = "";
let savedPort: number = 0;
let savedReconnectInterval: number = 0;

/**
 * Store Figma socket connection parameters for on-demand connection.
 */
export function setConnectionConfig(serverUrl: string, port: number, reconnectInterval: number): void {
  savedServerUrl = serverUrl;
  savedPort = port;
  savedReconnectInterval = reconnectInterval;
}

/**
 * Manages WebSocket connection between the MCP server and Figma plugin.
 * Provides connection lifecycle management, command messaging, request tracking, and error recovery.
 *
 * Module responsibilities:
 * - connectToFigma: Establish and maintain a WebSocket connection with exponential backoff.
 * - joinChannel: Join a dedicated Figma communication channel.
 * - sendCommandToFigma: Send commands to Figma with promise-based request tracking and timeouts.
 * - processFigmaNodeResponse: Filter and log Figma node responses.
 * - isConnectedToFigma: Check current connection status.
 *
 * @module websocket
 */
/*
 * Handles the full WebSocket connection lifecycle including:
 * 1. Initial connection attempt
 * 2. Connection state management 
 * 3. Automatic reconnection with exponential backoff
 * 4. Error handling and recovery
 *
 * @param {string} serverUrl - Server URL to connect to
 * @param {number} port - Port number to connect to
 * @param {number} reconnectInterval - Base interval for reconnection attempts
 * 
 * @throws Logs errors but handles them internally without throwing
 */
export function connectToFigma(serverUrl: string, port: number, reconnectInterval: number): void {
  // If already connected, do nothing
  if (ws && ws.readyState === WebSocket.OPEN) {
    logger.info('Already connected to Figma');
    return;
  }

  // If connection is in progress (CONNECTING state), wait
  if (ws && ws.readyState === WebSocket.CONNECTING) {
    logger.info('Connection to Figma is already in progress');
    return;
  }

  // If there's an existing socket in a closing state, clean it up
  if (ws && (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED)) {
    ws.removeAllListeners();
    ws = null;
  }

  const wsUrl = serverUrl === 'localhost' ? `ws://${serverUrl}:${port}` : `wss://${serverUrl}`;
  logger.info(`Connecting to Figma socket server at ${wsUrl}...`);
  
  try {
    ws = new ReconnectingWebSocket(wsUrl, {
      maxReconnectAttempts: 5,
      initialDelay: reconnectInterval,
      maxDelay: 30000
    });
    
    // Add connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws && ws.readyState === WebSocket.CONNECTING) {
        logger.error('Connection to Figma timed out');
        ws.terminate();
      }
    }, 10000); // 10 second connection timeout

    ws.on('open', () => {
      clearTimeout(connectionTimeout);
      logger.info('Connected to Figma socket server');
      // Reset channel on new connection
      currentChannel = null;
    });

    ws.on("message", (data: any) => {
      try {
        // Attempt to parse the incoming data as JSON.
        const json = JSON.parse(data) as {
          type?: string;
          id?: string;
          message: any;
          [key: string]: any;
        };
        
        logger.debug(`Raw WS message: ${JSON.stringify(json)}`);

        // If the message type indicates a progress update, handle it separately.
        if (json.type === 'progress_update') {
          // Extract the progress data and request identifier.
          const progressData = json.message.data;
          const requestId = json.id || '';

          if (requestId && pendingRequests.has(requestId)) {
            const request = pendingRequests.get(requestId)!;
            // Record current activity time.
            request.lastActivity = Date.now();

            // Clear previous timeout and set up a new one to extend activity if command is long-running.
            clearTimeout(request.timeout);
            request.timeout = setTimeout(() => {
              if (pendingRequests.has(requestId)) {
                logger.error(`Request ${requestId} timed out after extended period of inactivity`);
                pendingRequests.delete(requestId);
                request.reject(new Error('Request to Figma timed out'));
              }
            }, 60000); // 60-second timeout extension during activity

            // Log the progress update details.
            logger.info(`Progress update for ${progressData.commandType}: ${progressData.progress}% - ${progressData.message}`);

            // Optionally, you may resolve early if progress indicates 100% completion.
            if (progressData.status === 'completed' && progressData.progress === 100) {
              logger.info(`Operation ${progressData.commandType} completed, waiting for final result`);
            }
          }
          // Exit early after handling progress updates.
          return;
        }

        // Handle different response structures:
        // 1. Direct response: json has result field
        // 2. Nested response: json.message has result field
        // 3. Response from another client: Check for matching ID in message field
        
        // Check for direct result structure
        if (json.id && pendingRequests.has(json.id) && json.result !== undefined) {
          const request = pendingRequests.get(json.id)!;
          clearTimeout(request.timeout);
          
          if (json.error) {
            logger.error(`Error from Figma (direct): ${json.error}`);
            request.reject(new Error(json.error));
          } else {
            logger.info(`Resolving request ${json.id} with direct result`);
            request.resolve(json.result);
          }
          pendingRequests.delete(json.id);
          return;
        }
        
        // Try to extract response from message field
        const myResponse = json.message;
        logger.debug(`Extracted message content: ${JSON.stringify(myResponse)}`);
        
        // Check if this message has an ID and if that ID matches a pending request
        if (json.id && pendingRequests.has(json.id)) {
          // This might be a response from another client that contains the result
          if (myResponse && myResponse.result !== undefined) {
            const request = pendingRequests.get(json.id)!;
            clearTimeout(request.timeout);
            
            if (myResponse.error) {
              logger.error(`Error from Figma (message): ${myResponse.error}`);
              request.reject(new Error(myResponse.error));
            } else {
              logger.info(`Resolving request ${json.id} with message result`);
              request.resolve(myResponse.result);
            }
            pendingRequests.delete(json.id);
            return;
          }
        }
        
        // Check if the message itself has an ID and result that matches a pending request
        if (myResponse && myResponse.id && pendingRequests.has(myResponse.id) && myResponse.result !== undefined) {
          const request = pendingRequests.get(myResponse.id)!;
          clearTimeout(request.timeout);
          
          if (myResponse.error) {
            logger.error(`Error from Figma (nested): ${myResponse.error}`);
            request.reject(new Error(myResponse.error));
          } else {
            logger.info(`Resolving request ${myResponse.id} with nested result`);
            request.resolve(myResponse.result);
          }
          pendingRequests.delete(myResponse.id);
          return;
        }
        
        // Check if this might be a response that doesn't follow the expected pattern
        // But contains a result that might match an existing request
        if (json.id && pendingRequests.has(json.id)) {
          logger.info(`Found request ${json.id} that might match this message, attempting to resolve`);
          const request = pendingRequests.get(json.id)!;
          
          // If we have a result directly in the message
          if (json.result !== undefined) {
            logger.info(`Resolving request ${json.id} with direct json.result`);
            clearTimeout(request.timeout);
            request.resolve(json.result);
            pendingRequests.delete(json.id);
            return;
          }
          
          // If we have any properties that might be useful as a result
          if (typeof myResponse === 'object' && myResponse !== null) {
            logger.info(`Treating message object as result for request ${json.id}`);
            clearTimeout(request.timeout);
            request.resolve(myResponse);
            pendingRequests.delete(json.id);
            return;
          }
        }
        
        // Last chance: try to find any request that might have timed out
        // but has a matching response based on command pattern
        for (const [id, request] of pendingRequests.entries()) {
          if (id.includes(json.id || '') || (json.id || '').includes(id)) {
            logger.info(`Possible partial ID match between ${id} and ${json.id}`);
            if (myResponse && (myResponse.result !== undefined || json.result !== undefined)) {
              logger.info(`Resolving request ${id} with fuzzy match result`);
              clearTimeout(request.timeout);
              request.resolve(myResponse?.result || json.result);
              pendingRequests.delete(id);
              return;
            }
          }
        }
        
        // For broadcast messages or unassociated responses, log accordingly.
        logger.info(`Received broadcast or unmatched message: ${JSON.stringify(json)}`);
        
        // If we've received a result that looks like document info, try to resolve any pending document info requests
        if (myResponse && myResponse.result && 
            myResponse.result.id && 
            myResponse.result.type === "PAGE" && 
            myResponse.result.children) {
          
          logger.info(`Found what looks like document info, checking for pending requests`);
          
          for (const [id, request] of pendingRequests.entries()) {
            if (id.includes("document_info") || id.includes("get_document")) {
              logger.info(`Resolving document info request ${id}`);
              clearTimeout(request.timeout);
              request.resolve(myResponse.result);
              pendingRequests.delete(id);
              break;
            }
          }
        }

      // If this has a specific command type, try to resolve any pending requests of that type
      let commandType = json.message?.command || myResponse?.command;
      
      // Try to extract command type from result data if not explicitly provided
      if (!commandType && myResponse?.result && typeof myResponse.result === 'object') {
        if (myResponse.result.command) {
          commandType = myResponse.result.command;
          logger.info(`Extracted command type from result: ${commandType}`);
        } else if (myResponse.result.type === 'PAGE') {
          commandType = 'get_document_info';
          logger.info(`Inferred command type from PAGE result: ${commandType}`);
        }
      }
      
      if (commandType && pendingRequests.size > 0) {
        logger.info(`Looking for pending ${commandType} requests (${pendingRequests.size} total pending)`);
        
        // Get the most recent pending request of this command type
        let matchedRequest = null;
        let matchedId = null;
        let mostRecentTime = 0;
        
        // For debugging, log all pending requests
        logger.debug('Pending requests:');
        for (const [id, request] of pendingRequests.entries()) {
          const ageMs = Date.now() - request.lastActivity;
          logger.debug(`  ID: ${id}, age: ${ageMs}ms`);
        }
        
        for (const [id, request] of pendingRequests.entries()) {
          // First try exact command match
          if (id.includes(commandType)) {
            if (request.lastActivity > mostRecentTime) {
              mostRecentTime = request.lastActivity;
              matchedRequest = request;
              matchedId = id;
              logger.info(`Found matching request by command type: ${id}`);
            }
          }
        }
        
        // If still no match, try to match any recent request
        if (!matchedRequest && commandType.includes('get_document')) {
          logger.info('No direct match found, looking for any document-related requests');
          for (const [id, request] of pendingRequests.entries()) {
            if ((id.includes('get_') || id.includes('document')) && request.lastActivity > mostRecentTime) {
              mostRecentTime = request.lastActivity;
              matchedRequest = request;
              matchedId = id;
              logger.info(`Found potential document request match: ${id}`);
            }
          }
        }
        
        // Still no match? Take the most recent request of any type as a fallback
        if (!matchedRequest) {
          logger.info('No specific match found, defaulting to most recent request');
          for (const [id, request] of pendingRequests.entries()) {
            if (request.lastActivity > mostRecentTime) {
              mostRecentTime = request.lastActivity;
              matchedRequest = request;
              matchedId = id;
            }
          }
        }
        
        if (matchedRequest && matchedId) {
          logger.info(`Resolving request ${matchedId} (command: ${commandType})`);
          clearTimeout(matchedRequest.timeout);
          
          // If we have a result, use it, otherwise use an empty success response
          // Get the full result data
          let result = myResponse?.result || json.result || json.message?.result || { success: true, command: commandType };
          
          // Detailed logging of result structure
          logger.debug(`Full result structure before resolving: ${JSON.stringify(result)}`);
          
          // If we have full selection or document data, make sure to preserve it
          if (commandType === 'get_selection' || commandType === 'get_document_info') {
            // Check if we have result.result which is sometimes where the actual data is nested
            if (result.result) {
              logger.info(`Found nested result.result structure for ${commandType}, using that as top-level data`);
              result = result.result;
            }
            
            // Make sure the actual data is preserved
            if (result.selectionCount !== undefined || result.selection !== undefined ||
                result.name !== undefined || result.children !== undefined) {
              logger.info(`Preserving detailed ${commandType} data in result`);
            } else if (myResponse && typeof myResponse === 'object') {
              // If the data is in myResponse directly, use that
              if (myResponse.selectionCount !== undefined || myResponse.selection !== undefined ||
                  myResponse.name !== undefined || myResponse.children !== undefined) {
                logger.info(`Found ${commandType} data in myResponse, using that instead of simplified result`);
                result = myResponse;
              }
            }
          }
          
          // Add command type to result if not present
          if (typeof result === 'object' && result !== null && !result.command) {
            result.command = commandType;
          }
          
          logger.info(`Resolving request with full data for ${commandType}`);
          matchedRequest.resolve(result);
          pendingRequests.delete(matchedId);
        } else {
          logger.warn(`Could not find any matching request for command: ${commandType}`);
        }
      }
      
      // Periodic pending request cleanup
      const now = Date.now();
      if (now % 60000 < 1000) { // Run cleanup roughly once a minute
        const startCount = pendingRequests.size;
        if (startCount > 0) {
          logger.info(`Running periodic cleanup of ${startCount} pending requests`);
          for (const [id, request] of pendingRequests.entries()) {
            const ageMs = now - request.lastActivity;
            if (ageMs > 300000) { // 5 minutes
              logger.info(`Auto-cleaning old request ${id} (age: ${ageMs}ms)`);
              clearTimeout(request.timeout);
              request.reject(new Error('Request automatically cleaned up due to age'));
              pendingRequests.delete(id);
            }
          }
          logger.info(`Cleanup complete: ${startCount} -> ${pendingRequests.size} requests`);
        }
      }
      } catch (error) {
        // Log error details if JSON parsing or any processing fails.
        logger.error(`Error parsing message: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    ws.on('error', (error: any) => {
      // Log the WebSocket error detail to indicate an error occurred.
      logger.error(`Socket error: ${error}`);
      // Note: Do not attempt reconnection here; let the close event handle reconnection.
    });

    ws.on('close', (code: any, reason: any) => {
      // Clear the connection timeout in case it is still pending.
      clearTimeout(connectionTimeout);
      logger.info(`Disconnected from Figma socket server with code ${code} and reason: ${reason || 'No reason provided'}`);
      ws = null;

      // Reject all pending requests since the connection is lost.
      for (const [id, request] of pendingRequests.entries()) {
        clearTimeout(request.timeout);
        request.reject(new Error(`Connection closed with code ${code}: ${reason || 'No reason provided'}`));
        pendingRequests.delete(id);
      }

      // Calculate exponential backoff delay before attempting a reconnection.
      const backoff = Math.min(30000, reconnectInterval * Math.pow(1.5, Math.floor(Math.random() * 5))); // Max 30s
      logger.info(`Attempting to reconnect in ${backoff / 1000} seconds...`);
      setTimeout(() => connectToFigma(serverUrl, port, reconnectInterval), backoff);
    });
    
  } catch (error) {
    logger.error(`Failed to create WebSocket connection: ${error instanceof Error ? error.message : String(error)}`);
    // Attempt to reconnect after a delay
    setTimeout(() => connectToFigma(serverUrl, port, reconnectInterval), reconnectInterval);
  }
}

/**
 * Joins a specific Figma communication channel.
 * 
 * Establishes a dedicated channel for communicating with the Figma plugin.
 * The channel is required for most commands except the initial join.
 *
 * @param {string} channelName - Name of the channel to join
 * @returns {Promise<void>} Resolves when channel is joined successfully
 * 
 * @throws {Error} If not connected to Figma or channel join fails
 */
export async function joinChannel(channelName: string): Promise<void> {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error("Not connected to Figma");
  }

  try {
    await sendCommandToFigma("join", { channel: channelName });
    currentChannel = channelName;
    logger.info(`Joined channel: ${channelName}`);
  } catch (error) {
    logger.error(`Failed to join channel: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get the current channel name
 * 
 * @returns {string|null} The current channel name or null if not joined
 */
export function getCurrentChannel(): string | null {
  return currentChannel;
}

/**
 * Sends commands to Figma Plugin via WebSocket
 * 
 * Handles the full command lifecycle including:
 * 1. Connection validation and auto-reconnect
 * 2. Command queuing and execution
 * 3. Response handling and timeout management
 * 4. Progress tracking and updates
 * 
 * @param {FigmaCommand} command - Command to execute
 * @param {unknown} params - Command parameters
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<unknown>} Command result
 * 
 * @throws {Error} When connection fails, command times out, or channel requirements not met
 */
export function sendCommandToFigma(
  command: FigmaCommand,
  params: unknown = {},
  timeoutMs: number = 60000  // Increased default timeout to 60 seconds
): Promise<unknown> {
  // Lazy-connect if socket is not open
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    if (!savedServerUrl) {
      return Promise.reject(new Error("Not connected to Figma. Please ensure connection config is set."));
    }
    // initiate connection on demand
    logger.info("Socket not open, initiating connection on demand");
    connectToFigma(savedServerUrl, savedPort, savedReconnectInterval);
    return new Promise((resolve, reject) => {
      const onOpen = () => {
        logger.info("Socket opened, resending command after connection");
        ws.off('open', onOpen);
        // resend after connection
        sendCommandToFigma(command, params, timeoutMs).then(resolve, reject);
      };
      ws.on('open', onOpen);
    });
  }
  
  return new Promise((resolve, reject) => {
    // If not connected, try to connect first
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      reject(new Error("Not connected to Figma. Please ensure Figma plugin is running."));
      return;
    }

    // Check if we need a channel for this command
    const requiresChannel = command !== "join";
    if (requiresChannel && !currentChannel) {
      reject(new Error("Must join a channel before sending commands"));
      return;
    }

    const id = uuidv4();
    
    // For document info and selection, add special handling flags
    const enhancedParams = {...(params as any)};
    
    if (command === 'get_document_info' || command === 'get_selection') {
      logger.info(`Adding special handling flags for command: ${command}`);
      enhancedParams._preserveAllData = true;
      enhancedParams._enhancedRequest = true;
      enhancedParams._requestTime = Date.now();
    }
    
    const request: WebSocketMessage = {
      id,
      type: command === "join" ? "join" : "message",
      ...(command === "join"
        ? { channel: (params as any).channel }
        : { channel: currentChannel }),
      message: {
        id,
        command,
        params: {
          ...enhancedParams,
          commandId: id, // Include the command ID in params
        },
      },
    };

    // Set a timeout for the request with progressive timeout extension
    let timeoutExtension = 1;  // Start with 1x multiplier
    const maxTimeoutExtensions = 3;  // Maximum number of extensions
    
    const createTimeout = (remainingExtensions: number) => {
      return setTimeout(() => {
        if (!pendingRequests.has(id)) return;
        
        // Get the time elapsed since the request was sent
        const request = pendingRequests.get(id)!;
        const elapsed = Date.now() - request.lastActivity;
        
        if (remainingExtensions > 0) {
          // Still have timeout extensions left
          logger.info(`Request ${id} extending timeout (${remainingExtensions} extensions left, elapsed: ${elapsed}ms)`);
          
          // Clear the current timeout and create a new one with increased time
          clearTimeout(request.timeout);
          timeoutExtension++;
          
          // Set the new timeout with extended time and decremented counter
          request.timeout = createTimeout(remainingExtensions - 1);
        } else {
          // No more extensions, fail the request
          logger.error(`Request ${id} timed out after ${elapsed}ms (${maxTimeoutExtensions} extensions used)`);
          pendingRequests.delete(id);
          reject(new Error(`Request to Figma timed out after ${elapsed}ms`));
        }
      }, timeoutMs * timeoutExtension);
    };

    const timeout = createTimeout(maxTimeoutExtensions);

    // Store the request callbacks along with the timeout and current time to allow timeout management.
    pendingRequests.set(id, {
      resolve,
      reject,
      timeout,
      lastActivity: Date.now()
    });

    // Send the request
    logger.info(`Sending command to Figma: ${command} (ID: ${id}, channel: ${currentChannel || 'none'})`);
    logger.debug(`Request details: ${JSON.stringify(request)}`);
    
    try {
      ws.send(JSON.stringify(request));
    } catch (error) {
      logger.error(`Error sending request ${id}: ${error instanceof Error ? error.message : String(error)}`);
      clearTimeout(timeout);
      pendingRequests.delete(id);
      reject(new Error(`Failed to send command to Figma: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

/**
 * Processes and filters Figma node responses for client consumption
 * 
 * @param {unknown} result - Raw node data from Figma API
 * @returns {any} Processed node data with sensitive/internal data removed
 */
export function processFigmaNodeResponse(result: unknown): any {
  if (!result || typeof result !== "object") {
    return result;
  }

  // Check if this looks like a node response
  const resultObj = result as Record<string, unknown>;
  if ("id" in resultObj && typeof resultObj.id === "string") {
    // It appears to be a node response, log the details
    logger.debug(
      `Processed Figma node: ${resultObj.name || "Unknown"} (ID: ${resultObj.id
      })`
    );

    if ("x" in resultObj && "y" in resultObj) {
      logger.debug(`Node position: (${resultObj.x}, ${resultObj.y})`);
    }

    if ("width" in resultObj && "height" in resultObj) {
      logger.debug(`Node dimensions: ${resultObj.width}×${resultObj.height}`);
    }
  }

  return result;
}

/**
 * Check if there's a WebSocket connection to Figma
 * 
 * @returns {boolean} True if connected, false otherwise
 */
export function isConnectedToFigma(): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}
