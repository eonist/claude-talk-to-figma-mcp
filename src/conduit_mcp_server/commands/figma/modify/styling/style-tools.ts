import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { FillPropsSchema, StrokePropsSchema } from "./style-schema.js";

/**
 * Registers style application command:
 * - set_style (unified: supports single or batch)
 */
export function registerStyleTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified Set Style Tool (single or batch)
  const StyleEntrySchema = z.object({
    nodeId: z.string()
      .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
      .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
    fillProps: FillPropsSchema.optional(),
    strokeProps: StrokePropsSchema.optional(),
  });

  // Accepts either a single entry or an array of entries
  const ParamsSchema = z.object({
    entries: z.union([
      StyleEntrySchema,
      z.array(StyleEntrySchema).min(1).max(100)
    ])
  });

  server.tool(
    "set_style",
    `Sets both fill and stroke properties for one or more Figma nodes.

Params:
  - entries: Either a single style entry or an array of style entries.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node(s) ID(s) or a summary.
`,
    ParamsSchema.shape,
    {
      title: "Set Style (Single or Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entries: { nodeId: "123:456", fillProps: { color: [1, 0, 0, 1] }, strokeProps: { color: [0, 0, 0, 1], weight: 2 } } },
        { entries: [
          { nodeId: "123:456", fillProps: { color: [1, 0, 0, 1] } },
          { nodeId: "789:101", strokeProps: { color: [0, 0, 0, 1], weight: 2 } }
        ]}
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "fillProps and strokeProps are both optional, but at least one should be provided.",
        "Color arrays must have four values between 0 and 1."
      ],
      extraInfo: "Supports both single and batch style updates in one call."
    },
    async ({ entries }) => {
      const entryList = Array.isArray(entries) ? entries : [entries];
      const results: string[] = [];
      for (const e of entryList) {
        const id = ensureNodeIdIsString(e.nodeId);
        if (e.fillProps?.color) {
          const [r, g, b, a] = e.fillProps.color;
          await figmaClient.setFillColor({ nodeId: id, r, g, b, a });
        }
        if (e.strokeProps?.color) {
          const [r, g, b, a] = e.strokeProps.color;
          await figmaClient.setStrokeColor({ nodeId: id, r, g, b, a, weight: e.strokeProps.weight });
        }
        results.push(id);
      }
      return { content: [{ type: "text", text: `Styled ${results.length} node(s): ${results.join(", ")}` }] };
    }
  );
}
