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
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function generateChannelName(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Connect to MCP WebSocket server
export function connect(port: number): void {
  if (connected || socket) return;
  serverPort = port;
  socket = new (globalThis as any).WebSocket(`ws://localhost:${port}`);
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
export function disconnect(): void {
  if (socket) {
    socket.close();
    socket = null;
  }
  connected = false;
}

// Send a command, returns a promise for the result
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
export function onMessage(fn: (msg: any) => void): void {
  messageHandlers.push(fn);
}

// Subscribe to progress updates
export function onProgress(fn: (data: ProgressData) => void): void {
  progressHandlers.push(fn);
}
