import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";

/**
 * Registers styling-related modify commands:
 * - set_fill_color
 * - set_stroke_color
 * - set_style
 * - set_styles
 * - create_gradient_variable
 * - apply_gradient_style
 */
export function registerStylingCommands(server: McpServer, figmaClient: FigmaClient) {
  // Set Fill Color Tool
  server.tool(
    "set_fill_color",
    `Set the fill color of a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node to update.
  - r (number, required): Red channel (0-1).
  - g (number, required): Green channel (0-1).
  - b (number, required): Blue channel (0-1).
  - a (number, optional): Alpha channel (0-1).

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Set fill 123:456" }] }

Annotations:
  - title: "Set Fill Color"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "r": 0.5,
      "g": 0.5,
      "b": 0.5,
      "a": 1
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Set fill 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      // Enforce color channels in [0,1]
      r: z.number().min(0).max(1).describe("Red channel (0-1)"),
      g: z.number().min(0).max(1).describe("Green channel (0-1)"),
      b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Optional. Alpha channel (0-1)"),
    },
    async ({ nodeId, r, g, b, a }: { nodeId: string; r: number; g: number; b: number; a?: number }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.setFillColor({ nodeId: id, r, g, b, a });
      return { content: [{ type: "text", text: `Set fill ${id}` }] };
    }
  );

  // Batch create gradient variables
  server.tool(
    "create_gradient_variables",
    `Batch create gradient variables in Figma.

Parameters:
  - gradients (array, required): Array of gradient definition objects.

Returns:
  - content: Array containing a text message with the number of gradient variables created.
    Example: { "content": [{ "type": "text", "text": "Batch created 3 gradient variables" }] }

Annotations:
  - title: "Create Gradient Variables (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "gradients": [
        {
          "name": "Primary Gradient",
          "gradientType": "LINEAR",
          "stops": [
            { "position": 0, "color": [1, 0, 0, 1] },
            { "position": 1, "color": [0, 0, 1, 1] }
          ]
        }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Batch created 1 gradient variables" }]
    }
`,
    {
      gradients: z.array(
        z.object({
          // Enforce non-empty string for name, reasonable length
          name: z.string()
            .min(1)
            .max(100)
            .describe("The name for the gradient style. Must be a non-empty string up to 100 characters."),
          // Restrict gradientType to allowed values
          gradientType: z
            .enum(["LINEAR","RADIAL","ANGULAR","DIAMOND"])
            .describe("Type of gradient"),
          // Enforce array of stops, each with position in [0,1] and RGBA color
          stops: z.array(
            z.object({
              position: z.number().min(0).max(1).describe("Position of color stop (0-1)"),
              color: z
                .tuple([
                  z.number().min(0).max(1),
                  z.number().min(0).max(1),
                  z.number().min(0).max(1),
                  z.number().min(0).max(1)
                ])
                .describe("RGBA color for the stop")
            })
          )
          .min(2)
          .max(10)
          .describe("Array of gradient stops. Must contain 2 to 10 stops."),
          mode: z.string().optional().describe("Blend mode, e.g., NORMAL, DARKEN"),
          opacity: z.number().min(0).max(1).optional().describe("Overall opacity"),
          transformMatrix: z
            .array(z.array(z.number()))
            .optional()
            .describe("Optional 2x3 transform matrix for gradient")
        })
      )
      .min(1)
      .max(20)
      .describe("Array of gradient definitions. Must contain 1 to 20 items."),
    },
    async ({ gradients }: { gradients: Array<{
      name: string;
      gradientType: "LINEAR"|"RADIAL"|"ANGULAR"|"DIAMOND";
      stops: Array<{ position: number; color: [number, number, number, number] }>;
      mode?: string;
      opacity?: number;
      transformMatrix?: number[][];
    }> }) => {
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

  // Batch apply gradient styles
  server.tool(
    "apply_gradient_styles",
    `Batch apply gradient styles to nodes in Figma.

Parameters:
  - entries (array, required): Array of objects specifying nodeId, gradientStyleId, and applyTo.

Returns:
  - content: Array containing a text message with the number of gradients applied.
    Example: { "content": [{ "type": "text", "text": "Batch applied gradients: 2/2 successes" }] }

Annotations:
  - title: "Apply Gradient Styles (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "entries": [
        { "nodeId": "123:456", "gradientStyleId": "grad:1", "applyTo": "FILL" },
        { "nodeId": "789:101", "gradientStyleId": "grad:2", "applyTo": "STROKE" }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Batch applied gradients: 2/2 successes" }]
    }
