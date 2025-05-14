import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers layer-management-related modify commands:
 * - flatten_selection
 * - union_selection
 * - subtract_selection
 * - intersect_selection
 * - exclude_selection
 */
export function registerBooleanTools(server: McpServer, figmaClient: FigmaClient) {
  // Flatten Selection
  server.tool(
    "flatten_selection",
    `Flatten a selection of nodes in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes flattened.

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
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to flatten. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
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

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes unioned.

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
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to union. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
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

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes subtracted.

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
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to subtract. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
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

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes intersected.

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
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to intersect. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
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

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes excluded.

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
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to exclude. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
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
}
