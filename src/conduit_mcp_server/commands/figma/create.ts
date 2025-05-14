/**
 * Figma CREATE command registrations for the MCP server.
 *
 * Adds tools for creating shapes, text, vectors, components, and images via Figma.
 *
 * @module commands/figma/create
 * @param {McpServer} server - The MCP server instance.
 * @param {FigmaClient} figmaClient - The Figma client instance.
 * @example
 * import { registerCreateCommands } from './create.js';
 * registerCreateCommands(server, figmaClient);
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../clients/figma-client.js";
import { logger } from "../../utils/logger.js";

import { registerShapeCreationCommands } from "./create/shape-creation/index.js";
import { registerTextCreationCommands } from "./create/text-creation/index.js";
import { registerVectorCreationCommands } from "./create/vector-creation-tools.js";
import { registerComponentCreationCommands } from "./create/component-creation/index.js";
import { registerImageCreationCommands } from "./create/image-creation/index.js";
import { registerSvgCreationCommands } from "./create/svg-creation-tools.js";

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
  registerImageCreationCommands(server, figmaClient);
  logger.info("🔌 before registerSvgCreationCommands");
  registerSvgCreationCommands(server, figmaClient);
  logger.info("🔌 after registerSvgCreationCommands");
}
