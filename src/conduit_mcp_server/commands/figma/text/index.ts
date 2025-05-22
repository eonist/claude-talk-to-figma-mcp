import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerTextTools } from "./text-tools.js";

/**
 * Registers all text creation commands by delegating to submodules.
 */
export function registerTextCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerTextTools(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerTextTools,
};
