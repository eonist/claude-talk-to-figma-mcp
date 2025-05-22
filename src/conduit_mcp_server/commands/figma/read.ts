/**
 * Figma READ command registrations for the MCP server.
 *
 * Orchestrates registration of all Figma read tools by delegating to submodules.
 *
 * @module commands/figma/read
 * @param {McpServer} server - The MCP server instance.
 * @param {FigmaClient} figmaClient - The Figma client instance.
 * @example
 * import { registerReadCommands } from './read.js';
 * registerReadCommands(server, figmaClient);
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../clients/figma-client/index.js";

// Import all tool registration functions from submodules
import { registerDocumentTools } from "./node/document-tools.js";
import { registerNodeTools } from "./node/node-tools.js";
import { registerSelectionTools } from "./node/selection-tools.js";
import { registerStyleTools } from "./style/style-tools.js";
import { registerComponentTools } from "./read/component-tools.js";
import { registerTextAnalysisTools } from "./text/text-analysis-tools.js";
import { registerCssTools } from "./read/css-tools.js";

// Optionally, import from index.ts if it re-exports all registration functions
// import * as readTools from "./read/index.js";

/**
 * Registers all Figma read commands for the MCP server by delegating to submodules.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
export function registerReadCommands(server: McpServer, figmaClient: FigmaClient) {
  registerDocumentTools(server, figmaClient); // fixme add comment
  registerNodeTools(server, figmaClient); // fixme add comment
  registerSelectionTools(server, figmaClient); // fixme add comment
  registerStyleTools(server, figmaClient); // fixme add comment
  registerComponentTools(server, figmaClient); // fixme add comment
  registerTextAnalysisTools(server, figmaClient); // fixme add comment
  registerCssTools(server, figmaClient); // fixme add comment
}
