import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerTextContentTools, registerTextStyleTool, registerParagraphSpacingTool, registerLetterSpacingTool } from "./text-content-tools.js";
import { registerCornerRadiusTools } from "./corner-radius-tools.js";
import { registerExportTools } from "./export-tools.js";
import { registerFontTools } from "./font-tools.js";
import { registerEffectsTools } from "./effects-tools.js";
import { registerAutoLayoutTools } from "./auto-layout-tools.js";
import { registerDetachInstanceTools } from "./detach-instance-tools.js";
import { registerNodeLockVisibilityCommands } from "./node-visibility-lock.js";

/**
 * Registers all property manipulation commands by delegating to submodules.
 */
export function registerPropertyManipulationCommands(server: McpServer, figmaClient: FigmaClient) {
  registerTextContentTools(server, figmaClient);
  registerTextStyleTool(server, figmaClient);
  registerParagraphSpacingTool(server, figmaClient);
  registerLetterSpacingTool(server, figmaClient);
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
  registerParagraphSpacingTool,
  registerLetterSpacingTool,
  registerCornerRadiusTools,
  registerExportTools,
  registerFontTools,
  registerEffectsTools,
  registerAutoLayoutTools,
  registerDetachInstanceTools,
  registerNodeLockVisibilityCommands,
};
