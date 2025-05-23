 import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";

import { registerPageCommands } from "./page-tools.js";
import { registerUnifiedGridCommands } from "./grid-unified-tools.js";
import { registerGuideCommands } from "./guide-tools.js";

export function registerPageCmds(server: McpServer, figmaClient: FigmaClient) {
    registerUnifiedGridCommands(server, figmaClient); // Register unified grid commands (set_grid, get_grid)
    registerGuideCommands(server, figmaClient); // Register guide commands (set_guide, get_guide)
    registerPageCommands(server, figmaClient)
}
  // Re-export for granular imports if needed
// export {
//
// };