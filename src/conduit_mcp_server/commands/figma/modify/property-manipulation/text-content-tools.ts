import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { BatchTextUpdateArraySchema } from "./batch-text-schema.js";

/**
 * Registers the unified "set_text_content" tool on the MCP server.
 */
export function registerTextContentTools(server: McpServer, figmaClient: FigmaClient) {
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

/**
 * Registers the unified "set_paragraph_spacing" tool on the MCP server.
 */
export function registerParagraphSpacingTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_paragraph_spacing",
    `Sets the paragraph spacing of one or more text nodes in Figma.

Input:
  - entry: (optional) Single config { nodeId, paragraphSpacing }
  - entries: (optional) Array of configs [{ nodeId, paragraphSpacing }, ...]

At least one of entry or entries is required.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the update result.

Examples:
  // Single
  { entry: { nodeId: "123:456", paragraphSpacing: 12 } }
  // Batch
  { entries: [{ nodeId: "123:456", paragraphSpacing: 12 }, { nodeId: "789:101", paragraphSpacing: 16 }] }
`,
    {
      entry: z.object({
        nodeId: z.string().refine(isValidNodeId),
        paragraphSpacing: z.number()
      }).optional(),
      entries: z.array(
        z.object({
          nodeId: z.string().refine(isValidNodeId),
          paragraphSpacing: z.number()
        })
      ).optional(),
    },
    {
      title: "Set Paragraph Spacing (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entry: { nodeId: "123:456", paragraphSpacing: 12 } },
        { entries: [
            { nodeId: "123:456", paragraphSpacing: 12 },
            { nodeId: "789:101", paragraphSpacing: 16 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma text node ID.",
        "paragraphSpacing must be a number.",
        "Batch update replaces paragraph spacing for all specified nodes.",
        "You must provide either entry or entries."
      ],
      extraInfo: "Use this command to update the paragraph spacing of one or more text nodes."
    },
    async ({ entry, entries }) => {
      let updates = [];
      if (Array.isArray(entries) && entries.length > 0) {
        updates = entries.map(e => ({ nodeId: ensureNodeIdIsString(e.nodeId), paragraphSpacing: e.paragraphSpacing }));
      } else if (entry && entry.nodeId && typeof entry.paragraphSpacing === "number") {
        updates = [{ nodeId: ensureNodeIdIsString(entry.nodeId), paragraphSpacing: entry.paragraphSpacing }];
      } else {
        return { content: [{ type: "text", text: "Error: Provide either entry or entries array." }] };
      }
      const results = [];
      for (const { nodeId, paragraphSpacing } of updates) {
        try {
          await figmaClient.executeCommand("set_paragraph_spacing", { nodeId, paragraphSpacing });
          results.push({ nodeId, success: true });
        } catch (err: any) {
          results.push({ nodeId, success: false, error: err && err.message ? err.message : String(err) });
        }
      }
      return { content: [{ type: "text", text: JSON.stringify(results) }] };
    }
  );
}

/**
 * Registers the unified "set_line_height" tool on the MCP server.
 */
export function registerLineHeightTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_line_height",
    `Sets the line height for one or more text nodes in Figma, supporting both pixel and percent units, and range-based updates.

Input:
  - operation: (optional) Single config { nodeId, ranges: [{ start, end, value, unit }] }
  - operations: (optional) Array of configs [{ nodeId, ranges: [...] }]
  - options: (optional) { skipErrors?: boolean, loadMissingFonts?: boolean }

At least one of operation or operations is required.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the update result.

Examples:
  // Single
  { operation: { nodeId: "123:456", ranges: [{ start: 0, end: 5, value: 150, unit: "PERCENT" }] } }
  // Batch
  { operations: [
      { nodeId: "123:456", ranges: [{ start: 0, end: 5, value: 150, unit: "PERCENT" }] },
      { nodeId: "789:101", ranges: [{ start: 0, end: 10, value: 24, unit: "PIXELS" }] }
    ]
  }
`,
    {
      operation: z.object({
        nodeId: z.string().refine(isValidNodeId),
        ranges: z.array(z.object({
          start: z.number(),
          end: z.number(),
          value: z.number().optional(),
          unit: z.enum(["PIXELS", "PERCENT", "AUTO"])
        }))
      }).optional(),
      operations: z.array(
        z.object({
          nodeId: z.string().refine(isValidNodeId),
          ranges: z.array(z.object({
            start: z.number(),
            end: z.number(),
            value: z.number().optional(),
            unit: z.enum(["PIXELS", "PERCENT", "AUTO"])
          }))
        })
      ).optional(),
      options: z.object({
        skipErrors: z.boolean().optional(),
        loadMissingFonts: z.boolean().optional()
      }).optional()
    },
    {
      title: "Set Line Height (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { operation: { nodeId: "123:456", ranges: [{ start: 0, end: 5, value: 150, unit: "PERCENT" }] } },
        { operations: [
            { nodeId: "123:456", ranges: [{ start: 0, end: 5, value: 150, unit: "PERCENT" }] },
            { nodeId: "789:101", ranges: [{ start: 0, end: 10, value: 24, unit: "PIXELS" }] }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma text node ID.",
        "Ranges must be within the text length.",
        "Unit must be one of PIXELS, PERCENT, or AUTO.",
        "You must provide either operation or operations."
      ],
      extraInfo: "Use this command to update the line height for one or more text nodes, supporting both single and batch operations."
    },
    async ({ operation, operations, options }) => {
      let ops = [];
      if (Array.isArray(operations) && operations.length > 0) {
        ops = operations;
      } else if (operation && operation.nodeId && Array.isArray(operation.ranges)) {
        ops = [operation];
      } else {
        return { content: [{ type: "text", text: "Error: Provide either operation or operations array." }] };
      }
      // Forward to plugin/Figma client for actual line height application
      await figmaClient.executeCommand("set_line_height", ops.length === 1
        ? { operation: ops[0], options }
        : { operations: ops, options }
      );
      return { content: [{ type: "text", text: `Updated line height for ${ops.length} node(s)` }] };
    }
  );
}

