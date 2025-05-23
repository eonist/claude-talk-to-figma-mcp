import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
 
import { registerImageTools } from "./image-tools.js";
import { registerUnifiedImageTool } from "./insert-image.js";
/**
 * Registers all property manipulation commands by delegating to submodules.
 */
export function registerImageCommands(server: McpServer, figmaClient: FigmaClient) {
  registerUnifiedImageTool(server, figmaClient);
  registerImageTools(server, figmaClient); // fixme add comment
}
// Re-export for granular imports if needed
// export {
//
// };