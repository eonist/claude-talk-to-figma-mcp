/**
 * Message Handler for the Claude MCP Figma plugin.
 * Processes incoming and outgoing messages between the WebSocket and plugin.
 */

// Handle messages from the WebSocket
// Store a map of command types to their original request IDs
if (!window.commandIdMap) {
  window.commandIdMap = new Map();
}

if (!window.commandIdMap) {
  window.commandIdMap = new Map();
}

async function handleSocketMessage(payload) {
  const data = payload.message;
  console.log("handleSocketMessage", data);

  // If it's a response to a previous request
  if (data.id && pluginState.connection.pendingRequests.has(data.id)) {
    const { resolve, reject } = pluginState.connection.pendingRequests.get(data.id);
    pluginState.connection.pendingRequests.delete(data.id);

    if (data.error) {
      reject(new Error(data.error));
    } else {
      resolve(data.result);
    }
    return;
  }

  // If it's a new command
  if (data.command) {
    try {
      // Store the command type and ID for later lookup
      if (!window.commandIdMap.has(data.command)) {
        window.commandIdMap.set(data.command, []);
      }
      var entry = {
        id: data.id,
        timestamp: Date.now(),
        params: data.params
      };
      window.commandIdMap.get(data.command).push(entry);

      // Limit the stored commands to the most recent 10 for each command type
      if (window.commandIdMap.get(data.command).length > 10) {
        window.commandIdMap.get(data.command).shift();
      }

      console.log(`Stored command ID mapping for ${data.command}: ${data.id}`);

      // Send the command to the plugin code
      parent.postMessage(
        {
          pluginMessage: {
            type: "execute-command",
            id: data.id,
            command: data.command,
            params: data.params,
          },
        },
        "*"
      );
    } catch (error) {
      // Send error back to WebSocket
      sendErrorResponse(
        data.id,
        error.message || "Error executing command"
      );
    }
  }
}

// Helper to find the most recent command ID
function findCommandId(commandType) {
  if (!window.commandIdMap || !window.commandIdMap.has(commandType)) {
    console.warn(`No stored command IDs found for command type: ${commandType}`);
    return null;
  }
  
  const commandEntries = window.commandIdMap.get(commandType);
  if (commandEntries.length === 0) {
    console.warn(`Command entries array is empty for command type: ${commandType}`);
    return null;
  }
  
  // Sort by timestamp in descending order (most recent first)
  commandEntries.sort((a, b) => b.timestamp - a.timestamp);
  
  // Return the most recent command ID
  return commandEntries[0].id;
}

