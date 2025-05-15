import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";
import { FillPropsSchema, StrokePropsSchema } from "./style-schema.js";

/**
 * Registers style application commands:
 * - set_style
 * - set_styles
 */
export function registerStyleTools(server: McpServer, figmaClient: FigmaClient) {
  // Set Style Tool
  server.tool(
    "set_style",
    `Sets both fill and stroke properties for a Figma node.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      fillProps: FillPropsSchema.optional(),
      strokeProps: StrokePropsSchema.optional(),
    },
    {
      title: "Set Style",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456", fillProps: { color: [1, 0, 0, 1] }, strokeProps: { color: [0, 0, 0, 1], weight: 2 } }
      ]),
      edgeCaseWarnings: [
        "nodeId must be a valid Figma node ID.",
        "fillProps and strokeProps are both optional, but at least one should be provided.",
        "Color arrays must have four values between 0 and 1."
      ],
      extraInfo: "Sets both fill and stroke properties for a single node in one call."
    },
    async ({ nodeId, fillProps, strokeProps }) => {
      const id = ensureNodeIdIsString(nodeId);
      if (fillProps) {
        const [r, g, b, a] = fillProps.color || [0, 0, 0, 1];
        await figmaClient.setFillColor({ nodeId: id, r, g, b, a });
      }
      if (strokeProps) {
        const [r, g, b, a] = strokeProps.color || [0, 0, 0, 1];
        await figmaClient.setStrokeColor({ nodeId: id, r, g, b, a, weight: strokeProps.weight });
      }
      return { content: [{ type: "text", text: `Styled ${id}` }] };
    }
  );

  // Set Styles Tool
  server.tool(
    "set_styles",
    `Applies fill and/or stroke styles to multiple nodes in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes styled.
`,
    {
      entries: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
          fillProps: FillPropsSchema.optional(),
          strokeProps: StrokePropsSchema.optional(),
        })
      )
      .min(1)
      .max(100)
      .describe("Array of style entries. Must contain 1 to 100 items."),
    },
    {
      title: "Set Styles",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entries: [
          { nodeId: "123:456", fillProps: { color: [1, 0, 0, 1] } },
          { nodeId: "789:101", strokeProps: { color: [0, 0, 0, 1], weight: 2 } }
        ]}
      ]),
      edgeCaseWarnings: [
        "Each entry must have a valid nodeId.",
        "fillProps and strokeProps are both optional per entry.",
        "Color arrays must have four values between 0 and 1."
      ],
      extraInfo: "Batch version of set_style for updating multiple nodes efficiently."
    },
    async ({ entries }) => {
      for (const e of entries) {
        const id = ensureNodeIdIsString(e.nodeId);
        if (e.fillProps?.color) {
          const [r, g, b, a] = e.fillProps.color;
          await figmaClient.setFillColor({ nodeId: id, r, g, b, a });
        }
        if (e.strokeProps?.color) {
          const [r, g, b, a] = e.strokeProps.color;
          await figmaClient.setStrokeColor({ nodeId: id, r, g, b, a, weight: e.strokeProps.weight });
        }
      }
      return { content: [{ type: "text", text: `Styled ${entries.length} nodes` }] };
    }
  );
}
