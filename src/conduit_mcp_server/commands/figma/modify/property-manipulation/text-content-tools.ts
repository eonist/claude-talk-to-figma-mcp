import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { BatchTextUpdateArraySchema } from "./batch-text-schema.js";

/**
 * Registers property-manipulation-related modify commands on the MCP server.
 *
 * This function adds the unified "set_text_content" tool to the MCP server,
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
  // Unified Set Text Content (single or batch)
  server.tool(
    "set_text_content",
    `Sets the text content of one or more text nodes in Figma.

Input:
  - nodeId: (optional) The unique Figma text node ID to update (for single).
  - text: (optional) The new text content to set for the node (for single).
  - texts: (optional) Array of { nodeId, text } for batch updates.

At least one of (nodeId + text) or texts is required.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the update result.

Examples:
  // Single
  { nodeId: "123:456", text: "Hello" }
  // Batch
  { texts: [{ nodeId: "123:456", text: "Hello" }, { nodeId: "789:101", text: "World" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma text node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'.")
        .optional(),
      text: z.string()
        .min(1)
        .max(10000)
        .describe("The new text content to set for the node. Must be a non-empty string. Maximum length 10,000 characters.")
        .optional(),
      texts: BatchTextUpdateArraySchema.optional(),
    },
    {
      title: "Set Text Content (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", text: "Hello, world!" },
        { texts: [{ nodeId: "123:457", text: "Hello" }, { nodeId: "123:458", text: "World" }] }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma text node ID.",
        "Text must be a non-empty string up to 10,000 characters.",
        "Batch update replaces text content for all specified nodes.",
        "You must provide either (nodeId + text) or texts."
      ],
      extraInfo: "Use this command to update the text content of one or more text nodes."
    },
    async ({ nodeId, text, texts }) => {
      let updates = [];
      if (Array.isArray(texts) && texts.length > 0) {
        updates = texts.map(t => ({ nodeId: ensureNodeIdIsString(t.nodeId), text: t.text }));
      } else if (nodeId && text) {
        updates = [{ nodeId: ensureNodeIdIsString(nodeId), text }];
      } else {
        return { content: [{ type: "text", text: "Error: Provide either (nodeId + text) or texts array." }] };
      }
      await figmaClient.executeCommand("set_text_content", updates.length === 1
        ? { nodeId: updates[0].nodeId, text: updates[0].text }
        : { texts: updates }
      );
      return { content: [{ type: "text", text: `Updated ${updates.length} text node(s)` }] };
    }
  );
}