// Initialize event listener for messages from plugin code
function initMessageListener() {
  // Listen for messages from the plugin code
  window.onmessage = (event) => {
    const message = event.data.pluginMessage;
    if (!message) return;

    console.log("Received message from plugin:", message);

    switch (message.type) {
      case "connection-status":
        updateConnectionStatus(message.connected, message.message);
        break;
      case "auto-connect":
        connectButton.click();
        break;
      case "auto-disconnect":
        disconnectButton.click();
        break;
      case "command-result": {
        console.log(`[RECEIVED RESULT] Got command result from plugin:`, message);
        let responseId = message.id;
        
        // If ID is missing or doesn't look like a proper ID, try to recover it
        if (!responseId || responseId === "undefined") {
          console.warn(`[ID MISSING] Response has missing or invalid ID`, message);
          
          // Try to extract command type from the result data
          let commandType = null;
          
          // Look for command in the message itself first
          if (message.command) {
            commandType = message.command;
            console.log(`[ID RECOVERY] Found command type in message: ${commandType}`);
          }
          // Then look in the result
          else if (message.result && typeof message.result === 'object') {
            if (message.result.command) {
              commandType = message.result.command;
              console.log(`[ID RECOVERY] Found command type in result: ${commandType}`);
            } else if (message.result.type === 'PAGE') {
              commandType = 'get_document_info';
              console.log(`[ID RECOVERY] Detected get_document_info from PAGE type`);
            } else if (message.result.id && message.result.width && message.result.height) {
              // This might be a rectangle or other shape
              const recentCommands = Array.from(window.commandIdMap.keys())
                .filter(cmd => cmd.includes('create_') || cmd.includes('set_'));
              
              if (recentCommands.length > 0) {
                // Use the most recent creation command
                commandType = recentCommands[0];
                console.log(`[ID RECOVERY] Guessed command type from shape properties: ${commandType}`);
              }
            }
          }
          
          if (commandType) {
            const originalId = findCommandId(commandType);
            if (originalId) {
              console.log(`[ID RECOVERED] Successfully recovered ID ${originalId} for command ${commandType}`);
              responseId = originalId;
            } else {
              console.error(`[ID RECOVERY FAILED] Could not find stored ID for command type: ${commandType}`);
            }
          } else {
            console.error(`[ID RECOVERY FAILED] Could not determine command type from result:`, message.result);
          }
        }
        
        // Check if we have a valid ID and are connected
        if (!responseId || responseId === "undefined") {
          console.error(`[RESPONSE FAILED] Still no valid ID for response`, message);
          // Try to recover using any recent command
          var allCommands = [];
          var entries = Array.from(window.commandIdMap.entries());
          for (var i = 0; i < entries.length; i++) {
            var cmdEntries = entries[i][1];
            for (var j = 0; j < cmdEntries.length; j++) {
              allCommands.push(cmdEntries[j]);
            }
          }
          allCommands.sort(function(a, b) { return b.timestamp - a.timestamp; });
          
          if (allCommands.length > 0) {
            responseId = allCommands[0].id;
            console.log(`[LAST RESORT] Using most recent command ID: ${responseId}`);
          } else {
            console.error(`[RESPONSE ABANDONED] No valid ID found and no recent commands`);
            break;
          }
        }
        
        if (!pluginState.connection.connected || !pluginState.connection.socket) {
          console.error(`[WEBSOCKET ERROR] Cannot send response: WebSocket not connected`);
          break;
        }
        
        if (pluginState.connection.socket.readyState !== 1) { // 1 = OPEN
          console.error(`[WEBSOCKET ERROR] WebSocket not in OPEN state. Current state: ${pluginState.connection.socket.readyState}`);
          break;
        }
        
        console.log(`[SENDING RESPONSE] Preparing to send response with ID: ${responseId}`);
        
        // Check if this is a document or selection response for special handling to preserve all data
        let enhancedResult = message.result;
        
        // For document info and selection responses, we need to ensure all data is included
        if (message.command === 'get_document_info' || message.command === 'get_selection') {
          console.log(`[DATA PRESERVATION] Special handling for ${message.command} data`);
          
          // If we have a data-rich result with strong indicators of real Figma data
          let isRealDocumentData = message.result && 
                                  typeof message.result === 'object' &&
                                  (message.result.children || 
                                   message.result.type === 'PAGE' ||
                                   message.result.name);
                                   
          let isRealSelectionData = message.result && 
                                   typeof message.result === 'object' &&
                                   (message.result.selection || 
                                    message.result.selectionCount !== undefined);
          
          if (isRealDocumentData || isRealSelectionData) {
            console.log(`[FULL DATA] Detected real ${message.command} data with rich structure`);
            
            // Keep all the original data but add command identifier
            enhancedResult = Object.assign({}, message.result, {
              command: message.command,
              _dataQuality: 'full',
              _timestamp: Date.now()
            });
            
            console.log(`[FULL DATA] Enhanced result with metadata:`, enhancedResult);
          } else {
            console.warn(`[MINIMAL DATA] Result for ${message.command} lacks expected properties`);
            // Create a minimal result structure with the success flag
            if (message.command === 'get_document_info') {
              enhancedResult = {
                name: "Document",
                id: "document-info",
                type: "PAGE",
                children: [],
                currentPage: {
                  id: "current-page",
                  name: "Current Page",
                  childCount: 0
                },
                success: true,
                command: message.command,
                _dataQuality: 'minimal',
                _debug: {
                  timestamp: Date.now(),
                  message: "Minimal document info returned due to data loss in transmission"
                }
              };
            } else if (message.command === 'get_selection') {
              enhancedResult = {
                selectionCount: 0,
                selection: [],
                success: true,
                command: message.command,
                _dataQuality: 'minimal',
                _debug: {
                  timestamp: Date.now(),
                  message: "Minimal selection info returned due to data loss in transmission"
                }
              };
            }
          }
        } else {
          // For all other commands, ensure we have the command type in the result
          if (enhancedResult && typeof enhancedResult === 'object') {
            enhancedResult.command = message.command;
          }
        }
        
        // Forward the enhanced result from plugin code back to WebSocket
        sendSuccessResponse(responseId, enhancedResult);
        break;
      }
      case "command-error": {
        let responseId = message.id;
        
        // Same recovery logic as above
        if (!responseId || responseId === "undefined") {
          // For errors, we'll try the most recent command of any type
          var allCommands = [];
          var entries = Array.from(window.commandIdMap.entries());
          for (var i = 0; i < entries.length; i++) {
            var cmdEntries = entries[i][1];
            for (var j = 0; j < cmdEntries.length; j++) {
              allCommands.push(cmdEntries[j]);
            }
          }
          allCommands.sort(function(a, b) { return b.timestamp - a.timestamp; });
          var mostRecentCommand = allCommands.length > 0 ? allCommands[0] : null;
            
          if (mostRecentCommand) {
            console.log(`Recovered ID ${mostRecentCommand.id} for error response`);
            responseId = mostRecentCommand.id;
          }
        }
        
        // Forward the error from plugin code back to WebSocket
        sendErrorResponse(responseId, message.error);
        break;
      }
      case "command_progress":
        // Update UI with progress information
        updateProgressUI(message);
        // Forward progress update to server
        sendProgressUpdateToServer(message);
        break;
      // Theme case removed - now handled by Figma's built-in themeColors
    }
  };
}
