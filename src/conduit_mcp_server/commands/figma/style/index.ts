import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

import { registerStyleTools, registerNodeStylesTool } from "./style-tools.js";
import { registerTextStyleTools } from "./text-style-tools.js";
import { registerFillTools } from "./fill-tools.js";
import { registerGradientTools } from "./gradient-tools.js";
import { registerEffectTools } from "./effect-tools.js";
import { registerEffectsTools } from "./effects-tools.js";
import { registerFontTools } from "./font-tools.js";

export function registerStyleCommands(server: McpServer, figmaClient: FigmaClient): void {
  registerFillTools(server, figmaClient);
  registerGradientTools(server, figmaClient);
  registerEffectTools(server, figmaClient);
  registerEffectsTools(server, figmaClient);
  registerStyleTools(server, figmaClient); // fixme add comment
  registerNodeStylesTool(server, figmaClient); // Register get_node_styles command
  registerTextStyleTools(server, figmaClient); // fixme: add doc
  registerFontTools(server, figmaClient);
}
// Re-export for granular imports if needed
// export {
//
// };