`,
    {
      entries: z.array(
        z.object({
          // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
          nodeId: z.string()
            .regex(/^\d+:\d+$/)
            .describe("The unique Figma node ID to style. Must be a string in the format '123:456'."),
          // Enforce non-empty string for gradientStyleId, reasonable length
          gradientStyleId: z.string()
            .min(1)
            .max(100)
            .describe("The ID of the gradient style to apply. Must be a non-empty string up to 100 characters."),
          // Restrict applyTo to allowed values
          applyTo: z
            .enum(["FILL","STROKE","BOTH"])
            .describe("Apply to fill, stroke, or both")
        })
      )
      .min(1)
      .max(100)
      .describe("Array of entries specifying nodeId, gradientStyleId, and applyTo. Must contain 1 to 100 items."),
    },
    async ({ entries }: { entries: Array<{
      nodeId: string;
      gradientStyleId: string;
      applyTo: "FILL"|"STROKE"|"BOTH";
    }> }) => {
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

  // Set Stroke Color Tool
  server.tool(
    "set_stroke_color",
    `Set the stroke color of a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node to update.
  - r (number, required): Red channel (0-1).
  - g (number, required): Green channel (0-1).
  - b (number, required): Blue channel (0-1).
  - a (number, optional): Alpha channel (0-1).
  - weight (number, optional): Stroke weight.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Set stroke 123:456" }] }

