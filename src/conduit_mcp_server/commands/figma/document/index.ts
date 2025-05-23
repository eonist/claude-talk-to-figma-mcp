import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";

import { registerSelectionModifyTools } from "./selection-modify-tools.js";
import { registerSelectionTools } from "./selection-tools.js";
import { registerDocumentCreationCommands } from "./document-creation.js";
import { registerDocumentTools } from "./document-tools.js";

/**
 * Registers all property manipulation commands by delegating to submodules.
 */
export function registerDocumnentCommands(server: McpServer, figmaClient: FigmaClient) {
  registerSelectionModifyTools(server, figmaClient);
  registerSelectionTools(server, figmaClient);
  registerDocumentCreationCommands(server, figmaClient); // fixme add comment
  registerDocumentTools(server, figmaClient); // Register document tools
}
// Re-export for granular imports if needed
 // export {
// 
 // };