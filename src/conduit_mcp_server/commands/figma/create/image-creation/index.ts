import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerFromUrlImageTools } from "./from-url.js";
import { registerFromLocalImageTools } from "./from-local.js";

/**
 * Registers all image creation commands by delegating to submodules.
 */
export function registerImageCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerFromUrlImageTools(server, figmaClient);
  registerFromLocalImageTools(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerFromUrlImageTools,
  registerFromLocalImageTools,
};
