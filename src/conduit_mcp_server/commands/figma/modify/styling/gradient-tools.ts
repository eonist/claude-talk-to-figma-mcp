import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers gradient-related styling commands:
 * - create_gradient_variable
 * - create_gradient_variables
 * - apply_gradient_style
 * - apply_gradient_styles
 * - apply_direct_gradient
 */
export function registerGradientTools(server: McpServer, figmaClient: FigmaClient) {
  // Create Gradient Variable
  server.tool(
    "create_gradient_variable",
    `Creates a gradient paint style in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created gradient's ID.
`,
    {
      name: z.string()
        .min(1)
        .max(100)
        .describe("Name for the gradient style. Must be a non-empty string up to 100 characters."),
      gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"])
        .describe('Type of gradient: "LINEAR", "RADIAL", "ANGULAR", or "DIAMOND".'),
      stops: z.array(
        z.object({
          position: z.number().min(0).max(1)
            .describe("Position of the stop (0-1)."),
          color: z.tuple([
            z.number().min(0).max(1).describe("Red channel (0-1)"),
            z.number().min(0).max(1).describe("Green channel (0-1)"),
            z.number().min(0).max(1).describe("Blue channel (0-1)"),
            z.number().min(0).max(1).describe("Alpha channel (0-1)")
          ]).describe("RGBA color array (4 numbers, each 0-1)."),
        })
      )
      .min(2)
      .max(10)
      .describe("Array of color stops. Each stop is an object with position and color. Must contain 2 to 10 stops."),
    },
    {
      title: "Create Gradient Variable",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          name: "Primary Gradient",
          gradientType: "LINEAR",
          stops: [
            { position: 0, color: [1, 0, 0, 1] },
            { position: 1, color: [0, 0, 1, 1] }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Name must be a non-empty string.",
        "At least two color stops are required.",
        "Color values must be between 0 and 1."
      ],
      extraInfo: "Creates a reusable gradient style for fills or strokes."
    },
    async ({ name, gradientType, stops }) => {
      const result = await figmaClient.executeCommand("create_gradient_variable", { name, gradientType, stops });
      return { content: [{ type: "text", text: `Created gradient ${result.id}` }] };
    }
  );

  // Batch create gradient variables
  server.tool(
    "create_gradient_variables",
    `Batch create gradient variables in Figma.

Returns:
  - content: Array containing a text message with the number of gradient variables created.
    Example: { "content": [{ "type": "text", "text": "Batch created 3 gradient variables" }] }
`,
    {
      gradients: z.array(
        z.object({
          name: z.string().min(1).max(100)
            .describe("Name for the gradient style. Must be a non-empty string up to 100 characters."),
          gradientType: z.enum(["LINEAR","RADIAL","ANGULAR","DIAMOND"])
            .describe('Type of gradient: "LINEAR", "RADIAL", "ANGULAR", or "DIAMOND".'),
          stops: z.array(
            z.object({
              position: z.number().min(0).max(1)
                .describe("Position of the stop (0-1)."),
              color: z.tuple([
                z.number().min(0).max(1).describe("Red channel (0-1)"),
                z.number().min(0).max(1).describe("Green channel (0-1)"),
                z.number().min(0).max(1).describe("Blue channel (0-1)"),
                z.number().min(0).max(1).describe("Alpha channel (0-1)")
              ]).describe("RGBA color array (4 numbers, each 0-1).")
            })
          ).min(2).max(10)
            .describe("Array of color stops. Each stop is an object with position and color. Must contain 2 to 10 stops."),
          mode: z.string().optional()
            .describe("Optional. Gradient mode."),
          opacity: z.number().min(0).max(1).optional()
            .describe("Optional. Opacity of the gradient (0-1)."),
          transformMatrix: z.array(z.array(z.number())).optional()
            .describe("Optional. Transform matrix for the gradient."),
        })
      ).min(1).max(20)
      .describe("Array of gradient definition objects. Must contain 1 to 20 items."),
    },
    async ({ gradients }) => {
      const results = await figmaClient.createGradientVariables({ gradients });
      return {
        content: [
          {
            type: "text",
            text: `Batch created ${results.length} gradient variables`
          }
        ],
        _meta: { results }
      };
    }
  );

  // Apply Gradient Style
  server.tool(
    "apply_gradient_style",
    `Apply a gradient style to a node in Figma.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Applied gradient to 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      gradientStyleId: z.string()
        .min(1)
        .max(100)
        .describe("The ID of the gradient style to apply. Must be a non-empty string up to 100 characters."),
      applyTo: z.enum(["FILL", "STROKE", "BOTH"]),
    },
    async ({ nodeId, gradientStyleId, applyTo }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("apply_gradient_style", { nodeId: id, gradientStyleId, applyTo });
      return { content: [{ type: "text", text: `Applied gradient to ${id}` }] };
    }
  );

  // Batch apply gradient styles
  server.tool(
    "apply_gradient_styles",
    `Batch apply gradient styles to nodes in Figma.

Returns:
  - content: Array containing a text message with the number of gradients applied.
    Example: { "content": [{ "type": "text", "text": "Batch applied gradients: 2/2 successes" }] }
`,
    {
      entries: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .describe("The unique Figma node ID to style. Must be a string in the format '123:456'."),
          gradientStyleId: z.string()
            .min(1)
            .max(100)
            .describe("The ID of the gradient style to apply. Must be a non-empty string up to 100 characters."),
          applyTo: z.enum(["FILL","STROKE","BOTH"])
        })
      ).min(1).max(100),
    },
    async ({ entries }) => {
      const results = await figmaClient.applyGradientStyles({ entries });
      return {
        content: [
          {
            type: "text",
            text: `Batch applied gradients: ${results.filter(r => r.success).length}/${results.length} successes`
          }
        ],
        _meta: { results }
      };
    }
  );

  // Apply Direct Gradient
  server.tool(
    "apply_direct_gradient",
    `Apply a gradient directly to a node without using styles.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Applied direct gradient to 123:456" }] }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to apply gradient to. Must be a string in the format '123:456'."),
      gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"])
        .describe('Type of gradient: "LINEAR", "RADIAL", "ANGULAR", or "DIAMOND".'),
      stops: z.array(
        z.object({
          position: z.number().min(0).max(1)
            .describe("Position of the stop (0-1)."),
          color: z.tuple([
            z.number().min(0).max(1).describe("Red channel (0-1)"),
            z.number().min(0).max(1).describe("Green channel (0-1)"),
            z.number().min(0).max(1).describe("Blue channel (0-1)"),
            z.number().min(0).max(1).describe("Alpha channel (0-1)")
          ]).describe("RGBA color array (4 numbers, each 0-1).")
        })
      ).min(2).max(10)
        .describe("Array of color stops. Each stop is an object with position and color. Must contain 2 to 10 stops."),
      applyTo: z.enum(["FILL", "STROKE", "BOTH"]).default("FILL")
        .describe('Optional. Where to apply the gradient: "FILL", "STROKE", or "BOTH". Defaults to "FILL".'),
    },
    async ({ nodeId, gradientType, stops, applyTo }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("apply_direct_gradient", { nodeId: id, gradientType, stops, applyTo });
      return { content: [{ type: "text", text: `Applied direct gradient to ${id}` }] };
    }
  );
}
