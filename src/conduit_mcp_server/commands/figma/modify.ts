import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../clients/figma-client.js";

import { registerStylingCommands } from "./modify/styling/index.js";
import { registerPositioningCommands } from "./modify/positioning-tools.js";
import { registerTransformCommands } from "./modify/transform-tools.js";
import { registerLayerManagementCommands } from "./modify/layer-management/index.js";
import { registerPropertyManipulationCommands } from "./modify/property-manipulation/index.js";
import { registerRenameCommands } from "./modify/rename.js";
import { registerSelectionModifyTools } from "./modify/selection-tools.js";
import { registerLayoutAutoTools } from "./modify/layout-auto-tools.js";

/**
 * Registers all modify commands by delegating to category modules.
 *
 * @param server - The MCP server instance
 * @param figmaClient - The Figma client instance
 */
export function registerModifyCommands(server: McpServer, figmaClient: FigmaClient): void {
  registerStylingCommands(server, figmaClient); // fixme add comment
  registerPositioningCommands(server, figmaClient); // fixme add comment
  registerTransformCommands(server, figmaClient); // fixme add comment
  registerLayerManagementCommands(server, figmaClient); // fixme add comment
  registerPropertyManipulationCommands(server, figmaClient); // fixme add comment
  registerRenameCommands(server, figmaClient); // fixme add comment
  registerSelectionModifyTools(server); // fixme add comment
  registerLayoutAutoTools(server, figmaClient); // fixme add comment
}