/**
 * Registers the unified "set_letter_spacing" tool on the MCP server.
 */
export function registerLetterSpacingTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_letter_spacing",
    `Sets the letter spacing for one or more text nodes in Figma, supporting both pixel and percent units, and range-based updates.

Input:
  - operation: (optional) Single config { nodeId, spacings: [{ start, end, value, unit }] }
  - operations: (optional) Array of configs [{ nodeId, spacings: [...] }]
  - options: (optional) { skipErrors?: boolean, loadMissingFonts?: boolean }

At least one of operation or operations is required.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the update result.

Examples:
  // Single
  { operation: { nodeId: "123:456", spacings: [{ start: 0, end: 5, value: 2, unit: "PIXELS" }] } }
  // Batch
  { operations: [
      { nodeId: "123:456", spacings: [{ start: 0, end: 5, value: 2, unit: "PIXELS" }] },
      { nodeId: "789:101", spacings: [{ start: 0, end: 10, value: 150, unit: "PERCENT" }] }
    ]
  }
`,
    {
      operation: z.object({
        nodeId: z.string().refine(isValidNodeId),
        spacings: z.array(z.object({
          start: z.number(),
          end: z.number(),
          value: z.number(),
          unit: z.enum(["PIXELS", "PERCENT"])
        }))
      }).optional(),
      operations: z.array(
        z.object({
          nodeId: z.string().refine(isValidNodeId),
          spacings: z.array(z.object({
            start: z.number(),
            end: z.number(),
            value: z.number(),
            unit: z.enum(["PIXELS", "PERCENT"])
          }))
        })
      ).optional(),
      options: z.object({
        skipErrors: z.boolean().optional(),
        loadMissingFonts: z.boolean().optional()
      }).optional()
    },
    {
      title: "Set Letter Spacing (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { operation: { nodeId: "123:456", spacings: [{ start: 0, end: 5, value: 2, unit: "PIXELS" }] } },
        { operations: [
            { nodeId: "123:456", spacings: [{ start: 0, end: 5, value: 2, unit: "PIXELS" }] },
            { nodeId: "789:101", spacings: [{ start: 0, end: 10, value: 150, unit: "PERCENT" }] }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma text node ID.",
        "Ranges must be within the text length.",
        "Unit must be PIXELS or PERCENT.",
        "You must provide either operation or operations."
      ],
      extraInfo: "Use this command to update the letter spacing for one or more text nodes, supporting both single and batch operations."
    },
    async ({ operation, operations, options }) => {
      let ops = [];
      if (Array.isArray(operations) && operations.length > 0) {
        ops = operations;
      } else if (operation && operation.nodeId && Array.isArray(operation.spacings)) {
        ops = [operation];
      } else {
        return { content: [{ type: "text", text: "Error: Provide either operation or operations array." }] };
      }
      // Forward to plugin/Figma client for actual letter spacing application
      await figmaClient.executeCommand("set_letter_spacing", ops.length === 1
        ? { operation: ops[0], options }
        : { operations: ops, options }
      );
      return { content: [{ type: "text", text: `Updated letter spacing for ${ops.length} node(s)` }] };
    }
  );
}

