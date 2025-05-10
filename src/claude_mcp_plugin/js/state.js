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
  },
  ui: {
    // UI state properties
  },
  // Add other shared state as needed
};
