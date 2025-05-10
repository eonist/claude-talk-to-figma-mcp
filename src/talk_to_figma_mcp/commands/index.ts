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
import { FigmaClient } from "../clients/figma-client.js";
import { registerReadCommands } from "./figma/read.js";
import { registerCreateCommands } from "./figma/create.js";
import { registerModifyCommands } from "./figma/modify.js";
import { registerRenameCommands } from "./figma/rename.js";
import { registerChannelCommand } from "./channel.js";
import { logger } from "../utils/logger.js";
import { registerHtmlCommands } from "./html-tools.js";

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
    registerReadCommands(server, figmaClient);
    registerCreateCommands(server, figmaClient);
    registerModifyCommands(server, figmaClient);
    registerRenameCommands(server, figmaClient);
    registerChannelCommand(server, figmaClient);
    registerHtmlCommands(server, figmaClient);

    logger.info("All commands registered successfully");
  } catch (error) {
    logger.error(`Error registering commands: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
