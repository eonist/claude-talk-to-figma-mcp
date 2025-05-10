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

// Calculate reconnect delay with exponential backoff
function getReconnectDelay() {
  // Start with 1 second, then exponential backoff up to 30 seconds
  const baseDelay = 1000; 
  const maxDelay = 30000; // 30 seconds max
  const delay = Math.min(
    baseDelay * Math.pow(1.5, pluginState.connection.reconnectAttempts),
    maxDelay
  );
  return delay;
}

// Attempt to reconnect to the WebSocket server
function attemptReconnect() {
  // Clear any existing reconnect timer
  if (pluginState.connection.reconnectTimer) {
    clearTimeout(pluginState.connection.reconnectTimer);
    pluginState.connection.reconnectTimer = null;
  }
  
  // If we've reached the max reconnect attempts, stop trying
  if (pluginState.connection.reconnectAttempts >= pluginState.connection.maxReconnectAttempts) {
    updateConnectionStatus(
      false, 
      `Reconnection failed after ${pluginState.connection.maxReconnectAttempts} attempts`
    );
    return;
  }
  
  // Increment reconnect attempts
  pluginState.connection.reconnectAttempts++;
  
  // Calculate delay with exponential backoff
  const delay = getReconnectDelay();
  
  // Update UI to show reconnection attempt
  updateConnectionStatus(
    false, 
    `Connection lost. Reconnecting in ${Math.round(delay/1000)} seconds... (Attempt ${pluginState.connection.reconnectAttempts}/${pluginState.connection.maxReconnectAttempts})`
  );
  
  // Schedule reconnection
  pluginState.connection.reconnectTimer = setTimeout(() => {
    updateConnectionStatus(false, `Attempting to reconnect... (Attempt ${pluginState.connection.reconnectAttempts}/${pluginState.connection.maxReconnectAttempts})`);
    connectToServer(pluginState.connection.serverPort);
  }, delay);
}

// Connect to WebSocket server
async function connectToServer(port) {
  try {
    if (pluginState.connection.connected && pluginState.connection.socket) {
      updateConnectionStatus(true, "Already connected to server");
      return;
    }

    // Clear any existing socket
    if (pluginState.connection.socket) {
      pluginState.connection.socket.close();
      pluginState.connection.socket = null;
    }

    pluginState.connection.serverPort = port;
    pluginState.connection.socket = new WebSocket(`ws://localhost:${port}`);

    pluginState.connection.socket.onopen = () => {
      // Reset reconnection attempts on successful connection
      pluginState.connection.reconnectAttempts = 0;
      
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

    pluginState.connection.socket.onclose = (event) => {
      console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason || 'No reason provided'}`);
      pluginState.connection.connected = false;

      // If auto-reconnect is enabled and this wasn't an intentional disconnect
      if (pluginState.connection.autoReconnect && event.code !== 1000) {
        // Attempt to reconnect
        attemptReconnect();
      } else {
        // Otherwise, just update status to disconnected
        pluginState.connection.socket = null;
        updateConnectionStatus(false, "Disconnected from server");
      }
    };

    pluginState.connection.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      updateConnectionStatus(false, "Connection error");
      pluginState.connection.connected = false;
      
      // If auto-reconnect is enabled, the onclose handler will be triggered next
      // and will handle reconnection attempts
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
  // Clear any reconnection timers
  if (pluginState.connection.reconnectTimer) {
    clearTimeout(pluginState.connection.reconnectTimer);
    pluginState.connection.reconnectTimer = null;
  }
  
  // Reset reconnection attempts
  pluginState.connection.reconnectAttempts = 0;
  
  if (pluginState.connection.socket) {
    // Use code 1000 for normal closure to indicate intentional disconnect
    pluginState.connection.socket.close(1000, "User initiated disconnect");
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
