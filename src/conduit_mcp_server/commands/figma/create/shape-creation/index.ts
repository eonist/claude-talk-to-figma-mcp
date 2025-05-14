import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerRectanglesTools } from "./rectangles.js";
import { registerFramesTools } from "./frames.js";
import { registerLinesTools } from "./lines.js";
import { registerEllipsesTools } from "./ellipses.js";
import { registerPolygonsTools } from "./polygons.js";

/**
 * Registers all shape creation commands by delegating to submodules.
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
