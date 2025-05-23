import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { registerTextContentTools, registerTextStyleTool } from "./text-content-tools.js";
import { registerCornerRadiusTools } from "../layout/corner-radius-tools";
import { registerExportTools } from "./export-tools.js";
import { registerFontTools } from "./font-tools.js";
import { registerEffectsTools } from "./effects-tools.js";
import { registerAutoLayoutTools } from "../layout/auto-layout-tools";
import { registerDetachInstanceTools } from "../layout/detach-instance-tools";
import { registerNodeLockVisibilityCommands } from "../layout/node-visibility-lock";

/**
 * Registers all property manipulation commands by delegating to submodules.
 */
export function registerPropertyManipulationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerTextContentTools(server, figmaClient);
  registerTextStyleTool(server, figmaClient);
  registerCornerRadiusTools(server, figmaClient);
  registerExportTools(server, figmaClient);
  registerFontTools(server, figmaClient);
  registerEffectsTools(server, figmaClient);
  registerAutoLayoutTools(server, figmaClient);
  registerDetachInstanceTools(server, figmaClient);
  registerNodeLockVisibilityCommands(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerTextContentTools,
  registerTextStyleTool,
  registerCornerRadiusTools,
  registerExportTools,
  registerFontTools,
  registerEffectsTools,
  registerAutoLayoutTools,
  registerDetachInstanceTools,
  registerNodeLockVisibilityCommands,
};
