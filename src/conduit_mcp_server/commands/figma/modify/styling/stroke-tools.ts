import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { MCP_COMMANDS } from "../../../../types/commands";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { StrokeColorSchema } from "./stroke-schema.js";

/**
 * Registers stroke color styling command:
 * - set_stroke_color
 */
export function registerStrokeTools(server: McpServer, figmaClient: FigmaClient) {
}
