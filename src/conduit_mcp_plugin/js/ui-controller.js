/**
 * UI Controller for the Conduit MCP Figma plugin.
 * Handles UI state updates and interactions.
 */


/**
 * UI element references for the plugin UI.
 * @type {HTMLElement|undefined}
 */
let portInput;
let connectButton;
let copyChannelButton;
let connectionStatus;
let autoReconnectToggle;
let progressContainer;
let progressBar;
let progressMessage;
let progressStatus;
let progressPercentage;

/**
 * Initializes UI elements and sets up event listeners for the plugin UI.
 */
function initUIElements() {
  portInput = document.getElementById("port");
  connectButton = document.getElementById("btn-connect");
  copyChannelButton = document.getElementById("btn-copy-channel");
  connectionStatus = document.getElementById("connection-status");
  autoReconnectToggle = document.getElementById("auto-reconnect-toggle");
  
  // Progress tracking elements
  progressContainer = document.getElementById("progress-container");
  progressBar = document.getElementById("progress-bar");
  progressMessage = document.getElementById("progress-message");
  progressStatus = document.getElementById("progress-status");
  progressPercentage = document.getElementById("progress-percentage");
  
  // Set up event listeners
  connectButton.addEventListener("click", () => {
    if (pluginState.connection.connected) {
      // If connected, disconnect
      updateConnectionStatus(false, "Disconnecting...");
      connectionStatus.className = "status info";
      disconnectFromServer();
    } else {
      // If disconnected, connect
      const port = parseInt(portInput.value, 10) || 3055;
      updateConnectionStatus(false, "Connecting...");
      connectionStatus.className = "status info";
      connectToServer(port);
    }
  });
  
  copyChannelButton.addEventListener("click", () => {
    console.log("Copy channel button clicked");
    
    if (pluginState.connection.channel) {
      const channelId = pluginState.connection.channel;
      console.log(`Attempting to copy channel ID: "${channelId}"`);
      
      // Create temporary textarea element
      const textarea = document.createElement('textarea');
      // Position off-screen
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      // Set value and make read-only to prevent mobile keyboard
      textarea.value = channelId;
      textarea.setAttribute('readonly', '');
      
      // Add to DOM
      document.body.appendChild(textarea);
      
      // Select the text
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length); // For mobile devices
      
      let copySuccess = false;
      try {
        // Execute copy command
        copySuccess = document.execCommand('copy');
        console.log(copySuccess ? "✓ Successfully copied to clipboard using execCommand" : "❌ Copy command failed");
        
        // Send notification to Figma
        console.log("Sending notification to Figma");
        parent.postMessage(
          {
            pluginMessage: {
              type: "notify",
              message: `Copied channel ID: ${channelId}`,
            },
          },
          "*"
        );
      } catch (err) {
        console.error("❌ Failed to copy channel ID:", err);
      }
      
      // Clean up
      document.body.removeChild(textarea);
    } else {
      console.warn("No channel ID available to copy");
    }
  });
  
  // Set up auto-reconnect toggle listener
  autoReconnectToggle.addEventListener("change", () => {
    pluginState.connection.autoReconnect = autoReconnectToggle.checked;
    console.log(`Auto-reconnect ${pluginState.connection.autoReconnect ? 'enabled' : 'disabled'}`);
    
    // Trigger connection/disconnection based on toggle state
    if (autoReconnectToggle.checked) {
      // If auto-connect toggled ON and not connected, connect immediately
      if (!pluginState.connection.connected) {
        const port = parseInt(portInput.value, 10) || 3055;
        updateConnectionStatus(false, "Auto-connecting...");
        connectionStatus.className = "status info";
        connectToServer(port);
      }
    } else {
      // Stop any ongoing reconnection attempts
      if (pluginState.connection.reconnectTimer) {
        clearTimeout(pluginState.connection.reconnectTimer);
        pluginState.connection.reconnectTimer = null;
        
        if (pluginState.connection.countdownTimer) {
          clearInterval(pluginState.connection.countdownTimer);
          pluginState.connection.countdownTimer = null;
        }
        
        pluginState.connection.reconnectAttempts = 0;
        pluginState.connection.inPersistentRetryMode = false;
      }
      
      // Update status message with channel info if connected
      if (pluginState.connection.connected && pluginState.connection.channel) {
        updateConnectionStatus(true, 
          `Connected: Server port ${pluginState.connection.serverPort}, Channel ${pluginState.connection.channel}`);
      } else {
        // Just use the default message for the current connection state
        updateConnectionStatus(pluginState.connection.connected);
      }
    }
    
    // Update connect button state without updating the status message
    connectButton.disabled = autoReconnectToggle.checked;
  });
  
  // Initialize auto-reconnect toggle state from pluginState
  autoReconnectToggle.checked = pluginState.connection.autoReconnect;
  
  // Initialize connect button state based on auto-reconnect setting
  // This ensures the button is properly disabled when auto-reconnect is enabled
  updateConnectionStatus(pluginState.connection.connected);
  
  // If auto-reconnect is enabled at startup, attempt to connect immediately
  if (pluginState.connection.autoReconnect && !pluginState.connection.connected) {
    const port = parseInt(portInput.value, 10) || 3055;
    updateConnectionStatus(false, "Auto-connecting on startup...");
    connectionStatus.className = "status info";
    connectToServer(port);
  }
}

