import WebSocket from "ws";
import { logger } from "./logger.js";

interface ReconnectOptions {
  maxReconnectAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
}

export class ReconnectingWebSocket {
  private url: string;
  private options: ReconnectOptions;
  private ws: WebSocket | null = null;
  private attempts = 0;
  private listeners: { [event: string]: Function[] } = {};

  constructor(url: string, options: ReconnectOptions = {}) {
    this.url = url;
    this.options = {
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
      initialDelay: options.initialDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
    };
    this.connect();
  }

  private connect(): void {
    logger.info(`ReconnectingWebSocket: connecting to ${this.url}`);
    this.ws = new WebSocket(this.url);

    this.ws.on("open", (event: any) => {
      logger.info("ReconnectingWebSocket: connection opened");
      this.attempts = 0;
      this.emit("open", event);
    });

    this.ws.on("message", (data: any) => {
      this.emit("message", data);
    });

    this.ws.on("error", (error: any) => {
      this.emit("error", error);
    });

    this.ws.on("close", (code: any, reason: any) => {
      this.emit("close", code, reason);
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    if (this.attempts >= (this.options.maxReconnectAttempts!)) {
      logger.error("ReconnectingWebSocket: max reconnect attempts reached");
      return;
    }
    const delay = Math.min(
      this.options.initialDelay! * Math.pow(1.5, this.attempts),
      this.options.maxDelay!
    );
    logger.info(`ReconnectingWebSocket: reconnecting in ${delay}ms (attempt ${this.attempts + 1})`);
    this.attempts++;
    setTimeout(() => this.connect(), delay);
  }

  send(data: string): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  close(code?: number, reason?: string): void {
    if (this.ws) {
      this.ws.close(code, reason);
    }
  }

  terminate(): void {
    if (this.ws) {
      this.ws.terminate();
    }
  }

  get readyState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSING;
  }

  on(event: string, listener: Function): this {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(listener);
    return this;
  }

  removeAllListeners(): void {
    this.listeners = {};
  }

  private emit(event: string, ...args: any[]): void {
    (this.listeners[event] || []).forEach(fn => fn(...args));
  }
}
