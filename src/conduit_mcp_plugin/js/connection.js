/**
 * WebSocket connection management for the Conduit MCP Figma plugin.
 * Handles establishing and maintaining connections to the MCP server.
 */

/**
 * Generates a unique identifier string for correlating requests and responses.
 * Uses current timestamp and random characters for uniqueness.
 * @returns {string} A unique request/command ID.
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Generates a random channel name for WebSocket communication.
 * Used to isolate plugin sessions on the server.
 * @returns {string} An 8-character alphanumeric channel name.
 */
function generateChannelName() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Calculates the reconnect delay using exponential backoff.
 * Uses pluginState.connection.reconnectAttempts to determine delay.
 * @returns {number} Delay in milliseconds before the next reconnect attempt.
 */
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

/**
 * Starts a countdown timer for the next reconnection attempt.
 * Updates pluginState and UI every second.
 * @param {number} seconds - Number of seconds for the countdown.
 * @returns {void}
 */
function startCountdownTimer(seconds) {
  // Clear any existing countdown timer
  clearCountdownTimer();
  
  // Set initial countdown value
  pluginState.connection.countdownSeconds = seconds;
  
  // Update UI with initial countdown value
  updateCountdownDisplay();
  
  // Set interval to update countdown every second
  pluginState.connection.countdownTimer = setInterval(() => {
    // Decrement countdown
    pluginState.connection.countdownSeconds--;
    
    // Update UI with new countdown value
    updateCountdownDisplay();
    
    // If countdown reaches 0, clear the interval
    if (pluginState.connection.countdownSeconds <= 0) {
      clearCountdownTimer();
    }
  }, 1000); // Update every second
}

/**
 * Clears the active countdown timer for reconnection.
 * Resets pluginState.connection.countdownTimer to null.
 * @returns {void}
 */
function clearCountdownTimer() {
  if (pluginState.connection.countdownTimer) {
    clearInterval(pluginState.connection.countdownTimer);
    pluginState.connection.countdownTimer = null;
  }
}

/**
 * Updates the UI to display the current countdown value for reconnection.
 * Only updates if in persistent retry mode.
 * @returns {void}
 */
function updateCountdownDisplay() {
  if (pluginState.connection.inPersistentRetryMode) {
    const seconds = pluginState.connection.countdownSeconds;
    updateConnectionStatus(
      false, 
      `Not connected. Next attempt in ${seconds} second${seconds !== 1 ? 's' : ''}`
    );
  }
}

/**
 * Attempts to reconnect to the WebSocket server using exponential backoff and persistent retry.
 * Updates pluginState and schedules the next connection attempt.
 * @returns {void}
 */
function attemptReconnect() {
  // Clear any existing reconnect timer
  if (pluginState.connection.reconnectTimer) {
    clearTimeout(pluginState.connection.reconnectTimer);
    pluginState.connection.reconnectTimer = null;
  }
  
  // Clear any existing countdown timer
  clearCountdownTimer();
  
  let delay;
  let statusMessage;
  
  // Check if we've exhausted the initial exponential backoff attempts
  if (pluginState.connection.reconnectAttempts >= pluginState.connection.maxReconnectAttempts && !pluginState.connection.inPersistentRetryMode) {
    // Switch to persistent retry mode
    pluginState.connection.inPersistentRetryMode = true;
    delay = pluginState.connection.persistentRetryDelay;
    statusMessage = `Not connected. Next attempt in ${Math.round(delay/1000)} seconds`;
  } 
  else if (pluginState.connection.inPersistentRetryMode) {
    // We're already in persistent retry mode
    delay = pluginState.connection.persistentRetryDelay;
    statusMessage = `Not connected. Next attempt in ${Math.round(delay/1000)} seconds`;
  } 
  else {
    // Still in exponential backoff phase
    pluginState.connection.reconnectAttempts++;
    delay = getReconnectDelay();
    statusMessage = `Not connected. Retrying in ${Math.round(delay/1000)} seconds (Attempt ${pluginState.connection.reconnectAttempts} of ${pluginState.connection.maxReconnectAttempts})`;
  }
  
  // Update UI to show reconnection attempt
  updateConnectionStatus(false, statusMessage);
  
  // Schedule reconnection
  pluginState.connection.reconnectTimer = setTimeout(() => {
    // Clear countdown timer before reconnection attempt
    clearCountdownTimer();
    
    // No longer setting intermediate "Attempting to reconnect..." message to avoid UI jitter
    connectToServer(pluginState.connection.serverPort);
  }, delay);
  
  // Start countdown timer if in persistent retry mode
  if (pluginState.connection.inPersistentRetryMode) {
    startCountdownTimer(Math.round(delay/1000));
  }
}

