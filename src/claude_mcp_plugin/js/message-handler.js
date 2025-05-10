/**
 * Message Handler for the Claude MCP Figma plugin.
 * Processes incoming and outgoing messages between the WebSocket and plugin.
 */

// Handle messages from the WebSocket
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
      case "command-result":
        // Forward the result from plugin code back to WebSocket
        sendSuccessResponse(message.id, message.result);
        break;
      case "command-error":
        // Forward the error from plugin code back to WebSocket
        sendErrorResponse(message.id, message.error);
        break;
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
