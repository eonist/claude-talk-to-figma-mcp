import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { registerRectanglesTools } from "./rectangles.js";
import { registerFramesTools } from "./frames.js";
import { registerLinesTools } from "./lines.js";
import { registerEllipsesTools } from "./ellipses.js";
import { registerPolygonsTools } from "./polygons.js";

/**
 * Registers all shape creation commands on the MCP server by delegating to submodules.
 *
 * This function acts as a central registration point for shape creation tools including rectangles,
 * frames, lines, ellipses, and polygons. It calls the respective registration functions for each shape type.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerShapeCreationCommands(server, figmaClient);
 */
export function registerShapeCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerRectanglesTools(server, figmaClient);
  registerFramesTools(server, figmaClient);
  registerLinesTools(server, figmaClient);
  registerEllipsesTools(server, figmaClient);
  registerPolygonsTools(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerRectanglesTools,
  registerFramesTools,
  registerLinesTools,
  registerEllipsesTools,
  registerPolygonsTools,
};
