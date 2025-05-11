import WebSocket from "ws";
import { logger } from "./logger.js";
import http from "http";
import https from "https";

/**
 * Connection states for explicit state management
 */
enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING'
}

interface ReconnectOptions {
  maxReconnectAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  heartbeatIntervalMs?: number;
  heartbeatTimeoutMs?: number;
  jitter?: number; // Random jitter factor (0-1) to add to reconnection delay
  healthCheckEnabled?: boolean; // Whether to perform health checks at all
  healthCheckTimeoutMs?: number; // Timeout for health checks
  healthCheckPath?: string; // Path to use for health checks
  healthCheckMinInterval?: number; // Minimum time between health checks in ms
  healthCheckAfterAttempts?: number; // Only perform health checks after X attempts
  progressiveBackoff?: boolean; // Whether to increase backoff more aggressively over time
}

/**
 * WebSocket wrapper with automatic reconnection capabilities
 * and improved health checking
 */
export class ReconnectingWebSocket {
  private url: string;
  private options: Required<ReconnectOptions>;
  private ws: WebSocket | null = null;
  private attempts = 0;
  private consecutiveFailures = 0;
  private listeners: { [event: string]: Function[] } = {};
  private heartbeatIntervalId: NodeJS.Timeout | null = null;
  private lastPongTimestamp: number = Date.now();
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private lastHealthCheckTime: number = 0;
  private lastHealthCheckResult: boolean = false;
  private disconnectedSince: number = 0;

  /**
   * Creates a new reconnecting WebSocket instance
   */
  constructor(url: string, options: ReconnectOptions = {}) {
    this.url = url;
    this.options = {
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
      initialDelay: options.initialDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? 10000,
      heartbeatTimeoutMs: options.heartbeatTimeoutMs ?? 30000,
      jitter: options.jitter ?? 0.1, // 10% jitter by default
      healthCheckEnabled: options.healthCheckEnabled ?? false, // Disable health checks by default to reduce CPU usage
      healthCheckTimeoutMs: options.healthCheckTimeoutMs ?? 5000,
      healthCheckPath: options.healthCheckPath ?? "/status",
      healthCheckMinInterval: options.healthCheckMinInterval ?? 30000, // At most one health check per 30 seconds
      healthCheckAfterAttempts: options.healthCheckAfterAttempts ?? 2, // Only do health checks after 2 failed attempts
      progressiveBackoff: options.progressiveBackoff ?? true // Use progressive backoff by default
    };
    this.connect();
  }

  /**
   * Initiates a connection to the WebSocket server
   */
  private connect(): void {
    // Don't try to connect if we're already connecting or connected
    if (this.connectionState === ConnectionState.CONNECTING || 
        this.connectionState === ConnectionState.CONNECTED) {
      return;
    }
    
    this.setConnectionState(ConnectionState.CONNECTING);
    logger.info(`ReconnectingWebSocket: connecting to ${this.url}`);
    
    try {
      this.ws = new WebSocket(this.url);

      this.ws.on("open", (event: any) => {
        this.setConnectionState(ConnectionState.CONNECTED);
        logger.info("ReconnectingWebSocket: connection opened");
        this.attempts = 0;
        this.consecutiveFailures = 0;
        this.disconnectedSince = 0;
        this.lastPongTimestamp = Date.now();
        this.startHeartbeat();
        this.emit("open", event);
      });

      this.ws.on("message", (data: any) => {
        this.emit("message", data);
      });

      this.ws.on("pong", () => {
        this.lastPongTimestamp = Date.now();
        // Skip logging pongs completely - they happen frequently and don't provide much value
        // This significantly reduces logging overhead during active connections
      });

      this.ws.on("error", (error: any) => {
        logger.error(`ReconnectingWebSocket: error: ${error.message || 'Unknown error'}`);
        this.emit("error", error);
      });

      this.ws.on("close", (code: number, reason: string) => {
        this.setConnectionState(ConnectionState.DISCONNECTED);
        this.stopHeartbeat();
        logger.info(`ReconnectingWebSocket: closed with code ${code}, reason: ${reason || 'none'}`);
        this.emit("close", code, reason);
        this.scheduleReconnect();
      });
    } catch (error) {
      logger.error(`ReconnectingWebSocket: error during connection setup: ${(error as Error).message}`);
      this.setConnectionState(ConnectionState.DISCONNECTED);
      this.scheduleReconnect();
    }
  }

  /**
   * Updates the connection state and emits a state change event
   */
  private setConnectionState(newState: ConnectionState): void {
    if (this.connectionState !== newState) {
      logger.debug(`ReconnectingWebSocket: state changed from ${this.connectionState} to ${newState}`);
      this.connectionState = newState;
      this.emit("stateChange", newState);
    }
  }