// Update connection status UI
function updateConnectionStatus(isConnected, message) {
  pluginState.connection.connected = isConnected;
  
  // Create default message based on connection state
  let defaultMessage = "";
  if (isConnected) {
    if (pluginState.connection.channel) {
      // If connected and we have a channel, show detailed information
      defaultMessage = `Connected: Server port ${pluginState.connection.serverPort}, Channel ${pluginState.connection.channel}`;
    } else {
      // If connected but no channel yet, show simple message
      defaultMessage = "Connected";
    }
  } else {
    // Not connected
    defaultMessage = "Not connected";
  }
  
  // Use provided message or default
  connectionStatus.innerHTML = message || defaultMessage;
  connectionStatus.className = `status ${
    isConnected ? "connected" : "disconnected"
  }`;

  // Update connect button text based on connection status
  connectButton.textContent = isConnected ? "Disconnect" : "Connect";
  
  // Update copy channel button text based on connection status
  copyChannelButton.textContent = isConnected ? "Copy channel-id" : "Channel id not available";
  
  // Disable connect button if auto-reconnect is enabled, regardless of connection status
  connectButton.disabled = pluginState.connection.autoReconnect;
  
  copyChannelButton.disabled = !isConnected;
  portInput.disabled = isConnected;
}

// Update progress UI
function updateProgressUI(progressData) {
  // Show progress container if hidden
  progressContainer.classList.remove("hidden");
  
  // Update progress bar
  const progress = progressData.progress || 0;
  progressBar.style.width = `${progress}%`;
  progressPercentage.textContent = `${progress}%`;
  
  // Update message
  progressMessage.textContent = progressData.message || "Operation in progress";
  
  // Update status text based on operation state
  if (progressData.status === 'started') {
    progressStatus.textContent = "Started";
    progressStatus.className = "";
  } else if (progressData.status === 'in_progress') {
    progressStatus.textContent = "In Progress";
    progressStatus.className = "";
  } else if (progressData.status === 'completed') {
    progressStatus.textContent = "Completed";
    progressStatus.className = "operation-complete";
    
    // Hide progress container after 5 seconds
    setTimeout(() => {
      progressContainer.classList.add("hidden");
    }, 5000);
  } else if (progressData.status === 'error') {
    progressStatus.textContent = "Error";
    progressStatus.className = "operation-error";
  }
}

// Reset progress UI
function resetProgressUI() {
  progressContainer.classList.add("hidden");
  progressBar.style.width = "0%";
  progressMessage.textContent = "No operation in progress";
  progressStatus.textContent = "Not started";
  progressStatus.className = "";
  progressPercentage.textContent = "0%";
}

// Theme handling is now managed by Figma's built-in themeColors feature
// which applies CSS variables and classes automatically
