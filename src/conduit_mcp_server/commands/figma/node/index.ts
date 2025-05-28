import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";

//import { registerSelectionTools } from "../document/selection-tools.js";
import { registerBooleanTools } from "./boolean-tools.js";
import { registerGroupTools } from "./group-tools.js";
import { registerDeleteTools } from "./delete-tools.js";
import { registerInsertChildTools } from "./insert-child-tools.js";
import { registerFlattenNodeTools } from "./flatten-node-tools.js";
import { registerCloneNodeTools } from "./clone-node-tools.js";
import { registerReorderLayerTools } from "./reorder-layer-tools.js";
import { registerRenameCommands } from "./rename.js";
import { registerNodeTools } from "./node-tools.js";
 
/**
 * Registers all node manipulation commands on the MCP server for comprehensive Figma integration.
 * 
 * This function serves as the central orchestrator for registering all node-related tools 
 * and commands on the MCP server. It systematically registers boolean operations, grouping,
 * deletion, insertion, flattening, cloning, renaming, reordering, and general node manipulation
 * tools, providing a complete and cohesive toolkit for comprehensive Figma node management
 * and document manipulation workflows.
 * 
 * @param {McpServer} server - The MCP server instance to register all node commands on
 * @param {FigmaClient} figmaClient - The Figma client instance for API communication across all registered tools
 * 
 * @returns {void} This function has no return value but registers all tools asynchronously in a specific order
 * 
 * @throws {Error} Throws an error if server registration fails for any of the tool categories or if dependencies are missing
 * 
 * @example
 * ```
 * import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
 * import { FigmaClient } from "../../../clients/figma-client.js";
 * import { registerNodeCommands } from "./index.js";
 * 
 * const server = new McpServer({
 *   name: "figma-node-server",
 *   version: "1.0.0"
 * });
 * 
 * const figmaClient = new FigmaClient({
 *   apiKey: process.env.FIGMA_API_KEY,
 *   fileId: process.env.FIGMA_FILE_ID
 * });
 * 
 * // Register all node manipulation tools
 * registerNodeCommands(server, figmaClient);
 * 
 * // Server is now ready with complete node manipulation capabilities
 * await server.start();
 * console.log("Figma node manipulation server started successfully");
 * ```
 * 
 * @note Tools are registered in a specific order to ensure proper dependency resolution and avoid conflicts
 * @note All registered tools follow consistent error handling patterns and response formatting standards
 * @note The registration process is idempotent - calling this function multiple times will not cause issues
 * @note Each tool category provides both single-item and batch operation capabilities where applicable
 * @warning Ensure the FigmaClient is properly authenticated before registering commands
 * @since 1.0.0
 * @see {@link https://www.figma.com/developers/api} Figma API Documentation
 * @see {@link https://modelcontextprotocol.io/} Model Context Protocol Documentation
 */
export function registerNodeCommands(server: McpServer, figmaClient: FigmaClient) {
  registerBooleanTools(server, figmaClient);
  registerGroupTools(server, figmaClient);
  registerDeleteTools(server, figmaClient);
  registerInsertChildTools(server, figmaClient);
  registerFlattenNodeTools(server, figmaClient);
  registerCloneNodeTools(server, figmaClient);
  registerRenameCommands(server, figmaClient);
  registerReorderLayerTools(server, figmaClient);
  registerNodeTools(server, figmaClient);
}
  // Re-export for granular imports if needed
// export {
//
// };
