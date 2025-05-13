import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";

/**
 * Registers layer-management-related modify commands:
 * - flatten_selection
 * - union_selection
 * - subtract_selection
 * - intersect_selection
 * - exclude_selection
 * - group_nodes
 * - ungroup_nodes
 */
export function registerLayerManagementCommands(server: McpServer, figmaClient: FigmaClient) {
  // Flatten Selection
  server.tool(
    "flatten_selection",
    `Flatten a selection of nodes in Figma.

Parameters:
  - nodeIds (array, required): Array of node IDs to flatten.

Returns:
  - content: Array containing a text message with the number of nodes flattened.
    Example: { "content": [{ "type": "text", "text": "Flattened 3 nodes" }] }

Annotations:
  - title: "Flatten Selection"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeIds": ["123:456", "789:101", "112:131"]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Flattened 3 nodes" }]
    }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      nodeIds: z.array(
        z.string()
          .regex(/^\d+:\d+$/)
          .describe("A Figma node ID to flatten. Must be a string in the format '123:456'.")
      )
      .min(1)
      .max(100)
      .describe("Array of node IDs to flatten. Must contain 1 to 100 items."),
    },
    async ({ nodeIds }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      await figmaClient.executeCommand("flatten_selection", { nodeIds: ids });
      return { content: [{ type: "text", text: `Flattened ${ids.length} nodes` }] };
    }
  );

  // Boolean Operations
  server.tool(
    "union_selection",
    `Union selected shapes.

Parameters:
  - nodeIds (array, required): Array of node IDs to union.

Returns:
  - content: Array containing a text message with the number of nodes unioned.
    Example: { "content": [{ "type": "text", "text": "Unioned 3 nodes" }] }

Annotations:
  - title: "Union Selection"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeIds": ["123:456", "789:101", "112:131"]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Unioned 3 nodes" }]
    }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      nodeIds: z.array(
        z.string()
          .regex(/^\d+:\d+$/)
          .describe("A Figma node ID to union. Must be a string in the format '123:456'.")
      )
      .min(2)
      .max(100)
      .describe("Array of node IDs to union. Must contain at least 2 and at most 100 items."),
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("union_selection", { nodeIds });
      return { content: [{ type: "text", text: `Unioned ${nodeIds.length} nodes` }] };
    }
  );

  server.tool(
    "subtract_selection",
    `Subtract top shapes from bottom shape.

Parameters:
  - nodeIds (array, required): Array of node IDs to subtract.

Returns:
  - content: Array containing a text message with the number of nodes subtracted.
    Example: { "content": [{ "type": "text", "text": "Subtracted 3 nodes" }] }

Annotations:
  - title: "Subtract Selection"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeIds": ["123:456", "789:101", "112:131"]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Subtracted 3 nodes" }]
    }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      nodeIds: z.array(
        z.string()
          .regex(/^\d+:\d+$/)
          .describe("A Figma node ID to subtract. Must be a string in the format '123:456'.")
      )
      .min(2)
      .max(100)
      .describe("Array of node IDs to subtract. Must contain at least 2 and at most 100 items."),
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("subtract_selection", { nodeIds });
      return { content: [{ type: "text", text: `Subtracted ${nodeIds.length} nodes` }] };
    }
  );

  server.tool(
    "intersect_selection",
    `Intersect selected shapes.

Parameters:
  - nodeIds (array, required): Array of node IDs to intersect.

Returns:
  - content: Array containing a text message with the number of nodes intersected.
    Example: { "content": [{ "type": "text", "text": "Intersected 3 nodes" }] }

Annotations:
  - title: "Intersect Selection"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeIds": ["123:456", "789:101", "112:131"]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Intersected 3 nodes" }]
    }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      nodeIds: z.array(
        z.string()
          .regex(/^\d+:\d+$/)
          .describe("A Figma node ID to intersect. Must be a string in the format '123:456'.")
      )
      .min(2)
      .max(100)
      .describe("Array of node IDs to intersect. Must contain at least 2 and at most 100 items."),
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("intersect_selection", { nodeIds });
      return { content: [{ type: "text", text: `Intersected ${nodeIds.length} nodes` }] };
    }
  );

  server.tool(
    "exclude_selection",
    `Exclude overlapping areas of selected shapes.

Parameters:
  - nodeIds (array, required): Array of node IDs to exclude.

Returns:
  - content: Array containing a text message with the number of nodes excluded.
    Example: { "content": [{ "type": "text", "text": "Excluded 3 nodes" }] }

Annotations:
  - title: "Exclude Selection"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeIds": ["123:456", "789:101", "112:131"]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Excluded 3 nodes" }]
    }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      nodeIds: z.array(
        z.string()
          .regex(/^\d+:\d+$/)
          .describe("A Figma node ID to exclude. Must be a string in the format '123:456'.")
      )
      .min(2)
      .max(100)
      .describe("Array of node IDs to exclude. Must contain at least 2 and at most 100 items."),
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("exclude_selection", { nodeIds });
      return { content: [{ type: "text", text: `Excluded ${nodeIds.length} nodes` }] };
    }
  );

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
      // Enforce array of Figma node IDs, each must match format
      nodeIds: z.array(
        z.string()
          .regex(/^\d+:\d+$/)
          .describe("A Figma node ID to group. Must be a string in the format '123:456'.")
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
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma group node ID to ungroup. Must be a string in the format '123:456'."),
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
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to delete. Must be a string in the format '123:456'."),
    },
    async ({ nodeId }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("delete_node", { nodeId: id });
      return { content: [{ type: "text", text: `Deleted node ${id}` }] };
    }
  );
}