Annotations:
  - title: "Set Stroke Color"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "r": 0.1,
      "g": 0.2,
      "b": 0.3,
      "a": 1,
      "weight": 2
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Set stroke 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      // Enforce color channels in [0,1]
      r: z.number().min(0).max(1).describe("Red channel (0-1)"),
      g: z.number().min(0).max(1).describe("Green channel (0-1)"),
      b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Optional. Alpha channel (0-1)"),
      // Enforce positive stroke weight, reasonable upper bound
      weight: z.number().min(0.1).max(100).optional().describe("Optional. Stroke weight. Must be between 0.1 and 100."),
    },
    async ({ nodeId, r, g, b, a, weight }: { nodeId: string; r: number; g: number; b: number; a?: number; weight?: number }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.setStrokeColor({ nodeId: id, r, g, b, a, weight });
      return { content: [{ type: "text", text: `Set stroke ${id}` }] };
    }
  );

  // Set Style Tool
  server.tool(
    "set_style",
    `Set both fill and stroke properties for a Figma node.

Parameters:
  - nodeId (string, required): The ID of the node to update.
  - fillProps (object, optional): Fill properties.
  - strokeProps (object, optional): Stroke properties.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Styled 123:456" }] }

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
      "fillProps": { "color": [1, 0, 0, 1] },
      "strokeProps": { "color": [0, 0, 1, 1], "weight": 2 }
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Styled 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      fillProps: z.object({
        color: z.tuple([
          z.number().min(0).max(1),
          z.number().min(0).max(1),
          z.number().min(0).max(1),
          z.number().min(0).max(1)
        ]).optional(),
        visible: z.boolean().optional(),
        opacity: z.number().min(0).max(1).optional(),
      }).optional(),
      strokeProps: z.object({
        color: z.tuple([
          z.number().min(0).max(1),
          z.number().min(0).max(1),
          z.number().min(0).max(1),
          z.number().min(0).max(1)
        ]).optional(),
        weight: z.number().min(0.1).max(100).optional(),
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
    `Apply fill and/or stroke styles to multiple nodes.

Parameters:
  - entries (array, required): Array of objects specifying nodeId, fillProps, and strokeProps.

Returns:
  - content: Array containing a text message with the number of nodes styled.
    Example: { "content": [{ "type": "text", "text": "Styled 3 nodes" }] }

Annotations:
  - title: "Set Styles (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "entries": [
        { "nodeId": "123:456", "fillProps": { "color": [1, 0, 0, 1] } },
        { "nodeId": "789:101", "strokeProps": { "color": [0, 0, 1, 1], "weight": 2 } }
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
          // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
          nodeId: z.string()
            .regex(/^\d+:\d+$/)
            .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
          fillProps: z
            .object({
              color: z.tuple([
                z.number().min(0).max(1),
                z.number().min(0).max(1),
                z.number().min(0).max(1),
                z.number().min(0).max(1)
              ]).optional(),
            })
            .optional(),
          strokeProps: z
            .object({
              color: z.tuple([
                z.number().min(0).max(1),
                z.number().min(0).max(1),
                z.number().min(0).max(1),
                z.number().min(0).max(1)
              ]).optional(),
              weight: z.number().min(0.1).max(100).optional(),
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

  // Create Gradient Variable
  server.tool(
    "create_gradient_variable",
    `Create a gradient paint style in Figma.

Parameters:
  - name (string, required): Name for the gradient style.
  - gradientType (string, required): Type of gradient ("LINEAR", "RADIAL", "ANGULAR", "DIAMOND").
  - stops (array, required): Array of color stops.

Returns:
  - content: Array containing a text message with the created gradient's ID.
    Example: { "content": [{ "type": "text", "text": "Created gradient 123:456" }] }

Annotations:
  - title: "Create Gradient Variable"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "name": "Primary Gradient",
      "gradientType": "LINEAR",
      "stops": [
        { "position": 0, "color": [1, 0, 0, 1] },
        { "position": 1, "color": [0, 0, 1, 1] }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created gradient 123:456" }]
    }
`,
    {
      // Enforce non-empty string for name, reasonable length
      name: z.string()
        .min(1)
        .max(100)
        .describe("Name for the gradient style. Must be a non-empty string up to 100 characters."),
      // Restrict gradientType to allowed values
      gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"]),
      // Enforce array of stops, each with position in [0,1] and RGBA color
      stops: z.array(
        z.object({
          position: z.number().min(0).max(1),
          color: z.tuple([
            z.number().min(0).max(1),
            z.number().min(0).max(1),
            z.number().min(0).max(1),
            z.number().min(0).max(1)
          ]),
        })
      )
      .min(2)
      .max(10)
      .describe("Array of color stops. Must contain 2 to 10 stops."),
    },
    async ({ name, gradientType, stops }) => {
      const result = await figmaClient.executeCommand("create_gradient_variable", { name, gradientType, stops });
      return { content: [{ type: "text", text: `Created gradient ${result.id}` }] };
    }
  );

  // Apply Gradient Style
  server.tool(
    "apply_gradient_style",
    `Apply a gradient style to a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node to update.
  - gradientStyleId (string, required): The ID of the gradient style to apply.
  - applyTo (string, required): Where to apply the gradient ("FILL", "STROKE", "BOTH").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Applied gradient to 123:456" }] }

Annotations:
  - title: "Apply Gradient Style"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "gradientStyleId": "grad:1",
      "applyTo": "FILL"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Applied gradient to 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456'."),
      // Enforce non-empty string for gradientStyleId, reasonable length
      gradientStyleId: z.string()
        .min(1)
        .max(100)
        .describe("The ID of the gradient style to apply. Must be a non-empty string up to 100 characters."),
      // Restrict applyTo to allowed values
      applyTo: z.enum(["FILL", "STROKE", "BOTH"]),
    },
    async ({ nodeId, gradientStyleId, applyTo }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("apply_gradient_style", { nodeId: id, gradientStyleId, applyTo });
      return { content: [{ type: "text", text: `Applied gradient to ${id}` }] };
    }
  );

  // Apply Direct Gradient (Style-free alternative)
  server.tool(
    "apply_direct_gradient",
    `Apply a gradient directly to a node without using styles.

Parameters:
  - nodeId (string, required): The ID of the node to apply gradient to.
  - gradientType (string, required): Type of gradient ("LINEAR", "RADIAL", "ANGULAR", "DIAMOND").
  - stops (array, required): Array of color stops.
  - applyTo (string, optional): Where to apply the gradient ("FILL", "STROKE", "BOTH").

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Applied direct gradient to 123:456" }] }

Annotations:
  - title: "Apply Direct Gradient"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "gradientType": "LINEAR",
      "stops": [
        { "position": 0, "color": [1, 0, 0, 1] },
        { "position": 1, "color": [0, 0, 1, 1] }
      ],
      "applyTo": "FILL"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Applied direct gradient to 123:456" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .regex(/^\d+:\d+$/)
        .describe("The unique Figma node ID to apply gradient to. Must be a string in the format '123:456'."),
      // Restrict gradientType to allowed values
      gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"]).describe("Type of gradient"),
      // Enforce array of stops, each with position in [0,1] and RGBA color
      stops: z.array(
        z.object({
          position: z.number().min(0).max(1).describe("Position of color stop (0-1)"),
          color: z.tuple([
            z.number().min(0).max(1),
            z.number().min(0).max(1),
            z.number().min(0).max(1),
            z.number().min(0).max(1)
          ]).describe("RGBA color for the stop")
        })
      )
      .min(2)
      .max(10)
      .describe("Array of gradient stops. Must contain 2 to 10 stops."),
      // Restrict applyTo to allowed values
      applyTo: z.enum(["FILL", "STROKE", "BOTH"]).default("FILL").describe("Apply to fill, stroke, or both"),
    },
    async ({ nodeId, gradientType, stops, applyTo }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("apply_direct_gradient", { nodeId: id, gradientType, stops, applyTo });
      return { content: [{ type: "text", text: `Applied direct gradient to ${id}` }] };
    }
  );

}
