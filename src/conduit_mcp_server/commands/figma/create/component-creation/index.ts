import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerInstanceTools } from "./instance-tools.js";
import { registerNodeTools } from "./node-tools.js";
import { registerButtonTools } from "./button-tools.js";

/**
 * Registers all component creation commands by delegating to submodules.
 */
export function registerComponentCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerInstanceTools(server, figmaClient);
  registerNodeTools(server, figmaClient);
  registerButtonTools(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerInstanceTools,
  registerNodeTools,
  registerButtonTools,
};
