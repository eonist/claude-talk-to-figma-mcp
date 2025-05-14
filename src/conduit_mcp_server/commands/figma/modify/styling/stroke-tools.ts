import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers stroke color styling command:
 * - set_stroke_color
 */
export function registerStrokeTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_stroke_color",
    `Set the stroke color of a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node to update.
  - r (number, required): Red channel (0-1).
  - g (number, required): Green channel (0-1).
  - b (number, required): Blue channel (0-1).
  - a (number, optional): Alpha channel (0-1).
  - weight (number, optional): Stroke weight.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Set stroke 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      r: z.number().min(0).max(1).describe("Red channel (0-1)"),
      g: z.number().min(0).max(1).describe("Green channel (0-1)"),
      b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Optional. Alpha channel (0-1)"),
      weight: z.number().min(0.1).max(100).optional().describe("Optional. Stroke weight. Must be between 0.1 and 100."),
    },
    async ({ nodeId, r, g, b, a, weight }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.setStrokeColor({ nodeId: id, r, g, b, a, weight });
      return { content: [{ type: "text", text: `Set stroke ${id}` }] };
    }
  );
}
