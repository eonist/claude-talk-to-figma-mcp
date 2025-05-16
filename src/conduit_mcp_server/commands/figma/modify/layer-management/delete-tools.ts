import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

/**
 * Registers delete node command:
 * - delete_node
 */
export function registerDeleteTools(server: McpServer, figmaClient: FigmaClient) {
  // Delete single node
  server.tool(
    "delete_node",
    `Deletes a node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the deleted node's ID.
`,
    {
      // Validate nodeId as simple or complex Figma node ID, preserving original description
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to delete. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
    },
    {
      title: "Delete Node",
      idempotentHint: true,
      destructiveHint: true,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("delete_node", { nodeId: id });
      return { content: [{ type: "text", text: `Deleted node ${id}` }] };
    }
  );

  // Batch delete nodes
  server.tool(
    "delete_nodes",
    `Deletes multiple nodes in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes deleted.
`,
    {
      nodeIds: NodeIdsArraySchema(1, 100),
    },
    {
      title: "Delete Nodes",
      idempotentHint: true,
      destructiveHint: true,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeIds }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      for (const nodeId of ids) {
        await figmaClient.executeCommand("delete_node", { nodeId });
      }
      return { content: [{ type: "text", text: `Deleted ${ids.length} nodes` }] };
    }
  );
}
