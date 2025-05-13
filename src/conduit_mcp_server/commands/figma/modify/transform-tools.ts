import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";

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
      nodeId: z.string(),
      width: z.number().positive(),
      height: z.number().positive(),
    },
    async ({ nodeId, width, height }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.resizeNode({ nodeId: id, width, height });
      return { content: [{ type: "text", text: `Resized ${id} to ${width}x${height}` }] };
    }
  );

  // Resize Multiple Nodes Tool
  server.tool(
    "resize_nodes",
    `Resize multiple nodes in Figma.

Parameters:
  - nodeIds (array, required): Array of node IDs to resize.
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
`,
    {
      nodeIds: z.array(z.string()),
      targetSize: z.object({ width: z.number().positive(), height: z.number().positive() }),
    },
    async ({ nodeIds, targetSize }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      await figmaClient.executeCommand("resize_nodes", { nodeIds: ids, targetSize });
      return { content: [{ type: "text", text: `Resized ${ids.length} nodes` }] };
    }
  );
}
