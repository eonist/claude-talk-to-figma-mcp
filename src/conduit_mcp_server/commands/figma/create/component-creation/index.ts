import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerCreateInstancesFromComponentsTools } from "./instance-tools.js";
import { registerNodeTools } from "./node-tools.js";
import { registerButtonTools } from "./button-tools.js";

/**
 * Registers all component creation commands on the MCP server by delegating to submodules.
 *
 * This function acts as a central registration point for component creation tools including instance creation,
 * node conversion, and button creation. It calls the respective registration functions for each tool.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerComponentCreationCommands(server, figmaClient);
 */
export function registerComponentCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerCreateInstancesFromComponentsTools(server, figmaClient);
  registerNodeTools(server, figmaClient);
  registerButtonTools(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerCreateInstancesFromComponentsTools as registerInstanceTools,
  registerNodeTools,
  registerButtonTools,
};
