import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers corner radius manipulation command:
 * - set_corner_radius
 */
export function registerCornerRadiusTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_corner_radius",
    `Set the corner radius of a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node to update.
  - radius (number, required): The new corner radius (>= 0).
  - corners (array, optional): Array of booleans for each corner (length 4).

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Set corner radius for 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      radius: z.number().min(0)
        .describe("The new corner radius to set, in pixels. Must be a non-negative number (>= 0)."),
      corners: z.array(z.boolean()).length(4).optional()
        .describe("Optional. An array of four booleans indicating which corners to apply the radius to, in the order: [top-left, top-right, bottom-right, bottom-left]. If omitted, applies to all corners."),
    },
    async ({ nodeId, radius, corners }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_corner_radius", { nodeId: id, radius, corners });
      return { content: [{ type: "text", text: `Set corner radius for ${id}` }] };
    }
  );
}
