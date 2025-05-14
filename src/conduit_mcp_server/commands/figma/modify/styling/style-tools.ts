import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

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

Annotations:
  - title: "Set Style"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "fillProps": { "color": [0.5, 0.5, 0.5, 1], "visible": true, "opacity": 1 },
      "strokeProps": { "color": [0, 0, 0, 1], "weight": 2 }
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Styled 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      fillProps: z.object({
        color: z.tuple([
          z.number().min(0).max(1).describe("Red channel (0-1)"),
          z.number().min(0).max(1).describe("Green channel (0-1)"),
          z.number().min(0).max(1).describe("Blue channel (0-1)"),
          z.number().min(0).max(1).describe("Alpha channel (0-1)")
        ])
        .describe("RGBA color array for the fill. Each value must be between 0 and 1.")
        .optional(),
        visible: z.boolean()
          .describe("Whether the fill is visible.")
          .optional(),
        opacity: z.number().min(0).max(1)
          .describe("Opacity of the fill (0-1).")
          .optional(),
      }).optional(),
      strokeProps: z.object({
        color: z.tuple([
          z.number().min(0).max(1).describe("Red channel (0-1)"),
          z.number().min(0).max(1).describe("Green channel (0-1)"),
          z.number().min(0).max(1).describe("Blue channel (0-1)"),
          z.number().min(0).max(1).describe("Alpha channel (0-1)")
        ])
        .describe("RGBA color array for the stroke. Each value must be between 0 and 1.")
        .optional(),
        weight: z.number().min(0.1).max(100)
          .describe("Stroke weight. Must be between 0.1 and 100.")
          .optional(),
      }).optional(),
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

Annotations:
  - title: "Set Styles"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "entries": [
        {
          "nodeId": "123:456",
          "fillProps": { "color": [0.5, 0.5, 0.5, 1] },
          "strokeProps": { "color": [0, 0, 0, 1], "weight": 2 }
        },
        {
          "nodeId": "789:101",
          "fillProps": { "color": [1, 0, 0, 1] }
        }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Styled 2 nodes" }]
    }
`,
    {
      entries: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
          fillProps: z
            .object({
              color: z.tuple([
                z.number().min(0).max(1).describe("Red channel (0-1)"),
                z.number().min(0).max(1).describe("Green channel (0-1)"),
                z.number().min(0).max(1).describe("Blue channel (0-1)"),
                z.number().min(0).max(1).describe("Alpha channel (0-1)")
              ])
              .describe("RGBA color array for the fill. Each value must be between 0 and 1.")
              .optional(),
            })
            .optional(),
          strokeProps: z
            .object({
              color: z.tuple([
                z.number().min(0).max(1).describe("Red channel (0-1)"),
                z.number().min(0).max(1).describe("Green channel (0-1)"),
                z.number().min(0).max(1).describe("Blue channel (0-1)"),
                z.number().min(0).max(1).describe("Alpha channel (0-1)")
              ])
              .describe("RGBA color array for the stroke. Each value must be between 0 and 1.")
              .optional(),
              weight: z.number().min(0.1).max(100)
                .describe("Stroke weight. Must be between 0.1 and 100.")
                .optional(),
            })
            .optional(),
        })
      )
      .min(1)
      .max(100)
      .describe("Array of style entries. Must contain 1 to 100 items."),
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
