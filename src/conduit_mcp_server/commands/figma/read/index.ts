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
import { registerTextStyleTools } from "./text-style-tools.js";

/**
 * Registers all read commands by delegating to submodules.
 */
export function registerReadCommands(server: McpServer, figmaClient: FigmaClient) {
  registerDocumentTools(server, figmaClient); // fixme: add doc
  registerSelectionTools(server, figmaClient); // fixme: add doc
  registerNodeTools(server, figmaClient); // fixme: add doc
  registerStyleTools(server, figmaClient); // fixme: add doc
  registerNodeStylesTool(server, figmaClient); // fixme: add doc
  registerComponentTools(server, figmaClient); // fixme: add doc
  registerTextAnalysisTools(server, figmaClient); // fixme: add doc
  registerCssTools(server, figmaClient); // fixme: add doc
  registerSvgVectorTool(server, figmaClient); // fixme: add doc
  registerImageTools(server, figmaClient); // fixme: add doc
  registerTextStyleTools(server, figmaClient); // fixme: add doc
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
  registerTextStyleTools,
};
