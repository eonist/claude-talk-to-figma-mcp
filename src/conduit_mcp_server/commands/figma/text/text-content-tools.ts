import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { BatchTextUpdateArraySchema } from "./schema/batch-text-schema.js";
import { 
  NodeIdSchema,
  TextContentSchema,
  TextStylePropertiesSchema,
  BatchTextStyleEntriesSchema,
  SetTextContentParamsSchema,
  SetTextStyleParamsSchema
} from "./schema/text-content-schema.js";


/**
 * Registers the unified text content management tool on the MCP server.
 * 
 * This tool provides both single and batch text content updates for Figma text nodes.
 * It supports updating one text node at a time or multiple nodes in a single operation.
 * 
 * @param server - The MCP server instance to register the tool on
 * @param figmaClient - The Figma client instance for executing API commands
 * 
 * @example
 * ```
 * // Single text update
 * await tool({ nodeId: "123:456", text: "Hello World" });
 * 
 * // Batch text update
 * await tool({ 
 *   texts: [
 *     { nodeId: "123:456", text: "First text" },
 *     { nodeId: "789:012", text: "Second text" }
 *   ]
 * });
 * ```
 * 
 * @throws {Error} When neither (nodeId + text) nor texts array is provided
 * @throws {Error} When nodeId format is invalid (must match /^\d+:\d+$/ or complex instance format)
 * @throws {Error} When text content exceeds 10,000 characters or is empty
 * 
 * @returns Tool registration with success/error response containing updated node results
 */
export function registerTextContentTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_TEXT_CONTENT,
    `Sets the text content of one or more text nodes in Figma.
Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the update result.

`,
    {
      nodeId: NodeIdSchema.optional(),
      text: TextContentSchema.optional(),
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
        const response = {
          success: false,
          error: {
            message: "Error: Provide either (nodeId + text) or texts array.",
            results: [],
            meta: {
              operation: "set_text_content",
              params: { nodeId, text, texts }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      const results = [];
      for (const upd of updates) {
        try {
          await figmaClient.executeCommand(MCP_COMMANDS.SET_TEXT_CONTENT, { nodeId: upd.nodeId, text: upd.text });
          results.push({ nodeId: upd.nodeId, success: true });
        } catch (err) {
          results.push({
            nodeId: upd.nodeId,
            success: false,
            error: err instanceof Error ? err.message : String(err),
            meta: {
              operation: "set_text_content",
              params: upd
            }
          });
        }
      }
      const anySuccess = results.some(r => r.success);
      let response;
      if (anySuccess) {
        response = { success: true, results };
      } else {
        response = {
          success: false,
          error: {
            message: "All set_text_content operations failed",
            results,
            meta: {
              operation: "set_text_content",
              params: updates
            }
          }
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );
}

/**
 * Registers the unified text style management tool on the MCP server.
 * 
 * This tool enables comprehensive text styling operations including font properties,
 * spacing, alignment, and visual effects. Supports both single node and batch operations.
 * 
 * @param server - The MCP server instance to register the tool on
 * @param figmaClient - The Figma client instance for executing style commands
 * 
 * @example
 * ```
 * // Single node styling
 * await tool({ 
 *   nodeId: "123:456", 
 *   styles: { 
 *     fontSize: 18, 
 *     fontWeight: 700,
 *     textAlignHorizontal: "CENTER"
 *   }
 * });
 * 
 * // Batch styling
 * await tool({
 *   entries: [
 *     { nodeId: "123:456", styles: { fontSize: 16 } },
 *     { nodeId: "789:012", styles: { fontWeight: 400, letterSpacing: { value: 2, unit: "PIXELS" } } }
 *   ]
 * });
 * ```
 * 
 * @throws {Error} When neither (nodeId + styles) nor entries array is provided
 * @throws {Error} When style properties are invalid or out of supported ranges
 * @throws {Error} When target node is not a text node
 * 
 * @returns Tool registration with success/error response containing styled node results
 */
export function registerTextStyleTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.SET_TEXT_STYLE,
    `Sets one or more text style properties (font, size, weight, spacing, case, decoration, etc.) on one or more nodes in Figma.
Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the update result.

`,
    {
      nodeId: NodeIdSchema.optional(),
      styles: TextStylePropertiesSchema.optional(),
      entries: BatchTextStyleEntriesSchema.optional(),
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
        const response = {
          success: false,
          error: {
            message: "Error: Provide either (nodeId + styles) or entries array.",
            results: [],
            meta: {
              operation: "set_text_style",
              params: { nodeId, styles, entries }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      const results = [];
      for (const upd of updates) {
        try {
          await figmaClient.executeCommand(MCP_COMMANDS.SET_TEXT_STYLE, { nodeId: upd.nodeId, styles: upd.styles });
          results.push({ nodeId: upd.nodeId, success: true });
        } catch (err) {
          results.push({
            nodeId: upd.nodeId,
            success: false,
            error: err instanceof Error ? err.message : String(err),
            meta: {
              operation: "set_text_style",
              params: upd
            }
          });
        }
      }
      const anySuccess = results.some(r => r.success);
      let response;
      if (anySuccess) {
        response = { success: true, results };
      } else {
        response = {
          success: false,
          error: {
            message: "All set_text_style operations failed",
            results,
            meta: {
              operation: "set_text_style",
              params: updates
            }
          }
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );
}
