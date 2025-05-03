import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../clients/figma-client.js";
import { registerReadCommands } from "./figma/read.js";
import { registerCreateCommands } from "./figma/create.js";
import { registerModifyCommands } from "./figma/modify.js";
import { registerRenameCommands } from "./figma/rename.js";
import { registerChannelCommand } from "./channel.js";
import { logger } from "../utils/logger.js";

/**
 * Registers all commands for the MCP server
 * 
 * This function serves as a central registry for all command categories:
 * - Read commands (get document info, selection, node info, etc.)
 * - Create commands (rectangles, frames, text, ellipses, etc.)
 * - Modify commands (move, resize, delete, style operations, etc.)
 * - Rename commands (rename single layers, batch rename, AI rename, etc.)
 * - Channel commands (joining channels)
 * 
 * @param {McpServer} server - The MCP server instance
 */
export function registerAllCommands(server: McpServer): void {
  try {
    logger.info("Registering all commands...");
    
    // Create a Figma client for commands to use
    const figmaClient = new FigmaClient();
    
    // Register commands by category
    registerReadCommands(server, figmaClient);
    registerCreateCommands(server, figmaClient);
    registerModifyCommands(server, figmaClient);
    registerRenameCommands(server, figmaClient);
    registerChannelCommand(server, figmaClient);
    
    logger.info("All commands registered successfully");
  } catch (error) {
    logger.error(`Error registering commands: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
