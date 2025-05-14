import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers frame creation command:
 * - create_frame
 */
export function registerFramesTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_frame",
    `Create a new frame in Figma.

Parameters:
  - x (number, required): X coordinate for the top-left corner.
  - y (number, required): Y coordinate for the top-left corner.
  - width (number, required): Width in pixels.
  - height (number, required): Height in pixels.
  - name (string, optional): Name for the frame node.
  - parentId (string, optional): Figma node ID of the parent.
  - fillColor (any, optional): Fill color for the frame.
  - strokeColor (any, optional): Stroke color for the frame.
  - strokeWeight (number, optional): Stroke weight for the frame.

Returns:
  - content: Array containing a text message with the created frame's node ID.
    Example: { "content": [{ "type": "text", "text": "Created frame 123:456" }] }
`,
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      name: z.string().optional(), parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
      fillColor: z.any().optional(), strokeColor: z.any().optional(),
      strokeWeight: z.number().optional()
    },
    async (args) => {
      try {
        const params = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createFrame(params);
        return { content: [{ type: "text", text: `Created frame ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "shape-creation-tools", "create_frame") as any;
      }
    }
  );
}
