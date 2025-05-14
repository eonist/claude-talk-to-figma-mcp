import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers delete node command:
 * - delete_node
 */
export function registerDeleteTools(server: McpServer, figmaClient: FigmaClient) {
  // Delete single node
  server.tool(
    "delete_node",
    `Delete a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node to delete.

Returns:
  - content: Array containing a text message with the deleted node's ID.
    Example: { "content": [{ "type": "text", "text": "Deleted node 123:456" }] }

Annotations:
  - title: "Delete Node"
  - idempotentHint: true
  - destructiveHint: true
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Deleted node 123:456" }]
    }
`,
    {
      // Validate nodeId as simple or complex Figma node ID, preserving original description
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to delete. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
    },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("delete_node", { nodeId: id });
      return { content: [{ type: "text", text: `Deleted node ${id}` }] };
    }
  );
}
