import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { registerFillTools } from "./fill-tools.js";
import { registerStrokeTools } from "./stroke-tools.js";
import { registerStyleTools } from "./style-tools.js";
import { registerGradientTools } from "./gradient-tools.js";
import { registerEffectTools } from "./effect-tools.js";
import { registerVariableTools } from "../variables-tools.js";

/**
 * Registers all styling commands by delegating to submodules.
 */
export function registerStylingCommands(server: McpServer, figmaClient: FigmaClient) {
  registerFillTools(server, figmaClient);
  registerStrokeTools(server, figmaClient);
  registerStyleTools(server, figmaClient);
  registerGradientTools(server, figmaClient);
  registerEffectTools(server, figmaClient);
  registerVariableTools(server, figmaClient);
}

// Re-export for granular imports if needed
export {
  registerFillTools,
  registerStrokeTools,
  registerStyleTools,
  registerGradientTools,
  registerEffectTools,
  registerVariableTools,
};
