import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { CreateTextParams, CreateBoundedTextParams } from "../../../../types/command-params.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers text creation commands:
 * - create_text
 * - create_bounded_text
 */
export function registerTextTools(server: McpServer, figmaClient: FigmaClient) {
  // Create Text
  server.tool(
    "create_text",
    `Create a new text element in Figma.

Parameters:
  - x (number, required): X coordinate for the text element.
  - y (number, required): Y coordinate for the text element.
  - text (string, required): The text content.
  - fontSize (number, optional): Font size.
  - fontWeight (number, optional): Font weight.
  - fontColor (any, optional): Font color.
  - name (string, optional): Name for the text node.
  - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the created text node's ID.
    Example: { "content": [{ "type": "text", "text": "Created text 123:456" }] }
`,
    {
      x: z.number().min(-10000).max(10000),
      y: z.number().min(-10000).max(10000),
      text: z.string().min(1).max(10000),
      fontSize: z.number().min(1).max(200).optional(),
      fontWeight: z.number().min(100).max(1000).optional(),
      fontColor: z.any().optional(),
      name: z.string().min(1).max(100).optional(),
      parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
    },
    async (args) => {
      try {
        const params: CreateTextParams = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createText(params);
        return { content: [{ type: "text", text: `Created text ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "text-creation-tools", "create_text") as any;
      }
    }
  );

  // Create Bounded Text
  server.tool(
    "create_bounded_text",
    `Create a bounded text box in Figma.

Parameters:
  - x (number, required): X coordinate for the text box.
  - y (number, required): Y coordinate for the text box.
  - width (number, required): Width of the text box.
  - height (number, required): Height of the text box.
  - text (string, required): The text content.
  - fontSize (number, optional): Font size.
  - fontWeight (number, optional): Font weight.
  - fontColor (any, optional): Font color.
  - name (string, optional): Name for the text node.
  - parentId (string, optional): Figma node ID of the parent.

Returns:
  - content: Array containing a text message with the created bounded text node's ID.
    Example: { "content": [{ "type": "text", "text": "Created bounded text 123:456" }] }
`,
    {
      x: z.number().min(-10000).max(10000),
      y: z.number().min(-10000).max(10000),
      width: z.number().min(1).max(2000),
      height: z.number().min(1).max(2000),
      text: z.string().min(1).max(10000),
      fontSize: z.number().min(1).max(200).optional(),
      fontWeight: z.number().min(100).max(1000).optional(),
      fontColor: z.any().optional(),
      name: z.string().min(1).max(100).optional(),
      parentId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" }).optional(),
    },
    async (args) => {
      try {
        const params: CreateBoundedTextParams = { commandId: uuidv4(), ...args };
        const node = await figmaClient.executeCommand("create_bounded_text", params);
        return { content: [{ type: "text", text: `Created bounded text ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "text-creation-tools", "create_bounded_text") as any;
      }
    }
  );
}
