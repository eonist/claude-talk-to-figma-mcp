/**
 * Client for connecting to and communicating with the MCP WebSocket server.
 * Provides functions to manage the WebSocket lifecycle and execute MCP tool commands.
 *
 * Exposed functions:
 * - connect(port: number): void
 * - disconnect(): void
 * - send(command: string, params: any): Promise<any>
 * - onMessage(handler: (msg: any) => void): void
 * - onProgress(handler: (data: ProgressData) => void): void
 *
 * @module modules/client
 * @example
 * import { connect, send, onMessage, onProgress } from './client';
 * // Establish connection
 * connect(3055);
 * // Listen for progress updates
 * onProgress(data => console.log('Progress:', data));
 * // Listen for responses
 * onMessage(msg => console.log('Message:', msg));
 * // Send a command
 * send('get_node_info', { nodeId: '123' }).then(console.log);
 */

/**
 * Progress update data for a running command.
 * @interface ProgressData
 * @property {string} commandId - Unique ID of the command.
 * @property {number} progress - Progress percentage (0–100).
 * @property {'started' | 'in_progress' | 'completed' | 'error'} status - Current status of the command.
 * @property {string} [message] - Optional status message.
 */
import ReconnectingWebSocket from 'reconnecting-websocket';
let autoReconnectEnabled = true;
export function setAutoReconnect(flag: boolean): void { autoReconnectEnabled = flag; }

export interface ProgressData {
  commandId: string;
  progress: number;
  status: 'started' | 'in_progress' | 'completed' | 'error';
  message?: string;
}

type Pending = { resolve: (res: any) => void; reject: (err: any) => void; };

let socket: any = null;
let channel: string;
let connected = false;
let serverPort = 3055;
const pending = new Map<string, Pending>();
const messageHandlers: Array<(msg: any) => void> = [];
const progressHandlers: Array<(data: ProgressData) => void> = [];

// Helpers
/**
 * Generates a unique identifier string.
 * @returns {string} A unique ID based on timestamp and random characters.
 * @example
 * // Generate a new ID:
 * const id = generateId();
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Generates a random channel name for WebSocket communication.
 * @returns {string} An 8-character random channel name.
 * @example
 * // Generate a channel identifier:
 * const channel = generateChannelName();
 */
function generateChannelName(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Connect to MCP WebSocket server
/**
 * Establishes a WebSocket connection to the MCP server.
 * @param {number} port - TCP port of the MCP WebSocket server.
 * @returns {void}
 * @example
 * connect(3055);
 */
export function connect(port: number): void {
  if (connected || socket) return;
  serverPort = port;
  socket = autoReconnectEnabled
    ? new ReconnectingWebSocket(`ws://localhost:${port}`, [], {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1500,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 4000,
        maxRetries: Infinity
      })
    : new (globalThis as any).WebSocket(`ws://localhost:${port}`);
  const chan = generateChannelName();
  channel = chan;

  socket.onopen = () => {
    socket!.send(JSON.stringify({ type: 'join', channel: chan }));
  };

  socket.onmessage = (event: MessageEvent) => {
    const raw = JSON.parse(event.data);
    // Handle progress updates
    if (raw.type === 'progress_update' && raw.message?.data) {
      progressHandlers.forEach((h) => h(raw.message.data));
    }
    // Handle responses to send()
    if (raw.message && raw.message.id && pending.has(raw.message.id)) {
      const { resolve, reject } = pending.get(raw.message.id)!;
      pending.delete(raw.message.id);
      raw.message.error ? reject(new Error(raw.message.error)) : resolve(raw.message.result);
      return;
    }
    // Pass other messages to UI
    if (raw.message) {
      messageHandlers.forEach((h) => h(raw.message));
    }
  };

  socket.onerror = () => {
    disconnect();
  };

  socket.onclose = () => {
    disconnect();
  };
  connected = true;
}

// Disconnect from server
/**
 * Closes the WebSocket connection to the MCP server.
 * @returns {void}
 * @example
 * disconnect();
 */
export function disconnect(): void {
  if (socket) {
    socket.close();
    socket = null;
  }
  connected = false;
}

// Send a command, returns a promise for the result
/**
 * Sends a command to the MCP server.
 * @param {string} command - Name of the command/tool to execute on the server.
 * @param {any} params - Parameters object for the command.
 * @returns {Promise<any>} Promise resolving to the command result or rejecting on error/timeout.
 * @example
 * send('get_node_info', { nodeId: '123' })
 *   .then(result => console.log(result))
 *   .catch(err => console.error(err));
 */
export function send(command: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!connected || !socket) {
      return reject(new Error('Not connected'));
    }
    const id = generateId();
    pending.set(id, { resolve, reject });
    socket.send(
      JSON.stringify({
        id,
        type: 'message',
        channel,
        message: { id, command, params },
      })
    );
    // Timeout
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error('Timeout'));
      }
    }, 30000);
  });
}

// Subscribe to incoming messages
/**
 * Registers a handler for incoming messages from the server.
 * @param {(msg: any) => void} fn - Callback invoked with each incoming message.
 * @returns {void}
 * @example
 * onMessage(msg => console.log('Message:', msg));
 */
export function onMessage(fn: (msg: any) => void): void {
  messageHandlers.push(fn);
}

// Subscribe to progress updates
/**
 * Registers a handler for progress updates.
 * @param {(data: ProgressData) => void} fn - Callback invoked with progress data.
 * @returns {void}
 * @example
 * onProgress(data => console.log('Progress:', data));
 */
export function onProgress(fn: (data: ProgressData) => void): void {
  progressHandlers.push(fn);
}
