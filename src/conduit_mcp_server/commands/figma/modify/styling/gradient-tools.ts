import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers gradient-related styling commands:
 * - create_gradient_variable (unified: supports single or batch)
 * - apply_gradient_style (unified: supports single or batch)
 * - apply_direct_gradient
 */
export function registerGradientTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified Gradient Variable Schema
  const GradientStopSchema = z.object({
    position: z.number().min(0).max(1)
      .describe("Position of the stop (0-1)."),
    color: z.tuple([
      z.number().min(0).max(1).describe("Red channel (0-1)"),
      z.number().min(0).max(1).describe("Green channel (0-1)"),
      z.number().min(0).max(1).describe("Blue channel (0-1)"),
      z.number().min(0).max(1).describe("Alpha channel (0-1)")
    ]).describe("RGBA color array (4 numbers, each 0-1)."),
  });

  const GradientDefSchema = z.object({
    name: z.string().min(1).max(100)
      .describe("Name for the gradient style. Must be a non-empty string up to 100 characters."),
    gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"])
      .describe('Type of gradient: "LINEAR", "RADIAL", "ANGULAR", or "DIAMOND".'),
    stops: z.array(GradientStopSchema).min(2).max(10)
      .describe("Array of color stops. Each stop is an object with position and color. Must contain 2 to 10 stops."),
    mode: z.string().optional()
      .describe("Optional. Gradient mode."),
    opacity: z.number().min(0).max(1).optional()
      .describe("Optional. Opacity of the gradient (0-1)."),
    transformMatrix: z.array(z.array(z.number())).optional()
      .describe("Optional. Transform matrix for the gradient."),
  });

  // Accepts either a single gradient or an array of gradients
  const CreateGradientParamsSchema = z.object({
    gradients: z.union([
      GradientDefSchema,
      z.array(GradientDefSchema).min(1).max(20)
    ])
  });

  server.tool(
    "create_gradient_variable",
    `Creates one or more gradient paint styles in Figma.

Params:
  - gradients: Either a single gradient definition or an array of gradient definitions.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created gradient(s) ID(s) or a summary.
`,
    CreateGradientParamsSchema.shape,
    {
      title: "Create Gradient Variable (Single or Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { gradients: { name: "Primary Gradient", gradientType: "LINEAR", stops: [
          { position: 0, color: [1, 0, 0, 1] },
          { position: 1, color: [0, 0, 1, 1] }
        ] } },
        { gradients: [
          { name: "Primary Gradient", gradientType: "LINEAR", stops: [
            { position: 0, color: [1, 0, 0, 1] },
            { position: 1, color: [0, 0, 1, 1] }
          ] },
          { name: "Secondary Gradient", gradientType: "RADIAL", stops: [
            { position: 0, color: [0, 1, 0, 1] },
            { position: 1, color: [0, 0, 0, 1] }
          ] }
        ]}
      ]),
      edgeCaseWarnings: [
        "Name must be a non-empty string.",
        "At least two color stops are required.",
        "Color values must be between 0 and 1."
      ],
      extraInfo: "Creates one or more reusable gradient styles for fills or strokes."
    },
    async ({ gradients }) => {
      const gradientList = Array.isArray(gradients) ? gradients : [gradients];
      const results = await figmaClient.createGradientVariables({ gradients: gradientList });
      return {
        content: [
          {
            type: "text",
            text: gradientList.length === 1
              ? `Created gradient ${results[0]?.id || ""}`
              : `Batch created ${results.length} gradient variables`
          }
        ],
        _meta: { results }
      };
    }
  );

  // Unified Apply Gradient Style
  const ApplyGradientEntrySchema = z.object({
    nodeId: z.string()
      .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
      .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
    gradientStyleId: z.string()
      .min(1)
      .max(100)
      .describe("The ID of the gradient style to apply. Must be a non-empty string up to 100 characters."),
    applyTo: z.enum(["FILL", "STROKE", "BOTH"]),
  });

  const ApplyGradientParamsSchema = z.object({
    entries: z.union([
      ApplyGradientEntrySchema,
      z.array(ApplyGradientEntrySchema).min(1).max(100)
    ])
  });

  server.tool(
    "apply_gradient_style",
    `Apply one or more gradient styles to node(s) in Figma.

Params:
  - entries: Either a single application or an array of applications.

Returns:
  - content: Array containing a text message with the updated node(s) ID(s) or a summary.
    Example: { "content": [{ "type": "text", "text": "Applied gradient to 123:456" }] }
`,
    ApplyGradientParamsSchema.shape,
    {
      title: "Apply Gradient Style (Single or Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entries: { nodeId: "123:456", gradientStyleId: "S:123", applyTo: "FILL" } },
        { entries: [
          { nodeId: "123:456", gradientStyleId: "S:123", applyTo: "FILL" },
          { nodeId: "789:101", gradientStyleId: "S:456", applyTo: "STROKE" }
        ]}
      ]),
      edgeCaseWarnings: [
        "Each entry must have a valid nodeId and gradientStyleId.",
        "applyTo must be one of FILL, STROKE, BOTH."
      ],
      extraInfo: "Supports both single and batch gradient style application in one call."
    },
    async ({ entries }) => {
      const entryList = Array.isArray(entries) ? entries : [entries];
      const results = await figmaClient.applyGradientStyles({ entries: entryList });
      return {
        content: [
          {
            type: "text",
            text: entryList.length === 1
              ? `Applied gradient to ${entryList[0].nodeId}`
              : `Batch applied gradients: ${results.filter(r => r.success).length}/${results.length} successes`
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
