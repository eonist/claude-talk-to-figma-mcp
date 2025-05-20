/**
 * Command registry for the MCP server.
 *
 * This module centralizes registration of all command categories:
 * - Read commands (data retrieval operations)
 * - Create commands (element creation operations)
 * - Modify commands (element mutation operations)
 * - Rename commands (layer renaming operations)
 * - Channel commands (communication channel management)
 *
 * @module commands/index
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../clients/figma-client/index.js";
import { registerReadCommands } from "./figma/read.js";
import { registerCreateCommands } from "./figma/create.js";
import { registerModifyCommands } from "./figma/modify.js";
import { registerChannelCommand } from "./channel.js";
import { logger } from "../utils/logger.js";
import { registerHtmlCommands } from "./html-tools.js";
import { registerReorderLayerTools } from "./figma/modify/layer-management/reorder-layer-tools.js";
import { registerAnnotationCommands } from "./figma/annotation-tools.js";
import { registerGridCommands } from "./figma/modify/grid-tools.js";
import { registerUnifiedGridCommands } from "./figma/modify/grid-unified-tools.js";
import { registerGuideCommands } from "./figma/modify/guide-tools.js";
import { registerConstraintCommands } from "./figma/modify/constraint-tools.js";
import { registerPageCommands } from "./figma/modify/page-tools.js";
import { registerEventCommands } from "./figma/modify/event-tools.js";
import { registerVariantCommands } from "./figma/modify/variant-tools.js";

/**
 * Registers all tool commands with the given MCP server.
 *
 * Sets up:
 * - Read operations: get_document_info, get_selection, get_node_info, etc.
 * - Create operations: create_rectangle, create_text, etc.
 * - Modify operations: move_node, resize_node, set_style, etc.
 * - Rename operations: rename_layer, rename_layers, ai_rename_layers, etc.
 * - Channel operations: join_channel
 *
 * @param {McpServer} server - The MCP server instance
 */
export function registerAllCommands(server: McpServer): void {
  try {
    logger.info("Registering all commands...");
    // Instantiate Figma client to pass into each command group
    // Note: Using explicit FigmaClient type instead of 'any' to prevent type issues
    const figmaClient: FigmaClient = new FigmaClient();
    // Register command categories
    registerReadCommands(server, figmaClient); // Register read commands (data retrieval)
    registerCreateCommands(server, figmaClient);// Register create commands (element creation)
    registerModifyCommands(server, figmaClient);// Register modify commands (element mutation)
    registerChannelCommand(server, figmaClient);// Register channel commands (communication channel management)
    registerHtmlCommands(server, figmaClient);// Register HTML commands (HTML generation from Figma nodes)
    registerGridCommands(server, figmaClient); // Register grid commands (layout grid support)
    registerUnifiedGridCommands(server, figmaClient); // Register unified grid commands (set_grid, get_grid)
    registerGuideCommands(server, figmaClient); // Register guide commands (set_guide, get_guide)
    registerConstraintCommands(server, figmaClient); // Register constraint commands (set_constraints, get_constraints)
    registerPageCommands(server, figmaClient); // Register page commands (set_page, get_page)
+   registerEventCommands(server, figmaClient); // Register event commands (subscribe_event, unsubscribe_event)
+   registerVariantCommands(server, figmaClient); // Register variant commands (set_variant, get_variant)
+   registerAnnotationCommands(server, figmaClient); // Register annotation commands
+   registerReorderLayerTools(server, figmaClient); // Register reorder layer tools (z-order/layer order)
    logger.info("All commands registered successfully");
  } catch (error) {
    logger.error(`Error registering commands: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
