import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";
import { BatchTextUpdateArraySchema } from "./batch-text-schema.js";

/**
 * Registers property-manipulation-related modify commands on the MCP server.
 *
 * This function adds tools named "set_text_content" and "set_multiple_text_contents" to the MCP server,
 * enabling updating text content of single or multiple text nodes in Figma. It validates inputs,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerTextContentTools(server, figmaClient);
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
        .refine(isValidNodeId, { message: "Must be a valid Figma text node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
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
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", text: "Hello, world!" }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma text node ID.",
        "Text must be a non-empty string up to 10,000 characters.",
        "Setting text will replace existing content."
      ],
      extraInfo: "Use this command to update the text content of a single text node."
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
        .refine(isValidNodeId, { message: "Must be a valid Figma text node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma parent node ID. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      text: BatchTextUpdateArraySchema,
    },
    {
      title: "Set Multiple Text Contents",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", text: [{ nodeId: "123:457", text: "Hello" }, { nodeId: "123:458", text: "World" }] }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma parent node ID.",
        "Each child text node must have valid nodeId and non-empty text.",
        "Batch update replaces text content for all specified child nodes."
      ],
      extraInfo: "Use this command to update multiple child text nodes in parallel."
    },
    async ({ nodeId, text }) => {
      const parent = ensureNodeIdIsString(nodeId);
      const payload = text.map(t => ({ nodeId: ensureNodeIdIsString(t.nodeId), text: t.text }));
      await figmaClient.executeCommand("set_multiple_text_contents", { nodeId: parent, text: payload });
      return { content: [{ type: "text", text: `Updated ${payload.length} text nodes` }] };
    }
  );
}
