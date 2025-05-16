import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { BatchTextUpdateArraySchema } from "./batch-text-schema.js";

/**
 * Registers property-manipulation-related modify commands:
 * - set_text_content
 * - set_multiple_text_contents
 */
export function registerTextContentTools(server: McpServer, figmaClient: FigmaClient) {
  // Set Text Content
  server.tool(
    "set_text_content",
    `Sets the text content of an existing text node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      text: z.string()
        .min(1)
        .max(10000)
        .describe("The new text content to set for the node. Must be a non-empty string. Maximum length 10,000 characters."),
    },
    {
      title: "Set Text Content",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, text }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_text_content", { nodeId: id, text });
      return { content: [{ type: "text", text: `Updated text of ${id}` }] };
    }
  );

  // Set Multiple Text Contents
  server.tool(
    "set_multiple_text_contents",
    `Sets multiple text contents in parallel for child nodes of a parent node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of text nodes updated.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma parent node ID. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      text: BatchTextUpdateArraySchema,
    },
    {
      title: "Set Multiple Text Contents",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, text }) => {
      const parent = ensureNodeIdIsString(nodeId);
      const payload = text.map(t => ({ nodeId: ensureNodeIdIsString(t.nodeId), text: t.text }));
      await figmaClient.executeCommand("set_multiple_text_contents", { nodeId: parent, text: payload });
      return { content: [{ type: "text", text: `Updated ${payload.length} text nodes` }] };
    }
  );
}
