import { registerVectorTools } from "./vector-creation-tools.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

/**
 * Registers all vector-related commands and tools with the MCP server.
 * 
 * This function serves as the main entry point for vector functionality,
 * delegating to specific tool registration functions.
 * 
 * @param server - The MCP server instance to register tools with
 * @param figmaClient - The Figma client instance for API interactions
 * @returns void
 * 
 * @example
 * ```
 * const server = new McpServer();
 * const figmaClient = new FigmaClient(apiKey);
 * registerVectorCommands(server, figmaClient);
 * ```
 */
export function registerVectorCommands(server: McpServer, figmaClient: FigmaClient): void {
  registerVectorTools(server, figmaClient);
}
// Re-export for granular imports if needed
// export {
//    registerVectorCreationCommands
// };
