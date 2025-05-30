import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
//import { EffectsArraySchema } from "./schema/effect-schema.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { EffectSchema } from "./schema/effect-schema.js";

/**
 * Registers effect-related commands on the MCP server.
 *
 * This function adds tools named "set_effect" and "set_effect_style_id" to the MCP server,
 * enabling setting visual effects and applying effect styles to nodes in Figma.
 * It validates inputs, executes corresponding Figma commands, and returns informative results.
 *
 * @param server - The MCP server instance to register the tools on
 * @param figmaClient - The Figma client used to execute commands against the Figma API
 * @returns void
 *
 * @example
 * registerEffectsTools(server, figmaClient);
 */
export function registerEffectsTools(server: McpServer, figmaClient: FigmaClient) {
  // LOG: Registering apply_effect_style
  console.log("💥 [registerEffectsTools] Registering command:", MCP_COMMANDS.APPLY_EFFECT_STYLE);
  // Set Effect Style ID
  server.tool(
    MCP_COMMANDS.APPLY_EFFECT_STYLE,
    `Applies an effect style to a node in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      effectStyleId: z.string()
        .min(1)
        .max(100)
        .describe("The ID of the effect style to apply. Must be a non-empty string. Maximum length 100 characters."),
    },
    {
      title: "Set Effect Style ID",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", effectStyleId: "effect123" }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "effectStyleId must be a valid effect style identifier.",
        "Applying an invalid style ID will cause failure."
      ],
      extraInfo: "Applies a predefined effect style to a node."
    },
    async ({ nodeId, effectStyleId }) => {
      try {
        const id = ensureNodeIdIsString(nodeId);
        await figmaClient.setEffectStyleId({ nodeId: id, effectStyleId });
        const response = { success: true, results: [{ nodeId: id, effectStyleId, applied: true }] };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "apply_effect_style",
              params: { nodeId, effectStyleId }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
    }
  );
}
