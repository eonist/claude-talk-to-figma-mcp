import { registerSvgCreationCommands } from "./svg-creation-tools.js";
import { registerSvgVectorTool } from "./vector-tools.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";

export function registerTextCommands(server: McpServer, figmaClient: FigmaClient): void {
   registerSvgVectorTool(server, figmaClient); // fixme: add doc
   registerSvgCreationCommands(server, figmaClient); 
}