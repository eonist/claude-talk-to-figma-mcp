import { z } from "zod";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
// import { handleToolError } from "../../../utils/error-handling.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

const NodeIdSchema = z.string().refine(isValidNodeId, { message: "Invalid Figma node ID" });
const NodeIdsSchema = z.array(NodeIdSchema).min(1).max(100);

const LockSchema = z.object({
  nodeId: NodeIdSchema.optional(),
  nodeIds: NodeIdsSchema.optional(),
  locked: z.boolean(),
}).refine(
  (data) => !!data.nodeId !== !!data.nodeIds,
  { message: "Provide either nodeId or nodeIds, not both." }
);

const VisibleSchema = z.object({
  nodeId: NodeIdSchema.optional(),
  nodeIds: NodeIdsSchema.optional(),
  visible: z.boolean(),
}).refine(
  (data) => !!data.nodeId !== !!data.nodeIds,
  { message: "Provide either nodeId or nodeIds, not both." }
);

export function registerNodeLockVisibilityCommands(server, figmaClient) {
  // Unified set_node_prop (locked, visible, etc.)
  server.tool(
    MCP_COMMANDS.SET_NODE_PROP,
    "Sets node properties (locked, visible, etc.) for one or more nodes.",
    z.object({
      nodeId: NodeIdSchema.optional(),
      nodeIds: NodeIdsSchema.optional(),
      properties: z.object({
        locked: z.boolean().optional(),
        visible: z.boolean().optional(),
      }).refine(obj => Object.keys(obj).length > 0, { message: "At least one property must be specified." })
    }).refine(
      (data) => !!data.nodeId !== !!data.nodeIds,
      { message: "Provide either nodeId or nodeIds, not both." }
    ),
    async (params: { nodeId?: string; nodeIds?: string[]; properties: { locked?: boolean; visible?: boolean } }) => {
      const ids = params.nodeIds || (params.nodeId ? [params.nodeId] : []);
      if (!ids.length) {
        const response = {
          success: false,
          error: {
            message: "No node IDs provided",
            results: [],
            meta: {
              operation: "set_node_prop",
              params
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      const results = [];
      for (const id of ids) {
        try {
          const node = await figmaClient.getNodeById(id);
          if (!node) throw new Error(`Node not found: ${id}`);
          if ("locked" in params.properties) node.locked = params.properties.locked;
          if ("visible" in params.properties) node.visible = params.properties.visible;
          results.push({
            nodeId: id,
            ...( "locked" in params.properties ? { locked: node.locked } : {} ),
            ...( "visible" in params.properties ? { visible: node.visible } : {} ),
            success: true
          });
        } catch (err) {
          results.push({
            nodeId: id,
            success: false,
            error: err instanceof Error ? err.message : String(err),
            meta: {
              operation: "set_node_prop",
              params: { nodeId: id, properties: params.properties }
            }
          });
        }
      }
      const anySuccess = results.some(r => r.success);
      let response;
      if (anySuccess) {
        response = { success: true, results };
      } else {
        response = {
          success: false,
          error: {
            message: "All set_node_prop operations failed",
            results,
            meta: {
              operation: "set_node_prop",
              params
            }
          }
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );
}
