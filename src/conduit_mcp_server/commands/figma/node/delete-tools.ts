import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { NodeIdsArraySchema } from "./schema/node-ids-schema.js";
import { DeleteNodeSchema } from "./schema/delete-schema.js";

/**
 * Registers delete node commands on the MCP server.
 *
 * This function adds tools named "delete_node" and "delete_nodes" to the MCP server,
 * enabling deletion of single or multiple nodes in Figma. It validates inputs,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerDeleteTools(server, figmaClient);
 */
export function registerDeleteTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified delete_nodes tool (single or batch)
  server.tool(
    MCP_COMMANDS.DELETE_NODE,
    `Deletes one or more nodes in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the deleted node's ID(s).
`,
    DeleteNodeSchema.shape,
    async ({ nodeId, nodeIds }) => {
      let ids = [];
      if (Array.isArray(nodeIds) && nodeIds.length > 0) {
        ids = nodeIds.map(ensureNodeIdIsString);
      } else if (nodeId) {
        ids = [ensureNodeIdIsString(nodeId)];
      } else {
        const response = {
          success: false,
          error: {
            message: "You must provide 'nodeId' or 'nodeIds'.",
            results: [],
            meta: {
              operation: "delete_node",
              params: { nodeId, nodeIds }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      const results = [];
      for (const id of ids) {
        try {
          await figmaClient.deleteNode(id);
          results.push({ nodeId: id, success: true });
        } catch (err) {
          results.push({
            nodeId: id,
            success: false,
            error: err instanceof Error ? err.message : String(err),
            meta: {
              operation: "delete_node",
              params: { nodeId: id }
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
            message: "All delete_node operations failed",
            results,
            meta: {
              operation: "delete_node",
              params: { nodeId, nodeIds }
            }
          }
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );
}
