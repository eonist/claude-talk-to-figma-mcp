import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
// import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { setFillAndStrokeSchema, getFillAndStrokeSchema } from "./schema/fill-schema.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Registers fill color styling command:
 * - set_fill_color
 */
export function registerFillTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified set_fill_and_stroke (fill, stroke, strokeWeight)
  server.tool(
    MCP_COMMANDS.SET_FILL_AND_STROKE,
    "Sets fill and/or stroke color(s) and/or stroke weight for one or more nodes.",
    setFillAndStrokeSchema,
    async (params: { nodeId?: string; nodeIds?: string[]; fillColor?: any; strokeColor?: any; strokeWeight?: number }) => {
      if (!!params.nodeId === !!params.nodeIds) {
        throw new Error("Provide either nodeId or nodeIds, not both.");
      }
      if (!("fillColor" in params) && !("strokeColor" in params) && !("strokeWeight" in params)) {
        throw new Error("At least one of fillColor, strokeColor, or strokeWeight must be provided.");
      }
      const ids = params.nodeIds || (params.nodeId ? [params.nodeId] : []);
      if (!ids.length) throw new Error("No node IDs provided");
      
      // Validate node IDs
      for (const id of ids) {
        if (!isValidNodeId(id)) throw new Error(`Invalid node ID: ${id}`);
      }
      
      // Forward to plugin via executeCommand
      const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_FILL_AND_STROKE, params);
      return result;
    }
  );

  // Unified get_fill_and_stroke (fill, stroke, strokeWeight)
  server.tool(
    MCP_COMMANDS.GET_FILL_AND_STROKE,
    "Gets fill and/or stroke color(s) and stroke weight for one or more nodes.",
    getFillAndStrokeSchema,
    async (params: { nodeId?: string; nodeIds?: string[] }) => {
      if (!!params.nodeId === !!params.nodeIds) {
        throw new Error("Provide either nodeId or nodeIds, not both.");
      }
      const ids = params.nodeIds || (params.nodeId ? [params.nodeId] : []);
      if (!ids.length) throw new Error("No node IDs provided");
      
      // Validate node IDs
      for (const id of ids) {
        if (!isValidNodeId(id)) throw new Error(`Invalid node ID: ${id}`);
      }
      
      // Forward to plugin via executeCommand - plugin's getFillAndStroke now includes strokeWeight
      const result = await figmaClient.executeCommand(MCP_COMMANDS.GET_FILL_AND_STROKE, params);
      return result;
    }
  );
}
