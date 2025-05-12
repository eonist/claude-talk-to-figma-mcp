/**
 * Logging utilities module for the Figma MCP server.
 * Provides structured, severity-based logging with timestamp prefixes
 * and stderr output to avoid interfering with stdout-based protocols.
 *
 * Exposed functions:
 * - info(message: string): void
 * - debug(message: string): void
 * - warn(message: string): void
 * - error(message: string): void
 * - log(message: string): void
 *
 * @module utils/logger
 * @example
 * import { logger } from './logger.js';
 * logger.info('Server started successfully');
 * logger.debug(`Connected on port ${port}`);
 */
export const logger = {
  info: (message: string) => process.stderr.write(`[INFO] ${message}\n`),
  debug: (message: string) => process.stderr.write(`[DEBUG] ${message}\n`),
  warn: (message: string) => process.stderr.write(`[WARN] ${message}\n`),
  error: (message: string) => process.stderr.write(`[ERROR] ${message}\n`),
  log: (message: string) => process.stderr.write(`[LOG] ${message}\n`)
};
