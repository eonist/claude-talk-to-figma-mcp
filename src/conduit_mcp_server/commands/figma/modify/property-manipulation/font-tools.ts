import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { FontFamilyStyleSchema, FontSizeSchema, FontWeightSchema } from "./font-schema.js";

/**
 * Registers property-manipulation-related modify commands on the MCP server.
 *
 * This function adds tools for setting font properties and loading fonts asynchronously in Figma.
 * It includes commands for setting font name, size, weight, letter spacing, line height,
 * paragraph spacing, text case, text decoration, and loading fonts.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerFontTools(server, figmaClient);
 */
export function registerFontTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified Set Font Name(s) - single or batch
  const SingleFontSchema = z.object({
    nodeId: z.string()
      .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
      .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
    ...FontFamilyStyleSchema.shape,
  });

  const BatchFontsSchema = z.array(SingleFontSchema);

  server.tool(
    "set_font_name",
    `Sets the font family and style of one or more text nodes in Figma.

Accepts either:
  - font: A single font configuration object.
  - fonts: An array of font configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node(s) ID(s).
`,
    {
      font: SingleFontSchema.optional()
        .describe("A single font configuration object. Each object should include nodeId, family, and style."),
      fonts: BatchFontsSchema.optional()
        .describe("An array of font configuration objects. Each object should include nodeId, family, and style."),
    },
    {
      title: "Set Font Name(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async (args) => {
      let fontConfigs;
      if (args.fonts) {
        fontConfigs = args.fonts;
      } else if (args.font) {
        fontConfigs = [args.font];
      } else {
        throw new Error("You must provide either 'font' or 'fonts' as input.");
      }

      // Optionally, preload all fonts up front for performance
      const fontSet = new Set();
      for (const cfg of fontConfigs) {
        fontSet.add(`${cfg.family}|||${cfg.style}`);
      }
      await Promise.all(
        Array.from(fontSet).map(key => {
          const [family, style] = key.split("|||");
          return figmaClient.executeCommand("load_font_async", { family, style });
        })
      );

      const results = [];
      const errors = [];
      for (const cfg of fontConfigs) {
        try {
          await figmaClient.executeCommand("set_font_name", {
            nodeId: ensureNodeIdIsString(cfg.nodeId),
            family: cfg.family,
            style: cfg.style
          });
          results.push(cfg.nodeId);
        } catch (err) {
          errors.push({ nodeId: cfg.nodeId, error: err?.message || String(err) });
        }
      }

      let msg = "";
      if (results.length === 1) {
        msg = `Font set for ${results[0]}`;
      } else if (results.length > 1) {
        msg = `Fonts set for ${results.join(", ")}`;
      }
      if (errors.length > 0) {
        msg += `; Errors: ${errors.map(e => `${e.nodeId}: ${e.error}`).join("; ")}`;
      }
      return { content: [{ type: "text", text: msg }] };
    }
  );

  // Set Font Size
  server.tool(
    "set_font_size",
    `Set the font size of a text node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      ...FontSizeSchema.shape,
    },
    {
      title: "Set Font Size",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, fontSize }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_font_size", { nodeId: id, fontSize });
      return { content: [{ type: "text", text: `Font size set for ${id}` }] };
    }
  );

  // Set Font Weight
  server.tool(
    "set_font_weight",
    `Set the font weight of a text node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      ...FontWeightSchema.shape,
    },
    {
      title: "Set Font Weight",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, weight }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_font_weight", { nodeId: id, weight });
      return { content: [{ type: "text", text: `Font weight set for ${id}` }] };
    }
  );


  // Set Line Height
  server.tool(
    "set_line_height",
    `Set the line height of a text node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma text node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      lineHeight: z.number()
        .min(1)
        .max(1000)
        .describe("The line height value to set. Must be a positive number between 1 and 1000."),
      unit: z.enum(["PIXELS", "PERCENT", "AUTO"]).optional()
        .describe('Optional. The unit for line height: "PIXELS", "PERCENT", or "AUTO". Defaults to "AUTO" if omitted.'),
    },
    {
      title: "Set Line Height",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false
    },
    async ({ nodeId, lineHeight, unit }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_line_height", { nodeId: id, lineHeight, unit });
      return { content: [{ type: "text", text: `Line height set for ${id}` }] };
    }
  );




  // Load Font Async
  server.tool(
    "load_font_async",
    `Load a font asynchronously in Figma.

Returns:
  - content: Array containing a text message with the loaded font.
    Example: { "content": [{ "type": "text", "text": "Font loaded: Roboto" }] }
`,
    {
      ...FontFamilyStyleSchema.shape,
    },
    async ({ family, style }) => {
      await figmaClient.executeCommand("load_font_async", { family, style });
      return { content: [{ type: "text", text: `Font loaded: ${family}` }] };
    }
  );
}