/**
 * Registers the unified "set_text_case" tool on the MCP server.
 */
export function registerTextCaseTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_text_case",
    `Sets the text case for one or more text nodes in Figma, supporting all Figma text case types and range-based updates.

Input:
  - operation: (optional) Single config { nodeId, ranges: [{ start, end, value }] }
  - operations: (optional) Array of configs [{ nodeId, ranges: [...] }]
  - options: (optional) { skipErrors?: boolean, loadMissingFonts?: boolean }

At least one of operation or operations is required.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the update result.

Examples:
  // Single
  { operation: { nodeId: "123:456", ranges: [{ start: 0, end: 5, value: "UPPER" }] } }
  // Batch
  { operations: [
      { nodeId: "123:456", ranges: [{ start: 0, end: 5, value: "UPPER" }] },
      { nodeId: "789:101", ranges: [{ start: 0, end: 10, value: "TITLE" }] }
    ]
  }
`,
    {
      operation: z.object({
        nodeId: z.string().refine(isValidNodeId),
        ranges: z.array(z.object({
          start: z.number(),
          end: z.number(),
          value: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE", "SMALL_CAPS", "SMALL_CAPS_FORCED"])
        }))
      }).optional(),
      operations: z.array(
        z.object({
          nodeId: z.string().refine(isValidNodeId),
          ranges: z.array(z.object({
            start: z.number(),
            end: z.number(),
            value: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE", "SMALL_CAPS", "SMALL_CAPS_FORCED"])
          }))
        })
      ).optional(),
      options: z.object({
        skipErrors: z.boolean().optional(),
        loadMissingFonts: z.boolean().optional()
      }).optional()
    },
    {
      title: "Set Text Case (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { operation: { nodeId: "123:456", ranges: [{ start: 0, end: 5, value: "UPPER" }] } },
        { operations: [
            { nodeId: "123:456", ranges: [{ start: 0, end: 5, value: "UPPER" }] },
            { nodeId: "789:101", ranges: [{ start: 0, end: 10, value: "TITLE" }] }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma text node ID.",
        "Ranges must be within the text length.",
        "Value must be a valid Figma TextCase.",
        "You must provide either operation or operations."
      ],
      extraInfo: "Use this command to update the text case for one or more text nodes, supporting both single and batch operations."
    },
    async ({ operation, operations, options }) => {
      let ops = [];
      if (Array.isArray(operations) && operations.length > 0) {
        ops = operations;
      } else if (operation && operation.nodeId && Array.isArray(operation.ranges)) {
        ops = [operation];
      } else {
        return { content: [{ type: "text", text: "Error: Provide either operation or operations array." }] };
      }
      // Forward to plugin/Figma client for actual text case application
      await figmaClient.executeCommand("set_text_case", ops.length === 1
        ? { operation: ops[0], options }
        : { operations: ops, options }
      );
      return { content: [{ type: "text", text: `Updated text case for ${ops.length} node(s)` }] };
    }
  );
}

