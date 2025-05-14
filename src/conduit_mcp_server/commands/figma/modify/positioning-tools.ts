import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers positioning-related modify commands:
 * - move_node
 * - move_nodes
 */
export function registerPositioningCommands(server: McpServer, figmaClient: FigmaClient) {
  // Move Node Tool
  server.tool(
    "move_node",
    `Moves a node to a new position in Figma.

Parameters:
  - nodeId (string, required): The unique Figma node ID to move. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.
  - x (number, required): New X position. Must be between -10,000 and 10,000. Example: 100
  - y (number, required): New Y position. Must be between -10,000 and 10,000. Example: 200

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the moved node's ID and new position.

Annotations:
  - title: "Move Node"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "x": 100,
      "y": 200
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Moved 123:456 to (100,200)" }]
    }
`,
    {
      // Validate nodeId as simple or complex Figma node ID, preserving original description
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to move. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      // Enforce reasonable X coordinate
      x: z.number()
        .min(-10000)
        .max(10000)
        .describe("New X position. Must be between -10,000 and 10,000."),
      // Enforce reasonable Y coordinate
      y: z.number()
        .min(-10000)
        .max(10000)
        .describe("New Y position. Must be between -10,000 and 10,000."),
    },
    async ({ nodeId, x, y }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.moveNode({ nodeId: id, x, y });
      return { content: [{ type: "text", text: `Moved ${id} to (${x},${y})` }] };
    }
  );

  // Move Multiple Nodes Tool
  server.tool(
    "move_nodes",
    `Moves multiple nodes to a new absolute position in Figma.

Parameters:
  - nodeIds (array, required): Array of node IDs to move. Each must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'. Must contain 1 to 100 items.
  - x (number, required): New X position. Must be between -10,000 and 10,000. Example: 100
  - y (number, required): New Y position. Must be between -10,000 and 10,000. Example: 200

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes moved and new position.

Annotations:
  - title: "Move Nodes"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeIds": ["123:456", "789:101", "112:131"],
      "x": 100,
      "y": 200
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Moved 3 nodes to (100,200)" }]
    }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to move. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
      )
      .min(1)
      .max(100)
      .describe("Array of node IDs to move. Must contain 1 to 100 items."),
      // Enforce reasonable X coordinate
      x: z.number()
        .min(-10000)
        .max(10000)
        .describe("New X position. Must be between -10,000 and 10,000."),
      // Enforce reasonable Y coordinate
      y: z.number()
        .min(-10000)
        .max(10000)
        .describe("New Y position. Must be between -10,000 and 10,000."),
    },
    async ({ nodeIds, x, y }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      await figmaClient.moveNodes({ nodeIds: ids, x, y });
      return { content: [{ type: "text", text: `Moved ${ids.length} nodes to (${x},${y})` }] };
    }
  );
}
