import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../clients/figma-client.js";

import { registerStylingCommands } from "./modify/styling/index.js";
import { registerPositioningCommands } from "./modify/positioning-tools.js";
import { registerTransformCommands } from "./modify/transform-tools.js";
import { registerLayerManagementCommands } from "./modify/layer-management/index.js";
import { registerPropertyManipulationCommands } from "./modify/property-manipulation/index.js";
import { registerRenameCommands } from "./modify/rename.js";
import { registerSelectionModifyTools } from "./modify/selection-tools.js";

/**
 * Registers all modify commands by delegating to category modules.
 *
 * @param server - The MCP server instance
 * @param figmaClient - The Figma client instance
 */
export function registerModifyCommands(server: McpServer, figmaClient: FigmaClient): void {
  registerStylingCommands(server, figmaClient);
  registerPositioningCommands(server, figmaClient);
  registerTransformCommands(server, figmaClient);
  registerLayerManagementCommands(server, figmaClient);
  registerPropertyManipulationCommands(server, figmaClient);
  registerRenameCommands(server, figmaClient);
  registerSelectionModifyTools(server);
}
