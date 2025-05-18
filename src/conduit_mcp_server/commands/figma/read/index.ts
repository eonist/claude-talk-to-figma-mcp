import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { registerDocumentTools } from "./document-tools.js";
import { registerSelectionTools } from "./selection-tools.js";
import { registerNodeTools } from "./node-tools.js";
import { registerStyleTools, registerNodeStylesTool } from "./style-tools.js";
import { registerComponentTools } from "./component-tools.js";
import { registerTextAnalysisTools } from "./text-analysis-tools.js";
import { registerCssTools } from "./css-tools.js";
import { registerSvgVectorTool } from "./vector-tools.js";
import { registerImageTools } from "./image-tools.js";

/**
 * Registers all read commands by delegating to submodules.
 */
export function registerReadCommands(server: McpServer, figmaClient: FigmaClient) {
  registerDocumentTools(server, figmaClient);
  registerSelectionTools(server, figmaClient);
  registerNodeTools(server, figmaClient);
  registerStyleTools(server, figmaClient);
  registerNodeStylesTool(server, figmaClient);
  registerComponentTools(server, figmaClient);
  registerTextAnalysisTools(server, figmaClient);
  registerCssTools(server, figmaClient);
  registerSvgVectorTool(server, figmaClient);
  registerImageTools(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerDocumentTools,
  registerSelectionTools,
  registerNodeTools,
  registerStyleTools,
  registerNodeStylesTool,
  registerComponentTools,
  registerTextAnalysisTools,
  registerCssTools,
  registerSvgVectorTool,
  registerImageTools,
};
