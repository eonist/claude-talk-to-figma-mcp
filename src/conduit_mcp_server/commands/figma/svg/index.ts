import { registerSvgCreationCommands } from "./svg-creation-tools.js";
import { registerSvgVectorTool } from "./vector-tools.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

/**
 * Registers all SVG-related commands and tools on the MCP server.
 * 
 * This function serves as the main entry point for registering SVG functionality,
 * including both vector extraction and creation tools. It consolidates the registration
 * of SVG vector tools and creation commands into a single convenient function.
 * 
 * @param {McpServer} server - The MCP server instance where tools will be registered
 * @param {FigmaClient} figmaClient - The Figma client instance used for API communication
 * 
 * @returns {void} This function does not return a value
 * 
 * @example
 * ```
 * const server = new McpServer();
 * const figmaClient = new FigmaClient();
 * registerSVGCommands(server, figmaClient);
 * ```
 * 
 * @see {@link registerSvgVectorTool} for vector extraction functionality
 * @see {@link registerSvgCreationCommands} for SVG creation functionality
 */
export function registerSVGCommands(server: McpServer, figmaClient: FigmaClient): void {
   registerSvgVectorTool(server, figmaClient);
   registerSvgCreationCommands(server, figmaClient); 
}
// Re-export for granular imports if needed
// export {
//
// };
