import { registerTextAnalysisTools } from "./text-analysis-tools.js";
import { registerTextContentTools } from "./text-content-tools.js";
import { registerTextTools } from "./text-tools.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

export function registerTextCommands(server: McpServer, figmaClient: FigmaClient): void {
   registerTextAnalysisTools(server, figmaClient); // fixme: add doc
   registerTextContentTools(server, figmaClient); // Registers all text creation commands by delegating to submodules.
   registerTextTools(server, figmaClient)
}
// Re-export for granular imports if needed
// export {
//
// };