  /**
   * Starts the heartbeat mechanism to keep the connection alive and detect failures
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    const { heartbeatIntervalMs, heartbeatTimeoutMs } = this.options;
    
    // Counter to reduce logging frequency
    let pingCounter = 0;
    
    this.heartbeatIntervalId = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Only log every 3rd ping to reduce CPU usage from logging
        if (pingCounter % 3 === 0) {
          logger.debug("ReconnectingWebSocket: sending ping");
        }
        pingCounter++;
        
        this.ws.ping();
        
        // Check if we've received a pong recently
        const timeSinceLastPong = Date.now() - this.lastPongTimestamp;
        if (timeSinceLastPong > heartbeatTimeoutMs) {
          logger.error(`ReconnectingWebSocket: heartbeat timeout (${timeSinceLastPong}ms), terminating connection`);
          this.ws.terminate();
        }
      }
    }, heartbeatIntervalMs);
  }

  /**
   * Stops the heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  /**
   * Cancel any pending reconnect attempt
   */
  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Schedules a reconnection attempt with exponential backoff and jitter
   */
  private scheduleReconnect(): void {
    this.cancelReconnect();
    
    // Track disconnection time for better backoff handling
    if (this.disconnectedSince === 0) {
      this.disconnectedSince = Date.now();
      this.consecutiveFailures = 0;
    }
    
    if (this.attempts >= this.options.maxReconnectAttempts) {
      logger.error("ReconnectingWebSocket: max reconnect attempts reached");
      this.emit("maxAttemptsReached", this.attempts);
      return;
    }
    
    this.setConnectionState(ConnectionState.RECONNECTING);
    this.attempts++;
    this.consecutiveFailures++;
    
    // Calculate base delay with exponential backoff
    let factor = Math.pow(1.5, this.attempts - 1);
    
    // If progressive backoff is enabled and we've been disconnected for a while,
    // increase the backoff factor to reduce CPU usage on prolonged disconnections
    if (this.options.progressiveBackoff) {
      const disconnectionDuration = Date.now() - this.disconnectedSince;
      // After 30 seconds, apply more aggressive backoff
      if (disconnectionDuration > 30000) {
        factor = Math.pow(2.0, this.attempts - 1);
      }
      // After 2 minutes, apply even more aggressive backoff
      if (disconnectionDuration > 120000) {
        factor = Math.pow(3.0, this.attempts - 1);
      }
    }
    
    const baseDelay = Math.min(
      this.options.initialDelay * factor,
      this.options.maxDelay
    );
    
    // Add jitter to prevent reconnection storms
    const jitter = 1 - this.options.jitter + (Math.random() * this.options.jitter * 2);
    const delay = Math.floor(baseDelay * jitter);
    
    // Determine if we should perform a health check
    const shouldRunHealthCheck = 
      this.options.healthCheckEnabled && 
      (this.consecutiveFailures >= this.options.healthCheckAfterAttempts) &&
      (Date.now() - this.lastHealthCheckTime >= this.options.healthCheckMinInterval);
    
    // Use cached health check result if health check is skipped but we have run it before
    const skipHealthCheckWithCache = 
      this.options.healthCheckEnabled && 
      !shouldRunHealthCheck && 
      this.lastHealthCheckTime > 0;
    
    // Schedule reconnection based on health check or directly
    if (shouldRunHealthCheck) {
      const urlObj = new URL(this.url);
      const hostname = urlObj.hostname;
      const port = urlObj.port || (urlObj.protocol === "wss:" ? "443" : "80");
      
      // Only log health check attempts occasionally to reduce logging
      if (this.attempts % 2 === 1 || this.attempts <= 2) {
        logger.info(`ReconnectingWebSocket: checking server health (attempt ${this.attempts})`);
      }
      
      this.healthCheck(hostname, port)
        .then((healthStatus) => {
          this.lastHealthCheckResult = healthStatus;
          
          // Only log outcomes occasionally
          if (this.attempts % 2 === 1 || this.attempts <= 2) {
            if (healthStatus) {
              logger.info(`ReconnectingWebSocket: health check successful, reconnecting in ${delay}ms`);
            } else {
              logger.warn(`ReconnectingWebSocket: health check failed, retrying in ${delay}ms`);
            }
          }
          
          this.scheduleReconnectTimer(delay);
        })
        .catch(() => {
          // Handle any unhandled promise rejections
          this.lastHealthCheckResult = false;
          this.scheduleReconnectTimer(delay);
        });
    } else {
      // Skip health check to save CPU
      if (this.attempts % 3 === 0 || this.attempts <= 2) {
        if (skipHealthCheckWithCache) {
          logger.info(`ReconnectingWebSocket: using cached health status (${this.lastHealthCheckResult ? 'up' : 'down'}), reconnecting in ${delay}ms (attempt ${this.attempts})`);
        } else {
          logger.info(`ReconnectingWebSocket: reconnecting in ${delay}ms (attempt ${this.attempts})`);
        }
      }
      
      this.scheduleReconnectTimer(delay);
    }
  }
  
