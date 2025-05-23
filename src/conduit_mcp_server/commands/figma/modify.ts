import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../clients/figma-client.js";

import { registerStylingCommands } from "./style/index.js";
import { registerPositioningCommands } from "./layout/positioning-tools.js";
import { registerTransformCommands } from "./layout/transform-tools.js";
import { registerLayerManagementCommands } from "./node/index.js";
import { registerPropertyManipulationCommands } from "./export/index.js";
import { registerRenameCommands } from "./document/rename.js";
import { registerSelectionModifyTools } from "./document/selection-tools.js";
import { registerLayoutAutoTools } from "./layout/layout-auto-tools.js";

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
