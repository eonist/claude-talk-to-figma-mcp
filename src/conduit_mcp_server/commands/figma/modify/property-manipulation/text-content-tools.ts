import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";
import { BatchTextUpdateArraySchema } from "./batch-text-schema.js";

/**
 * Registers the unified "set_text_content" tool on the MCP server.
 */
export function registerTextContentTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_TEXT_CONTENT,
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
      await figmaClient.executeCommand(MCP_COMMANDS.SET_TEXT_CONTENT, updates.length === 1
        ? { nodeId: updates[0].nodeId, text: updates[0].text }
        : { texts: updates }
      );
      return { content: [{ type: "text", text: `Updated ${updates.length} text node(s)` }] };
    }
  );
}






/**
 * Registers the unified "set_text_style" tool on the MCP server.
 */
export function registerTextStyleTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_TEXT_STYLE,
    `Sets one or more text style properties (font, size, weight, spacing, case, decoration, etc.) on one or more nodes in Figma.

Input:
  - nodeId: (optional) The unique Figma text node ID to update (for single).
  - styles: (optional) Object of style properties to set (for single).
  - entries: (optional) Array of { nodeId, styles } for batch updates.

At least one of (nodeId + styles) or entries is required.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the update result.

Examples:
  // Single
  { nodeId: "123:456", styles: { fontSize: 18, fontWeight: 700 } }
  // Batch
  { entries: [
      { nodeId: "123:456", styles: { fontSize: 18 } },
      { nodeId: "789:101", styles: { fontWeight: 400, letterSpacing: 2 } }
    ]
  }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma text node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .optional(),
      styles: z.record(z.any()).optional(),
      entries: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma text node ID." }),
          styles: z.record(z.any())
        })
      ).optional(),
    },
    {
      title: "Set Text Style (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", styles: { fontSize: 18, fontWeight: 700 } },
        { entries: [
            { nodeId: "123:456", styles: { fontSize: 18 } },
            { nodeId: "789:101", styles: { fontWeight: 400, letterSpacing: 2 } }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma text node ID.",
        "At least one style property must be provided.",
        "Batch update replaces style properties for all specified nodes.",
        "You must provide either (nodeId + styles) or entries."
      ],
      extraInfo: "Use this command to update one or more text style properties for one or more nodes."
    },
    async ({ nodeId, styles, entries }) => {
      let updates = [];
      if (Array.isArray(entries) && entries.length > 0) {
        updates = entries.map(e => ({
          nodeId: ensureNodeIdIsString(e.nodeId),
          styles: e.styles
        }));
      } else if (nodeId && styles && Object.keys(styles).length > 0) {
        updates = [{ nodeId: ensureNodeIdIsString(nodeId), styles }];
      } else {
        return { content: [{ type: "text", text: "Error: Provide either (nodeId + styles) or entries array." }] };
      }
      // Forward to plugin/Figma client for actual style application
      await figmaClient.executeCommand(MCP_COMMANDS.SET_TEXT_STYLE, updates.length === 1
        ? { nodeId: updates[0].nodeId, styles: updates[0].styles }
        : { entries: updates }
      );
      return { content: [{ type: "text", text: `Updated text style for ${updates.length} node(s)` }] };
    }
  );
}
