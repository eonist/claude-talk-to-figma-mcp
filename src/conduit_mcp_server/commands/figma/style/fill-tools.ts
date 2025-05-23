import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
// import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";

/**
 * Registers fill color styling command:
 * - set_fill_color
 */
export function registerFillTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified set_fill_and_stroke (fill, stroke, or both)
  server.tool(
    MCP_COMMANDS.SET_FILL_AND_STROKE,
    "Sets fill and/or stroke color(s) for one or more nodes.",
    {
      nodeId: z.string().optional(),
      nodeIds: z.array(z.string()).optional(),
      fill: z.any().optional(),
      stroke: z.any().optional()
    },
    {
      title: "Set Fill and Stroke",
      edgeCaseWarnings: [
        "Provide either nodeId or nodeIds, not both.",
        "At least one of fill or stroke must be provided."
      ]
    },
    async (params: { nodeId?: string; nodeIds?: string[]; fill?: any; stroke?: any }) => {
      if (!!params.nodeId === !!params.nodeIds) {
        throw new Error("Provide either nodeId or nodeIds, not both.");
      }
      if (!("fill" in params) && !("stroke" in params)) {
        throw new Error("At least one of fill or stroke must be provided.");
      }
      const ids = params.nodeIds || (params.nodeId ? [params.nodeId] : []);
      if (!ids.length) throw new Error("No node IDs provided");
      const results = [];
      for (const id of ids) {
        if (!isValidNodeId(id)) throw new Error(`Invalid node ID: ${id}`);
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
      return { content: [{ type: "text", text: JSON.stringify(results) }] };
    }
  );

  // Unified get_fill_and_stroke (fill, stroke, or both)
  server.tool(
    MCP_COMMANDS.GET_FILL_AND_STROKE,
    "Gets fill and/or stroke color(s) for one or more nodes.",
    {
      nodeId: z.string().optional(),
      nodeIds: z.array(z.string()).optional()
    },
    {
      title: "Get Fill and Stroke",
      edgeCaseWarnings: [
        "Provide either nodeId or nodeIds, not both."
      ]
    },
    async (params: { nodeId?: string; nodeIds?: string[] }) => {
      if (!!params.nodeId === !!params.nodeIds) {
        throw new Error("Provide either nodeId or nodeIds, not both.");
      }
      const ids = params.nodeIds || (params.nodeId ? [params.nodeId] : []);
      if (!ids.length) throw new Error("No node IDs provided");
      const results = [];
      for (const id of ids) {
        if (!isValidNodeId(id)) throw new Error(`Invalid node ID: ${id}`);
        // Use executeCommand to fetch node info
        const nodeInfoResult = await figmaClient.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId: id });
        let node = null;
        if (
          nodeInfoResult &&
          Array.isArray(nodeInfoResult.content) &&
          nodeInfoResult.content.length > 0 &&
          nodeInfoResult.content[0].type === "text"
        ) {
          try {
            const arr = JSON.parse(nodeInfoResult.content[0].text);
            node = arr && arr.length > 0 ? arr[0] : null;
          } catch (e) {
            node = null;
          }
        }
        if (!node) {
          results.push({ nodeId: id, error: "Node not found" });
          continue;
        }
        results.push({
          nodeId: id,
          fills: "fills" in node ? node.fills : [],
          strokes: "strokes" in node ? node.strokes : []
        });
      }
      return { content: [{ type: "text", text: JSON.stringify(results) }] };
    }
  );
}
