/**
 * WebSocket connection management for the Claude MCP Figma plugin.
 * Handles establishing and maintaining connections to the MCP server.
 */

// Helper to generate unique IDs
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Generate random channel name
function generateChannelName() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Connect to WebSocket server
async function connectToServer(port) {
  try {
    if (pluginState.connection.connected && pluginState.connection.socket) {
      updateConnectionStatus(true, "Already connected to server");
      return;
    }

    pluginState.connection.serverPort = port;
    pluginState.connection.socket = new WebSocket(`ws://localhost:${port}`);

    pluginState.connection.socket.onopen = () => {
      // Generate random channel name
      const channelName = generateChannelName();
      console.log("Joining channel:", channelName);
      pluginState.connection.channel = channelName;

      // Join the channel using the same format as App.tsx
      pluginState.connection.socket.send(
        JSON.stringify({
          type: "join",
          channel: channelName.trim(),
        })
      );
    };

    pluginState.connection.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        if (data.type === "system") {
          // Successfully joined channel
          if (data.message && data.message.result) {
            pluginState.connection.connected = true;
            const channelName = data.channel;
            updateConnectionStatus(
              true,
              `Connected to server on port ${port} in channel: <strong>${channelName}</strong>`
            );

            // Notify the plugin code
            parent.postMessage(
              {
                pluginMessage: {
                  type: "notify",
                  message: `Connected to Claude MCP server on port ${port} in channel: ${channelName}`,
                },
              },
              "*"
            );
          }
        } else if (data.type === "error") {
          console.error("Error:", data.message);
          updateConnectionStatus(false, `Error: ${data.message}`);
          pluginState.connection.socket.close();
        }

        handleSocketMessage(data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    pluginState.connection.socket.onclose = () => {
      pluginState.connection.connected = false;
      pluginState.connection.socket = null;
      updateConnectionStatus(false, "Disconnected from server");
    };

    pluginState.connection.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      updateConnectionStatus(false, "Connection error");
      pluginState.connection.connected = false;
      pluginState.connection.socket = null;
    };
  } catch (error) {
    console.error("Connection error:", error);
    updateConnectionStatus(
      false,
      `Connection error: ${error.message || "Unknown error"}`
    );
  }
}

// Disconnect from websocket server
function disconnectFromServer() {
  if (pluginState.connection.socket) {
    pluginState.connection.socket.close();
    pluginState.connection.socket = null;
    pluginState.connection.connected = false;
    updateConnectionStatus(false, "Disconnected from server");
  }
}

// Send a command to the WebSocket server
async function sendCommand(command, params) {
  return new Promise((resolve, reject) => {
    if (!pluginState.connection.connected || !pluginState.connection.socket) {
      reject(new Error("Not connected to server"));
      return;
    }

    const id = generateId();
    pluginState.connection.pendingRequests.set(id, { resolve, reject });

    pluginState.connection.socket.send(
      JSON.stringify({
        id,
        type: "message",
        channel: pluginState.connection.channel,
        message: {
          id,
          command,
          params,
        },
      })
    );

    // Set timeout to reject the promise after 30 seconds
    setTimeout(() => {
      if (pluginState.connection.pendingRequests.has(id)) {
        pluginState.connection.pendingRequests.delete(id);
        reject(new Error("Request timed out"));
      }
    }, 30000);
  });
}

// Send success response back to WebSocket
function sendSuccessResponse(id, result) {
  if (!pluginState.connection.connected || !pluginState.connection.socket) {
    console.error("Cannot send response: socket not connected");
    return;
  }

  pluginState.connection.socket.send(
    JSON.stringify({
      id,
      type: "message",
      channel: pluginState.connection.channel,
      message: {
        id,
        result,
      },
    })
  );
}

// Send error response back to WebSocket
function sendErrorResponse(id, errorMessage) {
  if (!pluginState.connection.connected || !pluginState.connection.socket) {
    console.error("Cannot send error response: socket not connected");
    return;
  }

  pluginState.connection.socket.send(
    JSON.stringify({
      id,
      error: errorMessage,
    })
  );
}

// Send operation progress update to server
function sendProgressUpdateToServer(progressData) {
  if (!pluginState.connection.connected || !pluginState.connection.socket) {
    console.error("Cannot send progress update: socket not connected");
    return;
  }
  
  console.log("Sending progress update to server:", progressData);
  
  pluginState.connection.socket.send(
    JSON.stringify({
      id: progressData.commandId,
      type: "progress_update",
      channel: pluginState.connection.channel,
      message: {
        id: progressData.commandId,
        type: "progress_update",
        data: progressData
      }
    })
  );
}
