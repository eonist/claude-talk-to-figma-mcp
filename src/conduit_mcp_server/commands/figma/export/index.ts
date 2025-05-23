import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { registerExportTools } from "./export-tools.js";
/**
 * Registers all property manipulation commands by delegating to submodules.
 */
export function registerPropertyManipulationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerExportTools(server, figmaClient);
}
