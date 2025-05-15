import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerBooleanTools } from "./boolean-tools.js";
import { registerGroupTools } from "./group-tools.js";
import { registerDeleteTools } from "./delete-tools.js";
import { registerInsertChildTools } from "./insert-child-tools.js";
import { registerFlattenNodeTools, registerFlattenNodesTools } from "./flatten-node-tools.js";

/**
 * Registers all layer management commands by delegating to submodules.
 */
export function registerLayerManagementCommands(server: McpServer, figmaClient: FigmaClient) {
  registerBooleanTools(server, figmaClient);
  registerGroupTools(server, figmaClient);
  registerDeleteTools(server, figmaClient);
  registerInsertChildTools(server, figmaClient);
  registerFlattenNodeTools(server, figmaClient);
  registerFlattenNodesTools(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerBooleanTools,
  registerGroupTools,
  registerDeleteTools,
  registerInsertChildTools,
  registerFlattenNodeTools,
  registerFlattenNodesTools,
};
