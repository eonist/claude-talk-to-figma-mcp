import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers group/ungroup commands:
 * - group_nodes
 * - ungroup_nodes
 */
export function registerGroupTools(server: McpServer, figmaClient: FigmaClient) {
  // Group Nodes
  server.tool(
    "group_nodes",
    `Group nodes in Figma.

Parameters:
  - nodeIds (array, required): Array of node IDs to group.
  - name (string, optional): Name for the group.

Returns:
  - content: Array containing a text message with the group name and ID.
    Example: { "content": [{ "type": "text", "text": "Grouped 3 nodes into \"Group1\" (ID: 123:789)" }] }

Annotations:
  - title: "Group Nodes"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeIds": ["123:456", "789:101", "112:131"],
      "name": "Group1"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Grouped 3 nodes into \"Group1\" (ID: 123:789)" }]
    }
`,
    {
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to group. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
      )
      .min(2)
      .max(100)
      .describe("Array of node IDs to group. Must contain at least 2 and at most 100 items."),
      // Enforce non-empty string for name if provided
      name: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe("Optional. Name for the group. If provided, must be a non-empty string up to 100 characters."),
    },
    async ({ nodeIds, name }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      const result = await figmaClient.executeCommand("group_nodes", { nodeIds: ids, name });
      return {
        content: [{
          type: "text",
          text: `Grouped ${ids.length} nodes into "${result.name}" (ID: ${result.id})`
        }]
      };
    }
  );

  // Ungroup Nodes
  server.tool(
    "ungroup_nodes",
    `Ungroup a group node in Figma.

Parameters:
  - nodeId (string, required): The ID of the group node to ungroup.

Returns:
  - content: Array containing a text message with the ungrouped node's ID and number of children released.
    Example: { "content": [{ "type": "text", "text": "Ungrouped node 123:456, released 5 children." }] }

Annotations:
  - title: "Ungroup Nodes"
  - idempotentHint: true
  - destructiveHint: false
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
      "content": [{ "type": "text", "text": "Ungrouped node 123:456, released 5 children." }]
    }
`,
    {
      // Validate nodeId as simple or complex Figma node ID, preserving original description
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma group node ID to ungroup. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
    },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      const result = await figmaClient.executeCommand("ungroup_nodes", { nodeId: id });
      return {
        content: [{
          type: "text",
          text: `Ungrouped node ${id}, released ${result.ungroupedCount} children.`
        }]
      };
    }
  );
}
