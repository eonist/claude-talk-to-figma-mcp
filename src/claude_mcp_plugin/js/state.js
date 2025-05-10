/**
 * Global state management for the Claude MCP Figma plugin.
 * Provides a central store for application state that can be accessed by all modules.
 */

// WebSocket connection state
const pluginState = {
  connection: {
    connected: false,
    socket: null,
    serverPort: 3055,
    pendingRequests: new Map(),
    channel: null,
    autoReconnect: true, // Track auto-reconnect setting, default to true
    reconnectAttempts: 0, // Track reconnection attempts
    maxReconnectAttempts: 5, // Maximum reconnection attempts
    reconnectTimer: null, // Timer for reconnection attempts
  },
  ui: {
    // UI state properties
  },
  // Add other shared state as needed
};
