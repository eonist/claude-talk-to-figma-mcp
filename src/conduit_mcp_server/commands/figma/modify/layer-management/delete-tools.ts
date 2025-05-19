import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

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

Input:
  - nodeId: (optional) A single node ID to delete.
  - nodeIds: (optional) An array of node IDs to delete.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the deleted node's ID(s).

Examples:
  { "nodeId": "123:456" }
  { "nodeIds": ["123:456", "789:101"] }
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
        return { content: [{ type: "text", text: "You must provide 'nodeId' or 'nodeIds'." }] };
      }
      for (const id of ids) {
        await figmaClient.executeCommand(MCP_COMMANDS.DELETE_NODE, { nodeId: id });
      }
      return { content: [{ type: "text", text: `Deleted ${ids.length} node(s): ${ids.join(", ")}` }] };
    }
  );
}
