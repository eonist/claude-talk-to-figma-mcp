import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { StrokeColorSchema } from "./stroke-schema.js";

/**
 * Registers stroke color styling command:
 * - set_stroke_color
 */
export function registerStrokeTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_stroke_color",
    `Sets the stroke color of a node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      ...StrokeColorSchema.shape,
    },
    {
      title: "Set Stroke Color",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, r, g, b, a, weight }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.setStrokeColor({ nodeId: id, r, g, b, a, weight });
      return { content: [{ type: "text", text: `Set stroke ${id}` }] };
    }
  );
}