/**
 * Connects to the WebSocket server on the specified port.
 * Handles connection lifecycle, event listeners, and channel joining.
 * Updates pluginState.connection and UI status.
 * @async
 * @param {number} port - The port number to connect to.
 * @returns {Promise<void>}
 */
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
      // Reset reconnection state on successful connection
      pluginState.connection.reconnectAttempts = 0;
      pluginState.connection.inPersistentRetryMode = false;
      
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
              `Connected: Server port ${port}, Channel ${channelName}`
            );

            // Notify the plugin code
            parent.postMessage(
              {
                pluginMessage: {
                  type: "notify",
                  message: `Connected to Conduit MCP server on port ${port} in channel: ${channelName}`,
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
        updateConnectionStatus(false, "Not connected");
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

/**
 * Disconnects from the WebSocket server and resets connection state.
 * Cleans up timers and resets pluginState.connection.
 * @returns {void}
 */
function disconnectFromServer() {
  // Clear any reconnection timers
  if (pluginState.connection.reconnectTimer) {
    clearTimeout(pluginState.connection.reconnectTimer);
    pluginState.connection.reconnectTimer = null;
  }
  
  // Clear any countdown timer
  clearCountdownTimer();
  
  // Reset reconnection attempts and state
  pluginState.connection.reconnectAttempts = 0;
  pluginState.connection.inPersistentRetryMode = false;
  
  if (pluginState.connection.socket) {
    // Use code 1000 for normal closure to indicate intentional disconnect
    pluginState.connection.socket.close(1000, "User initiated disconnect");
    pluginState.connection.socket = null;
    pluginState.connection.connected = false;
    updateConnectionStatus(false, "Not connected");
  }
}

/**
 * Sends a command to the WebSocket server and returns a promise for the response.
 * Stores the request in pluginState.connection.pendingRequests for correlation.
 * @async
 * @param {string} command - The command name to send.
 * @param {object} params - Parameters for the command.
 * @returns {Promise<any>} Promise resolving with the server response.
 */
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

/**
 * Sends a success response back to the WebSocket server.
 * Used for plugin-to-server communication after command completion.
 * @param {string} id - The request ID to respond to.
 * @param {any} result - The result data to send.
 * @returns {void}
 */
function sendSuccessResponse(id, result) {
  if (!pluginState.connection.connected || !pluginState.connection.socket) {
    console.error("Cannot send response: socket not connected");
    return;
  }

  // Make sure we have a valid ID, otherwise log an error
  if (!id || id === "undefined") {
    console.error("Cannot send response: missing valid ID");
    console.info("Response data:", result);
    
    // Try to find an appropriate ID for this result
    if (result && typeof result === 'object' && result.command) {
      const commandType = result.command;
      id = findCommandId(commandType);
      console.log(`Using recovered ID for ${commandType}: ${id}`);
    }
    
    // If still no ID, cannot send response
    if (!id) {
      console.error("ID recovery failed, cannot send response");
      return;
    }
  }

  console.log(`Sending success response with ID: ${id}`);
  
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

/**
 * Sends an error response back to the WebSocket server.
 * Used for plugin-to-server communication on command failure.
 * @param {string} id - The request ID to respond to.
 * @param {string} errorMessage - The error message to send.
 * @returns {void}
 */
function sendErrorResponse(id, errorMessage) {
  if (!pluginState.connection.connected || !pluginState.connection.socket) {
    console.error("Cannot send error response: socket not connected");
    return;
  }
  
  // Make sure we have a valid ID
  if (!id || id === "undefined") {
    console.error("Cannot send error response: missing valid ID");
    
    // Try to get the most recent command ID of any type
    if (window.commandIdMap) {
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
        id = allCommands[0].id;
        console.log(`Using recovered ID for error: ${id}`);
      }
    }
    
    if (!id) {
      console.error("ID recovery failed, cannot send error response");
      return;
    }
  }

  console.log(`Sending error response with ID: ${id}`);
  
  pluginState.connection.socket.send(
    JSON.stringify({
      id,
      type: "message",
      channel: pluginState.connection.channel,
      message: {
        id,
        error: errorMessage,
      },
    })
  );
}

/**
 * Finds the most recent command ID for a given command type.
 * Searches window.commandIdMap for the latest entry.
 * @param {string} commandType - The command type to search for.
 * @returns {string|null} The most recent command ID, or null if not found.
 */
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

/**
 * Sends a progress update to the server for a long-running operation.
 * @param {object} progressData - Data describing the current progress. Should include a commandId property.
 * @returns {void}
 */
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
