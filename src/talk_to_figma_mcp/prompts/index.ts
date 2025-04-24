/**
 * Central registry for all MCP prompts
 * 
 * This file imports and registers all prompts from different categories
 * in the MCP server for Claude Talk to Figma.
 */

import { FigmaMcpServer } from "../core/server/mcp-server";
import { logger } from "../utils/logger";

// Import prompt registrations from each category
import { registerDesignPrompts } from "./design";
import { registerInteractionPrompts } from "./interaction";
import { registerDocumentationPrompts } from "./documentation";
import { registerWorkflowPrompts } from "./workflow";

/**
 * Register all available prompts in the MCP server
 * 
 * @param server Instance of the MCP server
 */
export function registerAllPrompts(server: FigmaMcpServer): void {
  try {
    logger.info("Registering MCP prompts...");
    
    // Register prompts by category
    registerDesignPrompts(server);
    registerInteractionPrompts(server);
    registerDocumentationPrompts(server);
    registerWorkflowPrompts(server);
    
    logger.info("All MCP prompts registered successfully");
  } catch (error) {
    logger.error(`Error registering prompts: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}