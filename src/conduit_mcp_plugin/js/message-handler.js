/**
 * Message Handler for the Conduit MCP Figma plugin.
 * Processes incoming and outgoing messages between the WebSocket and plugin.
 */

/**
 * Stores a map of command types to their original request IDs for tracking responses.
 * @global
 * @type {Map<string, Array<{id: string, timestamp: number, params: any}>>}
 */
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
      // Storing the full command along with the ID ensures we can match responses properly
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
        let responseId = message.id;
        
        // If ID is missing or doesn't look like a proper ID, try to recover it
        if (!responseId || responseId === "undefined") {
          // Try to extract command type from the result data
          let commandType = null;
          
          // Look for properties that might indicate the command type
          if (message.result && typeof message.result === 'object') {
            if (message.result.command) {
              commandType = message.result.command;
            } else if (message.result.type === 'PAGE') {
              commandType = 'get_document_info';
            } else if (message.result.id && message.result.width && message.result.height) {
              // This might be a rectangle or other shape
              const recentCommands = Array.from(window.commandIdMap.keys())
                .filter(cmd => cmd.includes('create_') || cmd.includes('set_'));
              
              if (recentCommands.length > 0) {
                // Use the most recent creation command
                commandType = recentCommands[0];
              }
            }
          }
          
          if (commandType) {
            const originalId = findCommandId(commandType);
            if (originalId) {
              console.log(`Recovered ID ${originalId} for command ${commandType}`);
              responseId = originalId;
            }
          }
        }
        
        console.log(`Sending response with ID: ${responseId}`);
        // Forward the result from plugin code back to WebSocket
        sendSuccessResponse(responseId, message.result);
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
