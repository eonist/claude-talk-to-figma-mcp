import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../clients/figma-client.js";

import { registerShapeCreationCommands } from "./create/shape-creation-tools.js";
import { registerTextCreationCommands } from "./create/text-creation-tools.js";
import { registerVectorCreationCommands } from "./create/vector-creation-tools.js";
import { registerComponentCreationCommands } from "./create/component-creation-tools.js";

/**
 * Registers all creation commands by delegating to category modules.
 *
 * @param server - The MCP server instance
 * @param figmaClient - The Figma client instance
 */
export function registerCreateCommands(server: McpServer, figmaClient: FigmaClient): void {
  registerShapeCreationCommands(server, figmaClient);
  registerTextCreationCommands(server, figmaClient);
  registerVectorCreationCommands(server, figmaClient);
  registerComponentCreationCommands(server, figmaClient);
}
