import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";

// import { registerComponentTools } from "./figma/component/component-tools.js";
import { registerComponentTools } from "./component-tools.js";
import { registerVariantCommands } from "./variant-tools.js";
import { registerComponentNodeTools } from "./component-node-tools.js";
import { registerCreateInstancesFromComponentsTools } from "./instance-tools.js";

export function registerComponentCommands(server: McpServer, figmaClient: FigmaClient) {
  registerComponentTools(server, figmaClient);
  registerVariantCommands(server, figmaClient); // Register variant commands (set_variant, get_variant)
    registerCreateInstancesFromComponentsTools(server, figmaClient);
    registerComponentNodeTools(server, figmaClient);    
}
  // Re-export for granular imports if needed
// export {
//
// };