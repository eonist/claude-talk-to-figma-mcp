import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerUnifiedImageTool } from "./insert-image.js";

/**
 * Registers all image creation commands by delegating to submodules.
 */
export function registerImageCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerUnifiedImageTool(server, figmaClient);
}