/**
 * Registers the unified "set_text_decoration" tool on the MCP server.
 */
export function registerTextDecorationTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_text_decoration",
    `Sets the text decoration for one or more text nodes in Figma, supporting all Figma text decoration types and range-based updates.

Input:
  - operation: (optional) Single config { nodeId, ranges: [{ start, end, type, style }] }
  - operations: (optional) Array of configs [{ nodeId, ranges: [...] }]
  - options: (optional) { skipErrors?: boolean, loadMissingFonts?: boolean }

At least one of operation or operations is required.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the update result.

Examples:
  // Single
  { operation: { nodeId: "123:456", ranges: [{ start: 0, end: 5, type: "UNDERLINE" }] } }
  // Batch
  { operations: [
      { nodeId: "123:456", ranges: [{ start: 0, end: 5, type: "UNDERLINE" }] },
      { nodeId: "789:101", ranges: [{ start: 0, end: 10, type: "STRIKETHROUGH" }] }
    ]
  }
`,
    {
      operation: z.object({
        nodeId: z.string().refine(isValidNodeId),
        ranges: z.array(z.object({
          start: z.number(),
          end: z.number(),
          type: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"]),
          style: z.record(z.any()).optional()
        }))
      }).optional(),
      operations: z.array(
        z.object({
          nodeId: z.string().refine(isValidNodeId),
          ranges: z.array(z.object({
            start: z.number(),
            end: z.number(),
            type: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"]),
            style: z.record(z.any()).optional()
          }))
        })
      ).optional(),
      options: z.object({
        skipErrors: z.boolean().optional(),
        loadMissingFonts: z.boolean().optional()
      }).optional()
    },
    {
      title: "Set Text Decoration (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { operation: { nodeId: "123:456", ranges: [{ start: 0, end: 5, type: "UNDERLINE" }] } },
        { operations: [
            { nodeId: "123:456", ranges: [{ start: 0, end: 5, type: "UNDERLINE" }] },
            { nodeId: "789:101", ranges: [{ start: 0, end: 10, type: "STRIKETHROUGH" }] }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma text node ID.",
        "Ranges must be within the text length.",
        "Type must be a valid Figma TextDecoration.",
        "You must provide either operation or operations."
      ],
      extraInfo: "Use this command to update the text decoration for one or more text nodes, supporting both single and batch operations."
    },
    async ({ operation, operations, options }) => {
      let ops = [];
      if (Array.isArray(operations) && operations.length > 0) {
        ops = operations;
      } else if (operation && operation.nodeId && Array.isArray(operation.ranges)) {
        ops = [operation];
      } else {
        return { content: [{ type: "text", text: "Error: Provide either operation or operations array." }] };
      }
      // Forward to plugin/Figma client for actual text decoration application
      await figmaClient.executeCommand("set_text_decoration", ops.length === 1
        ? { operation: ops[0], options }
        : { operations: ops, options }
      );
      return { content: [{ type: "text", text: `Updated text decoration for ${ops.length} node(s)` }] };
    }
  );
}

/**
 * Registers the unified "set_text_style" tool on the MCP server.
 */
export function registerTextStyleTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    "set_text_style",
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
      await figmaClient.executeCommand("set_text_style", updates.length === 1
        ? { nodeId: updates[0].nodeId, styles: updates[0].styles }
        : { entries: updates }
      );
      return { content: [{ type: "text", text: `Updated text style for ${updates.length} node(s)` }] };
    }
  );
}
