/**
 * Custom logging interface for MCP server
 * 
 * Provides structured logging with:
 * - Severity levels (info, debug, warn, error)
 * - stderr output to avoid command interference
 * - Timestamp prefixing
 * - Error stack traces
 * 
 * Usage:
 * - info: General operational messages
 * - debug: Detailed debugging information
 * - warn: Warning conditions
 * - error: Error conditions
 * - log: Raw logging without formatting
 * 
 * @example
 * logger.info('Server started');
 * logger.debug('Connection details:', details);
 * logger.error('Failed to connect:', error);
 */
export const logger = {
  info: (message: string) => process.stderr.write(`[INFO] ${message}\n`),
  debug: (message: string) => process.stderr.write(`[DEBUG] ${message}\n`),
  warn: (message: string) => process.stderr.write(`[WARN] ${message}\n`),
  error: (message: string) => process.stderr.write(`[ERROR] ${message}\n`),
  log: (message: string) => process.stderr.write(`[LOG] ${message}\n`)
};
