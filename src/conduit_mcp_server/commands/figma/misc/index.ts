import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";

import { registerEventCommands } from "./event-tools.js";
import { registerButtonTools } from "./button-tools.js";
import { registerVariableTools } from "./variables-tools.js";
import { registerAnnotationCommands } from "./annotation-tools.js";
/**
 * Registers all property manipulation commands by delegating to submodules.
 */
export function registerMiscCommands(server: McpServer, figmaClient: FigmaClient) {
  registerEventCommands(server, figmaClient);
  registerButtonTools(server, figmaClient);
  registerVariableTools(server, figmaClient);
  registerAnnotationCommands(server, figmaClient); // Register annotation commands  
}
// Re-export for granular imports if needed
// export {
//
// };