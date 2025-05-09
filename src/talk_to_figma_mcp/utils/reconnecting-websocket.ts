import WebSocket from "ws";
import { logger } from "./logger.js";
import http from "http";
import https from "https";

interface ReconnectOptions {
  maxReconnectAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  heartbeatIntervalMs?: number;
  heartbeatTimeoutMs?: number;
}

export class ReconnectingWebSocket {
  private url: string;
  private options: Required<ReconnectOptions>;
  private ws: WebSocket | null = null;
  private attempts = 0;
  private listeners: { [event: string]: Function[] } = {};
  private heartbeatIntervalId: NodeJS.Timeout | null = null;
  private lastPongTimestamp: number = Date.now();

  constructor(url: string, options: ReconnectOptions = {}) {
    this.url = url;
    this.options = {
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
      initialDelay: options.initialDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? 10000,
      heartbeatTimeoutMs: options.heartbeatTimeoutMs ?? 30000,
    };
    this.connect();
  }

  private connect(): void {
    logger.info(`ReconnectingWebSocket: connecting to ${this.url}`);
    this.ws = new WebSocket(this.url);

    this.ws.on("open", (event: any) => {
      logger.info("ReconnectingWebSocket: connection opened");
      this.attempts = 0;
      this.lastPongTimestamp = Date.now();
      this.startHeartbeat();
      this.emit("open", event);
    });

    this.ws.on("message", (data: any) => {
      this.emit("message", data);
    });

    this.ws.on("pong", () => {
      this.lastPongTimestamp = Date.now();
      logger.debug("ReconnectingWebSocket: pong received");
    });

    this.ws.on("error", (error: any) => {
      this.emit("error", error);
    });

    this.ws.on("close", (code: any, reason: any) => {
      this.stopHeartbeat();
      this.emit("close", code, reason);
      this.scheduleReconnect();
    });
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    const { heartbeatIntervalMs, heartbeatTimeoutMs } = this.options;
    this.heartbeatIntervalId = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        logger.debug("ReconnectingWebSocket: sending ping");
        this.ws.ping();
        if (Date.now() - this.lastPongTimestamp > heartbeatTimeoutMs) {
          logger.error("ReconnectingWebSocket: heartbeat timeout, terminating connection");
          this.ws.terminate();
        }
      }
    }, heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.attempts >= this.options.maxReconnectAttempts) {
      logger.error("ReconnectingWebSocket: max reconnect attempts reached");
      return;
    }
    const urlObj = new URL(this.url);
    const hostname = urlObj.hostname;
    const port = urlObj.port || (urlObj.protocol === "wss:" ? "443" : "80");
    const baseDelay = Math.min(
      this.options.initialDelay * Math.pow(1.5, this.attempts),
      this.options.maxDelay
    );
    this.attempts++;
    this.healthCheck(hostname, port)
      .then((ok) => {
        const delay = ok ? baseDelay : baseDelay + this.options.initialDelay;
        logger.info(`ReconnectingWebSocket: reconnecting in ${delay}ms (attempt ${this.attempts})`);
        setTimeout(() => this.connect(), delay);
      })
      .catch(() => {
        const delay = baseDelay + this.options.initialDelay;
        logger.info(`ReconnectingWebSocket: health check failed, reconnecting in ${delay}ms (attempt ${this.attempts})`);
        setTimeout(() => this.connect(), delay);
      });
  }

  private healthCheck(hostname: string, port: string): Promise<boolean> {
    return new Promise((resolve) => {
      const protocol = this.url.startsWith("wss://") ? https : http;
      const req = protocol.get(
        { hostname, port: Number(port), path: "/status", timeout: 5000 },
        (res) => {
          resolve(res.statusCode === 200);
        }
      );
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
    });
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
    (this.listeners[event] || []).forEach((fn) => fn(...args));
  }
}
