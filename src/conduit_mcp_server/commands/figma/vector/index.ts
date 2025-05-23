import { registerVectorCreationCommands } from "./vector-creation-tools.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

export function registerVectorCommands(server: McpServer, figmaClient: FigmaClient): void {
  registerVectorCreationCommands(server, figmaClient); // fixme add comment
}
// Re-export for granular imports if needed
// export {
//    registerVectorCreationCommands
// };