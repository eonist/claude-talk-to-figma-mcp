import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers button creation command:
 * - create_button
 */
export function registerButtonTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "create_button",
    `Create a complete button with background and text in Figma.

Parameters:
  - x (number, required): X coordinate for the button.
  - y (number, required): Y coordinate for the button.
  - width (number, optional): Width of the button (default 100).
  - height (number, optional): Height of the button (default 40).
  - text (string, optional): Button text (default "Button").
  - background (object, optional): Background color (default { r: 0.19, g: 0.39, b: 0.85, a: 1 }).
  - textColor (object, optional): Text color (default { r: 1, g: 1, b: 1, a: 1 }).
  - fontSize (number, optional): Font size (default 14).
  - fontWeight (number, optional): Font weight (default 500).
  - cornerRadius (number, optional): Corner radius (default 4).
  - name (string, optional): Name for the button node.
  - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the created button's frame, background, and text node IDs.
    Example: { "content": [{ "type": "text", "text": "Created button with frame ID: 123, background ID: 456, text ID: 789" }] }
`,
    {
      x: z.number().min(-10000).max(10000),
      y: z.number().min(-10000).max(10000),
      width: z.number().min(1).max(2000).optional().default(100),
      height: z.number().min(1).max(2000).optional().default(40),
      text: z.string().min(1).max(200).optional().default("Button"),
      background: z.object({
        r: z.number().min(0).max(1),
        g: z.number().min(0).max(1),
        b: z.number().min(0).max(1),
        a: z.number().min(0).max(1).optional().default(1)
      }).optional().default({ r: 0.19, g: 0.39, b: 0.85, a: 1 }),
      textColor: z.object({
        r: z.number().min(0).max(1),
        g: z.number().min(0).max(1),
        b: z.number().min(0).max(1),
        a: z.number().min(0).max(1).optional().default(1)
      }).optional().default({ r: 1, g: 1, b: 1, a: 1 }),
      fontSize: z.number().min(1).max(200).optional().default(14),
      fontWeight: z.number().min(100).max(1000).optional().default(500),
      cornerRadius: z.number().min(0).max(100).optional().default(4),
      name: z.string().min(1).max(100).optional(),
      parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
    },
    async (args) => {
      try {
        const params = {
          x: args.x,
          y: args.y,
          width: args.width,
          height: args.height,
          text: args.text,
          style: {
            background: args.background,
            text: args.textColor,
            fontSize: args.fontSize,
            fontWeight: args.fontWeight,
            cornerRadius: args.cornerRadius
          },
          name: args.name,
          parentId: args.parentId
        };
        const result = await figmaClient.executeCommand("create_button", params);
        return { 
          content: [{ 
            type: "text", 
            text: `Created button with frame ID: ${result.frameId}, background ID: ${result.backgroundId}, text ID: ${result.textId}` 
          }],
          _meta: {
            frameId: result.frameId,
            backgroundId: result.backgroundId,
            textId: result.textId
          }
        };
      } catch (err) {
        return handleToolError(err, "component-creation-tools", "create_button") as any;
      }
    }
  );
}
