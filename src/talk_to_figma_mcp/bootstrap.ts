import { serverUrl, port, reconnectInterval } from "./cli.js";
import { ErrorHandler } from "./utils/error-handler.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { connectToFigma } from "./server/websocket.js";
import { registerAllCommands } from "./commands/index.js";
import { logger } from "./utils/logger.js";

/**
 * Bootstraps and starts the Talk to Figma MCP server.
 */
export async function initializeServer(): Promise<void> {
  // Register global error and shutdown handlers
  const errorHandler = new ErrorHandler();
  errorHandler.registerGlobalHandlers();

  // Log configuration
  logger.info(`Starting Talk to Figma MCP server...`);
  logger.info(`Server URL: ${serverUrl}`);
  logger.info(`Port: ${port}`);
  logger.info(`Reconnect interval: ${reconnectInterval}ms`);

  // Create MCP server
  const server = new McpServer({
    name: "ClaudeTalkToFigmaMCP",
    version: "1.0.0",
    capabilities: { tools: {} }
  });

  // Register all Figma commands
  registerAllCommands(server);

  // Attempt initial connection to Figma
  try {
    connectToFigma(serverUrl, port, reconnectInterval);
  } catch (error) {
    logger.warn(
      `Could not connect to Figma initially: ${error instanceof Error ? error.message : String(error)}`
    );
    logger.warn("Will try to connect when the first command is sent");
  }

  // Start MCP server over stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Talk to Figma MCP server running on stdio");
}
