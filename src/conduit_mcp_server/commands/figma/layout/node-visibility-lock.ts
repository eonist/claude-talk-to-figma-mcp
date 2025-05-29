/**
 * Registers node property management commands on the MCP server.
 * 
 * This function adds a unified tool named "set_node_prop" to the MCP server,
 * enabling modification of node properties such as visibility and lock state.
 * Supports both single node and batch operations with comprehensive error handling.
 * 
 * @param {any} server - The MCP server instance to register the node property tool on
 * @param {any} figmaClient - The Figma client used to execute node property commands against the Figma API
 * 
 * @returns {void} This function does not return a value but registers the tool asynchronously
 * 
 * @example
 * ```
 * import { registerNodeLockVisibilityCommands } from './node-visibility-lock.js';
 * 
 * registerNodeLockVisibilityCommands(server, figmaClient);
 * ```
 * 
 * @remarks
 * - Supports batch operations for multiple nodes
 * - Configurable properties: locked, visible
 * - Returns detailed success/error information for each node
 * - Validates node existence before applying property changes
 * 
 * @since 1.0.0
 * @category Node Management
 */
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
