import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers fill color styling command:
 * - set_fill_color
 */
export function registerFillTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_fill_color",
    `Sets the fill color of a node in Figma.

Parameters:
  - nodeId (string, required): The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.
  - r (number, required): Red channel value (0-1). Example: 0.5
  - g (number, required): Green channel value (0-1). Example: 0.5
  - b (number, required): Blue channel value (0-1). Example: 0.5
  - a (number, optional): Alpha channel value (0-1). Example: 1

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.

Annotations:
  - title: "Set Fill Color"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "r": 0.5,
      "g": 0.5,
      "b": 0.5,
      "a": 1
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Set fill 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      r: z.number().min(0).max(1).describe("Red channel (0-1)"),
      g: z.number().min(0).max(1).describe("Green channel (0-1)"),
      b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Optional. Alpha channel (0-1)"),
    },
    async ({ nodeId, r, g, b, a }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.setFillColor({ nodeId: id, r, g, b, a });
      return { content: [{ type: "text", text: `Set fill ${id}` }] };
    }
  );
}
