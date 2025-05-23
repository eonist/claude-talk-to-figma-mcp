import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";

//import { registerSelectionTools } from "../document/selection-tools.js";
import { registerBooleanTools } from "./boolean-tools.js";
import { registerGroupTools } from "./group-tools.js";
import { registerDeleteTools } from "./delete-tools.js";
import { registerInsertChildTools } from "./insert-child-tools.js";
import { registerFlattenNodeTools } from "./flatten-node-tools.js";
import { registerCloneNodeTools } from "./clone-node-tools.js";
import { registerReorderLayerTools } from "./reorder-layer-tools.js";
import { registerRenameCommands } from "./rename.js";
import { registerNodeTools } from "./node-tools.js";
 
export function registerNodeCommands(server: McpServer, figmaClient: FigmaClient) {
  registerBooleanTools(server, figmaClient);
  registerGroupTools(server, figmaClient);
  registerDeleteTools(server, figmaClient);
  registerInsertChildTools(server, figmaClient);
  registerFlattenNodeTools(server, figmaClient);
  registerCloneNodeTools(server, figmaClient);
  registerRenameCommands(server, figmaClient); // fixme add comment
  registerReorderLayerTools(server, figmaClient); // Register reorder layer tools (z-order/layer order)
  registerNodeTools(server, figmaClient);
}
  // Re-export for granular imports if needed
// export {
//
// };