import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

/**
 * Registers gradient-related styling commands:
 * - create_gradient_style (unified: supports single or batch)
 * - set_gradient (unified: supports single or batch, direct or style)
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

  // Unified Create Gradient Style
  server.tool(
    MCP_COMMANDS.CREATE_GRADIENT_STYLE,
    `Creates one or more gradient style variables in Figma.

Params:
  - gradients: Either a single gradient definition or an array of gradient definitions.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created gradient(s) ID(s) or a summary.
`,
    CreateGradientParamsSchema.shape,
    {
      title: "Create Gradient Style (Single or Batch)",
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
      const results = await figmaClient.createGradientVariable({ gradients: gradientList });
      return {
        content: [
          {
            type: "text",
            text: gradientList.length === 1
              ? `Created gradient ${results[0]?.id || ""}`
              : `Batch created ${results.length} gradient styles`
          }
        ],
        _meta: { results }
      };
    }
  );

  // Unified Set Gradient (direct or style, single or batch)
  const SetGradientEntrySchema = z.object({
    nodeId: z.string()
      .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
      .describe("The unique Figma node ID to update."),
    // Direct gradient args
    gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"]).optional()
      .describe('Type of gradient: "LINEAR", "RADIAL", "ANGULAR", or "DIAMOND".'),
    stops: z.array(GradientStopSchema).min(2).max(10).optional()
      .describe("Array of color stops. Each stop is an object with position and color. Must contain 2 to 10 stops."),
    // Style variable
    gradientStyleId: z.string().min(1).max(100).optional()
      .describe("The ID of the gradient style to apply."),
    // Common
    applyTo: z.enum(["FILL", "STROKE", "BOTH"]).optional()
      .describe('Where to apply the gradient: "FILL", "STROKE", or "BOTH".'),
  }).refine(
    (obj) => (!!obj.gradientType && !!obj.stops) || !!obj.gradientStyleId,
    { message: "Either gradientType+stops or gradientStyleId must be provided." }
  );

  const SetGradientParamsSchema = z.object({
    entries: z.union([
      SetGradientEntrySchema,
      z.array(SetGradientEntrySchema).min(1).max(100)
    ])
  });

  server.tool(
    MCP_COMMANDS.SET_GRADIENT,
    `Set a gradient on one or more nodes in Figma, either directly or by style variable.

Params:
  - entries: Either a single application or an array of applications.

Returns:
  - content: Array containing a text message with the updated node(s) ID(s) or a summary.
`,
    SetGradientParamsSchema.shape,
    {
      title: "Set Gradient (Single or Batch, Direct or Style Variable)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entries: { nodeId: "123:456", gradientType: "LINEAR", stops: [
          { position: 0, color: [1, 0, 0, 1] },
          { position: 1, color: [0, 0, 1, 1] }
        ], applyTo: "FILL" } },
        { entries: { nodeId: "123:456", gradientStyleId: "S:gradient123", applyTo: "FILL" } },
        { entries: [
          { nodeId: "123:456", gradientType: "LINEAR", stops: [
            { position: 0, color: [1, 0, 0, 1] },
            { position: 1, color: [0, 0, 1, 1] }
          ], applyTo: "FILL" },
          { nodeId: "789:101", gradientStyleId: "S:gradient123", applyTo: "STROKE" }
        ]}
      ]),
      edgeCaseWarnings: [
        "Each entry must have a valid nodeId and either direct gradient args or gradientStyleId.",
        "If using direct args, both gradientType and stops are required."
      ],
      extraInfo: "Supports both direct and style variable gradient application, single or batch."
    },
    async ({ entries }) => {
      const entryList = Array.isArray(entries) ? entries : [entries];
      const results = await figmaClient.executeCommand(MCP_COMMANDS.SET_GRADIENT, { entries: entryList });
      return {
        content: [
          {
            type: "text",
            text: entryList.length === 1
              ? `Set gradient for ${entryList[0].nodeId}`
              : `Batch set gradients: ${results.filter(r => r.success).length}/${results.length} successes`
          }
        ],
        _meta: { results }
      };
    }
  );
}
