import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

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
      nodeIds: NodeIdsArraySchema(1, 100),
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
      nodeIds: NodeIdsArraySchema(2, 100),
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
      nodeIds: NodeIdsArraySchema(2, 100),
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
      nodeIds: NodeIdsArraySchema(2, 100),
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
      nodeIds: NodeIdsArraySchema(2, 100),
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("exclude_selection", { nodeIds });
      return { content: [{ type: "text", text: `Excluded ${nodeIds.length} nodes` }] };
    }
  );
}
