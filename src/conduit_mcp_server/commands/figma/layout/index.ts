import { registerCornerRadiusTools } from "./corner-radius-tools.js";
import { registerAutoLayoutTools } from "./auto-layout-tools.js";
import { registerDetachInstanceTools } from "./detach-instance-tools.js";
import { registerNodeLockVisibilityCommands } from "./node-visibility-lock.js";
import { registerConstraintCommands } from "./constraint-tools.js";
import { registerLayoutAutoTools } from "./layout-auto-tools.js";
import { registerPositioningCommands } from "./positioning-tools.js";
import { registerTransformCommands } from "./transform-tools.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
 
export function registerLayoutCommands(server: McpServer, figmaClient: FigmaClient) {
  registerCornerRadiusTools(server, figmaClient);
  registerPositioningCommands(server, figmaClient); // fixme add comment
  registerTransformCommands(server, figmaClient); // fixme add comment
  registerAutoLayoutTools(server, figmaClient);
  registerDetachInstanceTools(server, figmaClient);
  registerNodeLockVisibilityCommands(server, figmaClient);
  registerLayoutAutoTools(server, figmaClient); // fixme add comment
  registerConstraintCommands(server, figmaClient); // Register constraint commands (set_constraints, get_constraints)  
}
  // Re-export for granular imports if needed
// export {
//
// };