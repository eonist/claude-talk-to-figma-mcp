import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
//import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { EffectSchema } from "./schema/effect-schema.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers effect-related styling commands:
 * - apply_effect_style
 * - set_effect
 * - create_effect_style_variable
 */
export function registerEffectTools(server: McpServer, figmaClient: FigmaClient) {
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
    ]).describe("One or more effect set operations to perform. Can be a single object or an array.")
  });

  // 3. create_effect_style_variable
  const EffectStyleDefSchema = EffectSchema.extend({
    name: z.string().min(1).max(100)
      .describe("Name for the effect style. Must be a non-empty string up to 100 characters.")
  });

  const CreateEffectStyleParamsSchema = z.object({
    effects: z.union([
      EffectStyleDefSchema,
      z.array(EffectStyleDefSchema).min(1).max(20)
    ]).describe("One or more effect style definitions to create. Can be a single object or an array.")
  });

  server.tool(
    MCP_COMMANDS.SET_EFFECT,
    `Set effect(s) directly or by style variable on one or more nodes in Figma.

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
      const results = await figmaClient.setEffects({ entries: entryList });
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

  // (Removed duplicate declarations of EffectStyleDefSchema and CreateEffectStyleParamsSchema)
}
