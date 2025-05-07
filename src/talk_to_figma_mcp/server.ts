#!/usr/bin/env node

/**
 * Module: Talk to Figma MCP Server CLI
 *
 * @module server
 * @description
 *   Provides a CLI entry point for the Model Context Protocol server that interfaces
 *   with Figma via WebSocket and stdio transport.
 *
 * @example
 * # Start server with defaults
 * node ./dist/server.js
 *
 * @example
 * # Start server on custom host and port
 * node ./dist/server.js --server=figma.local --port=4080 --reconnect-interval=5000
 */

/**
 * @fileoverview CLI entry for the Talk to Figma MCP server module.
 * Provides a Model Context Protocol interface for Figma through stdio transport.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { connectToFigma } from "./server/websocket.js";
import { registerAllCommands } from "./commands/index.js";
import { logger } from "./utils/logger.js";

/**
 * Main entry point for the Talk to Figma MCP server.
 *
 * This server provides a Model Context Protocol interface to Figma,
 * allowing models like Claude to interact with Figma documents via
 * WebSocket connections.
 *
 * Features:
 * - Real-time communication with Figma
 * - Document inspection
 * - Creation and modification of Figma elements
 * - Auto-reconnection and robust error handling
 *
 * Command-line arguments:
 * @param {string} --server=<url>             Figma socket server host (default: localhost)
 * @param {number} --port=<port>              Figma socket server port (default: 3055)
 * @param {number} --reconnect-interval=<ms>  Base reconnect interval in milliseconds (default: 2000)
 *
 * @async
 * @function main
 * @returns {Promise<void>} Resolves when the MCP server is running
 * @throws Will log errors and exit with code 1 on startup failure
 *
 * @example
 * # Start server on custom host and port
 * node ./dist/server.js --server=figma.local --port=4080 --reconnect-interval=5000
 * @example
 * # Start server with defaults
 * node ./dist/server.js
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const serverArg = args.find(arg => arg.startsWith('--server='));
    const portArg = args.find(arg => arg.startsWith('--port='));
    const reconnectArg = args.find(arg => arg.startsWith('--reconnect-interval='));

    const serverUrl = serverArg ? serverArg.split('=')[1] : 'localhost';
    const defaultPort = portArg ? parseInt(portArg.split('=')[1], 10) : 3055;
    const reconnectInterval = reconnectArg ? parseInt(reconnectArg.split('=')[1], 10) : 2000;

    logger.info(`Starting Talk to Figma MCP server...`);
    logger.info(`Server URL: ${serverUrl}`);
    logger.info(`Port: ${defaultPort}`);
    logger.info(`Reconnect interval: ${reconnectInterval}ms`);

    // Create MCP server
    const server = new McpServer({
      name: "ClaudeTalkToFigmaMCP",
      version: "1.0.0",
      capabilities: { tools: {} }
    });

    // Register all commands
    registerAllCommands(server);

    try {
      // Connect to Figma socket server
      connectToFigma(serverUrl, defaultPort, reconnectInterval);
    } catch (error) {
      logger.warn(`Could not connect to Figma initially: ${error instanceof Error ? error.message : String(error)}`);
      logger.warn('Will try to connect when the first command is sent');
    }

    // Start the MCP server using stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Talk to Figma MCP server running on stdio');
  } catch (error) {
    logger.error(`Error starting Talk to Figma MCP server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the server
main().catch(error => {
  logger.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
