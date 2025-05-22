import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./schema/node-ids-schema.js";

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
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to delete. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
        .optional(),
      nodeIds: NodeIdsArraySchema(1, 100).optional(),
    },
    {
      title: "Delete Nodes (Unified)",
      idempotentHint: true,
      destructiveHint: true,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" },
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "Deleting nodes is irreversible.",
        "All nodeIds must be valid to avoid partial failures.",
        "Deleting parent nodes will remove their children.",
        "You must provide either 'nodeId' or 'nodeIds'."
      ],
      extraInfo: "Delete with care to avoid unintended data loss."
    },
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
