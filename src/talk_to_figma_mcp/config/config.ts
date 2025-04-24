/**
 * Configuración global para Claude Talk to Figma MCP
 */

// WebSocket configuration
export const WS_DEFAULT_PORT = 3055;
export const WS_RECONNECT_INTERVAL = 2000; // ms
export const WS_CONNECTION_TIMEOUT = 10000; // ms
export const WS_REQUEST_TIMEOUT = 30000; // ms

// Server configuration
export const SERVER_NAME = "ClaudeTalkToFigmaMCP";
export const SERVER_VERSION = "0.4.0";

// Logging levels
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO", 
  WARN = "WARN",
  ERROR = "ERROR"
}

// Default channel
export const DEFAULT_CHANNEL = "";