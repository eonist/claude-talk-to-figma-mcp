import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { MCP_COMMANDS } from "../../../../types/commands";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers fill color styling command:
 * - set_fill_color
 */
export function registerFillTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified set_fill_and_stroke (fill, stroke, or both)
  server.tool(
    MCP_COMMANDS.SET_FILL_AND_STROKE,
    "Sets fill and/or stroke color(s) for one or more nodes.",
    z.object({
      nodeId: z.string().refine(isValidNodeId).optional(),
      nodeIds: z.array(z.string().refine(isValidNodeId)).optional(),
      fill: z.any().optional(),
      stroke: z.any().optional()
    }).refine(
      (data) => !!data.nodeId !== !!data.nodeIds,
      { message: "Provide either nodeId or nodeIds, not both." }
    ).refine(
      (data) => "fill" in data || "stroke" in data,
      { message: "At least one of fill or stroke must be provided." }
    ),
    async (params: { nodeId?: string; nodeIds?: string[]; fill?: any; stroke?: any }) => {
      const ids = params.nodeIds || (params.nodeId ? [params.nodeId] : []);
      if (!ids.length) throw new Error("No node IDs provided");
      const results = [];
      for (const id of ids) {
        const node = await figmaClient.getNodeById(id);
        if (!node) throw new Error(`Node not found: ${id}`);
        if ("fill" in params) node.fills = Array.isArray(params.fill) ? params.fill : [params.fill];
        if ("stroke" in params) node.strokes = Array.isArray(params.stroke) ? params.stroke : [params.stroke];
        results.push({
          id,
          ...( "fill" in params ? { fill: node.fills } : {} ),
          ...( "stroke" in params ? { stroke: node.strokes } : {} )
        });
      }
      return { content: results };
    }
  );
}
