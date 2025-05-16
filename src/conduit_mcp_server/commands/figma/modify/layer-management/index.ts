import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerBooleanTools } from "./boolean-tools.js";
import { registerGroupTools } from "./group-tools.js";
import { registerDeleteTools } from "./delete-tools.js";
import { registerInsertChildTools } from "./insert-child-tools.js";
import { registerFlattenNodeTools, registerFlattenNodesTools } from "./flatten-node-tools.js";
import { registerCloneNodeTools } from "./clone-node-tools.js";

/**
 * Registers all layer management commands on the MCP server by delegating to submodules.
 *
 * This function acts as a central registration point for layer management tools including boolean operations,
 * grouping, deletion, child insertion, flattening, and cloning. It calls the respective registration functions for each tool.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerLayerManagementCommands(server, figmaClient);
 */
export function registerLayerManagementCommands(server: McpServer, figmaClient: FigmaClient) {
  registerBooleanTools(server, figmaClient);
  registerGroupTools(server, figmaClient);
  registerDeleteTools(server, figmaClient);
  registerInsertChildTools(server, figmaClient);
  registerFlattenNodeTools(server, figmaClient);
  registerFlattenNodesTools(server, figmaClient);
  registerCloneNodeTools(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerBooleanTools,
  registerGroupTools,
  registerDeleteTools,
  registerInsertChildTools,
  registerFlattenNodeTools,
  registerFlattenNodesTools,
  registerCloneNodeTools,
};
