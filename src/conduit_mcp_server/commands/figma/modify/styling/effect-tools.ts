import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { EffectSchema } from "../../property-manipulation/effect-schema.ts";

/**
 * Registers effect-related styling commands:
 * - apply_effect_style
 * - set_effect
 * - create_effect_style_variable
 */
export function registerEffectTools(server: McpServer, figmaClient: FigmaClient) {
  // 1. apply_effect_style
  const ApplyEffectStyleEntrySchema = z.object({
    nodeId: z.string()
      .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
      .describe("The unique Figma node ID to update."),
    effectStyleId: z.string()
      .min(1)
      .max(100)
      .describe("The ID of the effect style to apply."),
  });

  const ApplyEffectStyleParamsSchema = z.object({
    entries: z.union([
      ApplyEffectStyleEntrySchema,
      z.array(ApplyEffectStyleEntrySchema).min(1).max(100)
    ])
  });

  server.tool(
    "apply_effect_style",
    `Apply one or more effect styles to node(s) in Figma.

Params:
  - entries: Either a single application or an array of applications.

Returns:
  - content: Array containing a text message with the updated node(s) ID(s) or a summary.
`,
    ApplyEffectStyleParamsSchema.shape,
    {
      title: "Apply Effect Style (Single or Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entries: { nodeId: "123:456", effectStyleId: "S:effect123" } },
        { entries: [
          { nodeId: "123:456", effectStyleId: "S:effect123" },
          { nodeId: "789:101", effectStyleId: "S:effect456" }
        ]}
      ]),
      edgeCaseWarnings: [
        "Each entry must have a valid nodeId and effectStyleId."
      ],
      extraInfo: "Supports both single and batch effect style application in one call."
    },
    async ({ entries }) => {
      const entryList = Array.isArray(entries) ? entries : [entries];
      const results = await figmaClient.executeCommand("apply_effect_style", { entries: entryList });
      return {
        content: [
          {
            type: "text",
            text: entryList.length === 1
              ? `Applied effect style to ${entryList[0].nodeId}`
              : `Batch applied effect styles: ${results.filter(r => r.success).length}/${results.length} successes`
          }
        ],
        _meta: { results }
      };
    }
  );

  // 2. set_effect
  const SetEffectEntrySchema = z.object({
    nodeId: z.string()
      .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
      .describe("The unique Figma node ID to update."),
    effects: z.union([
      EffectSchema,
      z.array(EffectSchema).min(1).max(20)
    ]).optional()
      .describe("Effect or array of effects to set directly."),
    effectStyleId: z.string().min(1).max(100).optional()
      .describe("Optional. The ID of the effect style variable to apply."),
  }).refine(
    (obj) => !!obj.effects || !!obj.effectStyleId,
    { message: "Either effects or effectStyleId must be provided." }
  );

  const SetEffectParamsSchema = z.object({
    entries: z.union([
      SetEffectEntrySchema,
      z.array(SetEffectEntrySchema).min(1).max(100)
    ])
  });

  server.tool(
    "set_effect",
    `Set effect(s) directly or by style variable on one or more nodes in Figma.

Params:
  - entries: Either a single application or an array of applications.

Returns:
  - content: Array containing a text message with the updated node(s) ID(s) or a summary.
`,
    SetEffectParamsSchema.shape,
    {
      title: "Set Effect (Single or Batch, Direct or Style Variable)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entries: { nodeId: "123:456", effects: { type: "DROP_SHADOW", color: "#000", radius: 4 } } },
        { entries: [
          { nodeId: "123:456", effects: [{ type: "DROP_SHADOW", color: "#000", radius: 4 }] },
          { nodeId: "789:101", effectStyleId: "S:effect123" }
        ]}
      ]),
      edgeCaseWarnings: [
        "Each entry must have a valid nodeId and either effects or effectStyleId."
      ],
      extraInfo: "Supports both direct and style variable effect application, single or batch."
    },
    async ({ entries }) => {
      const entryList = Array.isArray(entries) ? entries : [entries];
      const results = await figmaClient.executeCommand("set_effect", { entries: entryList });
      return {
        content: [
          {
            type: "text",
            text: entryList.length === 1
              ? `Set effect(s) for ${entryList[0].nodeId}`
              : `Batch set effects: ${results.filter(r => r.success).length}/${results.length} successes`
          }
        ],
        _meta: { results }
      };
    }
  );

  // 3. create_effect_style_variable
  const EffectStyleDefSchema = EffectSchema.extend({
    name: z.string().min(1).max(100)
      .describe("Name for the effect style. Must be a non-empty string up to 100 characters.")
  });

  const CreateEffectStyleParamsSchema = z.object({
    effects: z.union([
      EffectStyleDefSchema,
      z.array(EffectStyleDefSchema).min(1).max(20)
    ])
  });

  server.tool(
    "create_effect_style_variable",
    `Creates one or more effect style variables in Figma.

Params:
  - effects: Either a single effect definition or an array of effect definitions.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created effect style(s) ID(s) or a summary.
`,
    CreateEffectStyleParamsSchema.shape,
    {
      title: "Create Effect Style Variable (Single or Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { effects: { name: "Soft Shadow", type: "DROP_SHADOW", color: "#000", radius: 8, opacity: 0.2 } },
        { effects: [
          { name: "Soft Shadow", type: "DROP_SHADOW", color: "#000", radius: 8, opacity: 0.2 },
          { name: "Blur", type: "LAYER_BLUR", radius: 12 }
        ]}
      ]),
      edgeCaseWarnings: [
        "Name must be a non-empty string.",
        "At least one effect is required."
      ],
      extraInfo: "Creates one or more reusable effect styles for fills or strokes."
    },
    async ({ effects }) => {
      const effectList = Array.isArray(effects) ? effects : [effects];
      const results = await figmaClient.executeCommand("create_effect_style_variable", { effects: effectList });
      return {
        content: [
          {
            type: "text",
            text: effectList.length === 1
              ? `Created effect style ${results[0]?.id || ""}`
              : `Batch created ${results.length} effect style variables`
          }
        ],
        _meta: { results }
      };
    }
  );
}
