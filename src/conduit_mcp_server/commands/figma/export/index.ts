import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";

import { registerHtmlCommands } from "./html-tools.js";
import { registerExportTools } from "./export-tools.js";
import { registerCssTools } from "./css-tools.js";
/**
 * Registers all property manipulation commands by delegating to submodules.
 */
export function registerExportCommands(server: McpServer, figmaClient: FigmaClient) {
  registerExportTools(server, figmaClient);
  registerHtmlCommands(server, figmaClient);// Register HTML commands (HTML generation from Figma nodes)
  registerCssTools(server, figmaClient);
}
// Re-export for granular imports if needed
// export {
//
// };