import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers transformation-related modify commands:
 * - resize_node
 * - resize_nodes
 * - (future: rotation, scaling, flipping)
 */
export function registerTransformCommands(server: McpServer, figmaClient: FigmaClient) {
  // Resize Node Tool
  server.tool(
    "resize_node",
    `Resize a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node to resize.
  - width (number, required): New width (> 0).
  - height (number, required): New height (> 0).

Returns:
  - content: Array containing a text message with the resized node's ID and new size.
    Example: { "content": [{ "type": "text", "text": "Resized 123:456 to 100x200" }] }

Annotations:
  - title: "Resize Node"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "width": 100,
      "height": 200
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Resized 123:456 to 100x200" }]
    }
`,
    {
      // Validate nodeId as simple or complex Figma node ID, preserving original description
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to resize. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      // Enforce positive width, reasonable upper bound
      width: z.number()
        .min(1)
        .max(10000)
        .describe("The new width for the node, in pixels. Must be a positive number between 1 and 10,000."),
      // Enforce positive height, reasonable upper bound
      height: z.number()
        .min(1)
        .max(10000)
        .describe("The new height for the node, in pixels. Must be a positive number between 1 and 10,000."),
    },
    async ({ nodeId, width, height }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.resizeNode({ nodeId: id, width, height });
      return { content: [{ type: "text", text: `Resized ${id} to ${width}x${height}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "width": 500,
          "height": 300
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Resized 123:456 to 500x300" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if width or height is not between 1 and 10,000.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - width and height are limited to a reasonable range.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Resized <nodeId> to <width>x<height>"
          }
        ]
      }
    */
  );

  // Resize Multiple Nodes Tool
  server.tool(
    "resize_nodes",
    `Resize multiple nodes in Figma.

Parameters:
  - nodeIds (array, required): Array of node IDs to resize. Each must be a string in the format '123:456'.
  - targetSize (object, required): Object with width and height (> 0).

Returns:
  - content: Array containing a text message with the number of nodes resized.
    Example: { "content": [{ "type": "text", "text": "Resized 3 nodes" }] }

Annotations:
  - title: "Resize Nodes (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeIds": ["123:456", "789:101", "112:131"],
      "targetSize": { "width": 100, "height": 200 }
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Resized 3 nodes" }]
    }

Additional Usage Example:
  Input:
    {
      "nodeIds": ["222:333", "444:555"],
      "targetSize": { "width": 50, "height": 50 }
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Resized 2 nodes" }]
    }

Error Handling:
  - Returns an error if any nodeId is invalid or not found.
  - Returns an error if nodeIds array is empty or exceeds 100 items.
  - Returns an error if width or height is not between 1 and 10,000.

Security Notes:
  - All inputs are validated and sanitized. All nodeIds must match the expected format.
  - width and height are limited to a reasonable range.

Output Schema:
  {
    "content": [
      {
        "type": "text",
        "text": "Resized <N> nodes"
      }
    ]
  }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      nodeIds: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to resize. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
      )
      .min(1)
      .max(100)
      .describe("Array of Figma node IDs to resize. Must contain 1 to 100 items."),
      // Enforce positive width/height for targetSize, reasonable upper bound
      targetSize: z.object({
        width: z.number()
          .min(1)
          .max(10000)
          .describe("The new width for each node, in pixels. Must be a positive number between 1 and 10,000."),
        height: z.number()
          .min(1)
          .max(10000)
          .describe("The new height for each node, in pixels. Must be a positive number between 1 and 10,000."),
      })
      .describe("The target size to apply to all nodes. Must include width and height."),
    },
    async ({ nodeIds, targetSize }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      await figmaClient.executeCommand("resize_nodes", { nodeIds: ids, targetSize });
      return { content: [{ type: "text", text: `Resized ${ids.length} nodes` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeIds": ["123:456", "789:101", "112:131"],
          "targetSize": { "width": 100, "height": 200 }
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Resized 3 nodes" }]
        }

    Error Handling:
      - Returns an error if any nodeId is invalid or not found.
      - Returns an error if nodeIds array is empty or exceeds 100 items.
      - Returns an error if width or height is not between 1 and 10,000.

    Security Notes:
      - All inputs are validated and sanitized. All nodeIds must match the expected format.
      - width and height are limited to a reasonable range.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Resized <N> nodes"
          }
        ]
      }
    */
  );
}
