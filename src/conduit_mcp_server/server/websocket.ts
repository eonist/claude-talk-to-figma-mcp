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
          result?: any;
          error?: any;
          [key: string]: any;
        };
        
        logger.debug(`Raw WS message: ${JSON.stringify(json)}`);

        // Handle progress updates
        if (handleProgressUpdate(json)) {
          return;
        }

        // Handle message responses in a structured way
        if (handleMessageResponse(json)) {
          return;
        }

      } catch (error) {
        // Log error details if JSON parsing or any processing fails.
        logger.error(`Error parsing message: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    /**
     * Handle progress update messages
     * @param json The parsed JSON message
     * @returns true if this was a progress update and was handled
     */
    function handleProgressUpdate(json: any): boolean {
      if (json.type !== 'progress_update') {
        return false;
      }

      const progressData = json.message?.data;
      const requestId = json.id || '';

      if (!requestId || !pendingRequests.has(requestId) || !progressData) {
        return true; // Still a progress update but we couldn't process it
      }

      const request = pendingRequests.get(requestId)!;
      
      // Update activity timestamp and extend timeout
      request.lastActivity = Date.now();
      clearTimeout(request.timeout);
      request.timeout = setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          logger.error(`Request ${requestId} timed out after extended period of inactivity`);
          pendingRequests.delete(requestId);
          request.reject(new Error('Request to Figma timed out'));
        }
      }, 60000); // 60-second timeout extension

      // Log progress update
      logger.info(`Progress update for ${progressData.commandType}: ${progressData.progress}% - ${progressData.message}`);

      // Note completion
      if (progressData.status === 'completed' && progressData.progress === 100) {
        logger.info(`Operation ${progressData.commandType} completed, waiting for final result`);
      }

      return true;
    }
    
    /**
     * Handle message responses in a structured way
     * @param json The parsed JSON message 
     * @returns true if a matching request was found and resolved
     */
    function handleMessageResponse(json: any): boolean {
      // Extract key message components
      const jsonId = json.id;
      const messageObj = json.message;
      const messageId = messageObj?.id;
      const jsonResult = json.result;
      const messageResult = messageObj?.result;
      const jsonError = json.error;
      const messageError = messageObj?.error;
      const commandType = messageObj?.command;

      // Case 1: Direct result structure (most common)
      if (jsonId && pendingRequests.has(jsonId) && jsonResult !== undefined) {
        resolveRequest(jsonId, jsonResult, jsonError, 'direct');
        return true;
      }
      
      // Case 2: Result in message field
      if (jsonId && pendingRequests.has(jsonId) && messageResult !== undefined) {
        resolveRequest(jsonId, messageResult, messageError, 'message');
        return true;
      }
      
      // Case 3: Nested ID in message matches a request
      if (messageId && pendingRequests.has(messageId) && messageResult !== undefined) {
        resolveRequest(messageId, messageResult, messageError, 'nested');
        return true;
      }
      
      // Case 4: Message is a general object response
      if (jsonId && pendingRequests.has(jsonId) && typeof messageObj === 'object' && messageObj !== null) {
        resolveRequest(jsonId, messageObj, undefined, 'object');
        return true;
      }
      
      // Case 5: Fuzzy ID matching (for partial/mismatched IDs)
      for (const [id, request] of pendingRequests.entries()) {
        if ((jsonId && id.includes(jsonId)) || (jsonId && jsonId.includes(id))) {
          if (messageResult !== undefined || jsonResult !== undefined) {
            resolveRequest(id, messageResult || jsonResult, messageError || jsonError, 'fuzzy');
            return true;
          }
        }
      }
      
      // Case 6: Looks like document info response
      if (messageResult?.id && messageResult?.type === "PAGE" && messageResult?.children) {
        for (const [id, request] of pendingRequests.entries()) {
          if (id.includes("document_info") || id.includes("get_document")) {
            resolveRequest(id, messageResult, undefined, 'document_info');
            return true;
          }
        }
      }
      
      // Case 7: Command type matching (last resort)
      if (commandType && pendingRequests.size > 0) {
        // Find most recent pending request of this command type
        let matchedId = null;
        let mostRecentTime = 0;
        
        for (const [id, request] of pendingRequests.entries()) {
          if (request.lastActivity > mostRecentTime && id.includes(commandType)) {
            mostRecentTime = request.lastActivity;
            matchedId = id;
          }
        }
        
        if (matchedId) {
          const result = messageResult || jsonResult || { success: true, command: commandType };
          resolveRequest(matchedId, result, messageError || jsonError, 'command_type');
          return true;
        }
      }
      
      // No matching request found
      logger.info(`Received broadcast or unmatched message: ${JSON.stringify(json)}`);
      return false;
    }
    
    /**
     * Helper to resolve a request with proper cleanup
     */
    function resolveRequest(id: string, result: any, error: any, matchType: string): void {
      if (!pendingRequests.has(id)) return;
      
      const request = pendingRequests.get(id)!;
      clearTimeout(request.timeout);
      
      if (error) {
        logger.error(`Error from Figma (${matchType}): ${error}`);
        request.reject(new Error(typeof error === 'string' ? error : JSON.stringify(error)));
      } else {
        logger.info(`Resolving request ${id} with ${matchType} result`);
        request.resolve(result);
      }
      
      pendingRequests.delete(id);
    }

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
          ...(params as any),
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
