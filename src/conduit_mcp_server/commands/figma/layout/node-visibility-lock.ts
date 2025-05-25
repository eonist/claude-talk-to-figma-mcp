import { MCP_COMMANDS } from "../../../types/commands.js";
import { SetNodePropSchema } from "./schema/node-visibility-lock-schema.js";

export function registerNodeLockVisibilityCommands(server: any, figmaClient: any) {
  // Unified set_node_prop (locked, visible, etc.)
  server.tool(
    MCP_COMMANDS.SET_NODE_PROP,
    "Sets node properties (locked, visible, etc.) for one or more nodes.",
    SetNodePropSchema,
    async (params: any) => {
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
