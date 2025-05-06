import { logger } from "./logger.js";

/**
 * Centralized error handling for the MCP server process.
 */
export class ErrorHandler {
  /**
   * Registers global process event handlers for uncaught errors and shutdown signals.
   */
  registerGlobalHandlers(): void {
    process.on("uncaughtException", (error: Error) => {
      logger.error(`Uncaught exception: ${error.message}`);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason: unknown) => {
      logger.error(`Unhandled promise rejection: ${reason instanceof Error ? reason.message : String(reason)}`);
      process.exit(1);
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully");
      process.exit(0);
    });
  }
}