  /**
   * Schedule the actual reconnection timer
   */
  private scheduleReconnectTimer(delay: number): void {
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * Performs a health check on the server to determine if it's reachable
   * Returns a promise that resolves to a boolean indicating server health
   */
  private healthCheck(hostname: string, port: string): Promise<boolean> {
    // Update last health check time to rate limit checks
    this.lastHealthCheckTime = Date.now();
    
    return new Promise((resolve) => {
      // If health checks are disabled, immediately return success to avoid HTTP requests
      if (!this.options.healthCheckEnabled) {
        resolve(true);
        return;
      }
      
      const protocol = this.url.startsWith("wss://") ? https : http;
      const timeout = this.options.healthCheckTimeoutMs;
      
      // Reduce debug logging frequency to reduce CPU usage
      if (this.attempts % 3 === 0 || this.attempts <= 2) {
        logger.debug(`ReconnectingWebSocket: health check to ${hostname}:${port}${this.options.healthCheckPath}`);
      }
      
      try {
        const req = protocol.get(
          { 
            hostname, 
            port: Number(port), 
            path: this.options.healthCheckPath,
            timeout: timeout,
            headers: {
              'User-Agent': 'ReconnectingWebSocket/1.0'
            }
          },
          (res) => {
            // Check for redirect
            if (res.statusCode && (res.statusCode >= 300 && res.statusCode < 400) && res.headers.location) {
              // Only log occasionally
              if (this.attempts % 3 === 0) {
                logger.debug(`ReconnectingWebSocket: health check redirected to ${res.headers.location}`);
              }
              resolve(true); // Server is responsive even if it redirects
            } else {
              const isHealthy = res.statusCode === 200;
              // Only log occasionally
              if (this.attempts % 3 === 0 || this.attempts <= 2) {
                logger.debug(`ReconnectingWebSocket: health check status code: ${res.statusCode}`);
              }
              resolve(isHealthy);
            }
            
            // Consume response data to free up memory
            res.resume();
          }
        );
        
        req.on("error", (err) => {
          // Only log occasionally
          if (this.attempts % 3 === 0 || this.attempts <= 2) {
            logger.debug(`ReconnectingWebSocket: health check error: ${err.message}`);
          }
          resolve(false);
        });
        
        req.on("timeout", () => {
          // Only log occasionally
          if (this.attempts % 3 === 0 || this.attempts <= 2) {
            logger.debug(`ReconnectingWebSocket: health check timed out after ${timeout}ms`);
          }
          req.destroy();
          resolve(false);
        });
        
        // Add a catchall error handler
        req.on("abort", () => {
          // Only log occasionally
          if (this.attempts % 3 === 0 || this.attempts <= 2) {
            logger.debug("ReconnectingWebSocket: health check request aborted");
          }
          resolve(false);
        });
      } catch (error) {
        logger.error(`ReconnectingWebSocket: health check exception: ${(error as Error).message}`);
        resolve(false);
      }
    });
  }

  /**
   * Sends data through the WebSocket if it's open
   * Returns true if the data was sent, false otherwise
   */
  send(data: string): boolean {
    if (this.isConnected()) {
      try {
        this.ws!.send(data);
        return true;
      } catch (error) {
        logger.error(`ReconnectingWebSocket: error sending data: ${(error as Error).message}`);
        return false;
      }
    }
    return false;
  }

  /**
   * Gracefully closes the WebSocket connection
   */
  close(code?: number, reason?: string): void {
    this.cancelReconnect();
    if (this.ws) {
      try {
        this.ws.close(code, reason);
      } catch (error) {
        logger.error(`ReconnectingWebSocket: error closing connection: ${(error as Error).message}`);
        this.ws.terminate();
      }
    }
  }

  /**
   * Forcefully terminates the WebSocket connection
   */
  terminate(): void {
    this.cancelReconnect();
    if (this.ws) {
      try {
        this.ws.terminate();
      } catch (error) {
        logger.error(`ReconnectingWebSocket: error terminating connection: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Returns the current WebSocket readyState
   */
  get readyState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSING;
  }

  /**
   * Checks if the WebSocket is currently connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Gets the current connection state
   */
  get state(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Registers an event listener
   */
  on(event: string, listener: Function): this {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(listener);
    return this;
  }

  /**
   * Removes all event listeners
   */
  removeAllListeners(): void {
    this.listeners = {};
  }

  /**
   * Emits an event to all registered listeners
   */
  private emit(event: string, ...args: any[]): void {
    (this.listeners[event] || []).forEach((fn) => {
      try {
        fn(...args);
      } catch (error) {
        logger.error(`ReconnectingWebSocket: error in ${event} event handler: ${(error as Error).message}`);
      }
    });
  }
}
