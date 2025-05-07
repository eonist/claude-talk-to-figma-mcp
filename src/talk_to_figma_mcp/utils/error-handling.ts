import { logger } from "./logger.js";

/**
 * Error handling utilities for Figma MCP commands.
 *
 * Provides custom error classes and a helper to standardize tool errors.
 *
 * @module utils/error-handling
 * @example
 * import { handleToolError, FigmaMCPError, TimeoutError } from './error-handling';
 * try {
 *   // tool logic...
 * } catch (err) {
 *   return handleToolError(err, 'moduleName', 'commandName');
 * }
 */

/**
 * Standard error response shape for tools.
export interface ToolErrorResponse {
  content: Array<{ type: string; text: string }>;
  error: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

/**
 * Base class for all Figma-MCP errors.
 */
export class FigmaMCPError extends Error {
  code: string;
  recoverable: boolean;
  context?: any;

  constructor(
    message: string,
    code = "UNKNOWN_ERROR",
    recoverable = false,
    context?: any
  ) {
    super(message);
    this.code = code;
    this.recoverable = recoverable;
    this.context = context;
  }
}

/**
 * Specific timeout error (recoverable).
 */
export class TimeoutError extends FigmaMCPError {
  constructor(message: string, context?: any) {
    super(message, "TIMEOUT_ERROR", true, context);
  }
}

/**
 * Specific validation error (unrecoverable).
 */
export class ValidationError extends FigmaMCPError {
  constructor(message: string, context?: any) {
    super(message, "VALIDATION_ERROR", false, context);
  }
}

/**
 * Handle any error thrown in a tool, log it, and return a standardized response.
 */
export function handleToolError(
  err: any,
  moduleName: string,
  commandName: string
) {
  let code = "UNKNOWN_ERROR";
  let message = err.message ?? String(err);
  let recoverable = false;
  let context = (err instanceof FigmaMCPError && err.context) || {};

  if (err instanceof FigmaMCPError) {
    code = err.code;
    recoverable = err.recoverable;
    message = err.message;
  }

  logger.error(
    `[${moduleName}][${commandName}] ${code}: ${message} | context: ${JSON.stringify(context)}`
  );

  return {
    content: [{ type: "text", text: `Error (${code}): ${message}` }],
    isError: true
  };
}
