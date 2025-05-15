/**
 * Global state management for the Condut MCP Figma plugin.
 * Provides a central store for application state that can be accessed by all modules.
 */


/**
 * Global plugin state object for the Conduit MCP Figma plugin.
 * Stores WebSocket connection state, UI state, and other shared properties.
 *
 * @type {{
 *   connection: {
 *     connected: boolean,
 *     socket: WebSocket|null,
 *     serverPort: number,
 *     pendingRequests: Map<any, any>,
 *     channel: string|null,
 *     autoReconnect: boolean,
 *     reconnectAttempts: number,
 *     maxReconnectAttempts: number,
 *     inPersistentRetryMode: boolean,
 *     persistentRetryDelay: number,
 *     reconnectTimer: any,
 *     countdownTimer: any,
 *     countdownSeconds: number
 *   },
 *   ui: object
 * }}
 */
const pluginState = {
  connection: {
    connected: false,
    socket: null,
    serverPort: 3055,
    pendingRequests: new Map(),
    channel: null,
    autoReconnect: true, // Track auto-reconnect setting, default to true
    reconnectAttempts: 0, // Track reconnection attempts
    maxReconnectAttempts: 5, // Maximum reconnection attempts with backoff
    inPersistentRetryMode: false, // Track if we're in persistent retry mode (8 second interval)
    persistentRetryDelay: 8000, // Persistent retry delay in ms (8 seconds)
    reconnectTimer: null, // Timer for reconnection attempts
    countdownTimer: null, // Timer for updating the countdown display
    countdownSeconds: 0, // Current countdown value in seconds
  },
  ui: {
    // UI state properties
  },
  // Add other shared state as needed
};
