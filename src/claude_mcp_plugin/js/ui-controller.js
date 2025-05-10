/**
 * UI Controller for the Claude MCP Figma plugin.
 * Handles UI state updates and interactions.
 */

// UI Elements
let portInput;
let connectButton;
let disconnectButton;
let connectionStatus;
let autoReconnectToggle;
let progressContainer;
let progressBar;
let progressMessage;
let progressStatus;
let progressPercentage;

// Initialize UI elements
function initUIElements() {
  portInput = document.getElementById("port");
  connectButton = document.getElementById("btn-connect");
  disconnectButton = document.getElementById("btn-disconnect");
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
    const port = parseInt(portInput.value, 10) || 3055;
    updateConnectionStatus(false, "Connecting...");
    connectionStatus.className = "status info";
    connectToServer(port);
  });

  disconnectButton.addEventListener("click", () => {
    updateConnectionStatus(false, "Disconnecting...");
    connectionStatus.className = "status info";
    disconnectFromServer();
  });
  
  // Set up auto-reconnect toggle listener
  autoReconnectToggle.addEventListener("change", () => {
    pluginState.connection.autoReconnect = autoReconnectToggle.checked;
    console.log(`Auto-reconnect ${pluginState.connection.autoReconnect ? 'enabled' : 'disabled'}`);
  });
  
  // Initialize auto-reconnect toggle state from pluginState
  autoReconnectToggle.checked = pluginState.connection.autoReconnect;
}

// Update connection status UI
function updateConnectionStatus(isConnected, message) {
  pluginState.connection.connected = isConnected;
  connectionStatus.innerHTML =
    message ||
    (isConnected
      ? "Connected to Claude MCP server"
      : "Not connected to Claude MCP server");
  connectionStatus.className = `status ${
    isConnected ? "connected" : "disconnected"
  }`;

  connectButton.disabled = isConnected;
  disconnectButton.disabled = !isConnected;
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

/**
 * Apply theme to the plugin UI - always using light theme
 * for compatibility with Figma
 * 
 * @param {string} theme - The theme from Figma (ignored, always using 'light')
 */
function applyThemeToUI(theme) {
  // Always use light theme regardless of Figma's theme
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add('theme-light');
}
