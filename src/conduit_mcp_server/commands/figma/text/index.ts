import { registerTextAnalysisTools } from "./text-analysis-tools.js";
import { registerTextContentTools, registerTextStyleTool } from "./text-content-tools.js";
import { registerTextTools } from "./text-tools.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

export function registerTextCommands(server: McpServer, figmaClient: FigmaClient): void {
   registerTextAnalysisTools(server, figmaClient); // fixme: add doc
   registerTextContentTools(server, figmaClient); // Registers all text creation commands by delegating to submodules.
   registerTextStyleTool(server, figmaClient); // Registers set_text_style command
   registerTextTools(server, figmaClient)
}
// Re-export for granular imports if needed
// export {
//
// };
