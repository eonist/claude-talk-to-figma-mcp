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
    "Set the fill color of a node in Figma",
    {
      nodeId: z.string(),
      r: z.number().min(0).max(1),
      g: z.number().min(0).max(1),
      b: z.number().min(0).max(1),
      a: z.number().min(0).max(1).optional(),
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
    "Batch create gradient variables in Figma",
    {
      gradients: z.array(
        z.object({
          name: z.string().describe("The name for the gradient style"),
          gradientType: z
            .enum(["LINEAR","RADIAL","ANGULAR","DIAMOND"])
            .describe("Type of gradient"),
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
          ).describe("Array of gradient stops"),
          mode: z.string().optional().describe("Blend mode, e.g., NORMAL, DARKEN"),
          opacity: z.number().min(0).max(1).optional().describe("Overall opacity"),
          transformMatrix: z
            .array(z.array(z.number()))
            .optional()
            .describe("Optional 2x3 transform matrix for gradient")
        })
      ).describe("Array of gradient definitions")
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
    "Batch apply gradient styles to nodes in Figma",
    {
      entries: z.array(
        z.object({
          nodeId: z.string().describe("The ID of the node to style"),
          gradientStyleId: z.string().describe("The ID of the gradient style to apply"),
          applyTo: z
            .enum(["FILL","STROKE","BOTH"])
            .describe("Apply to fill, stroke, or both")
        })
      ).describe("Array of entries specifying nodeId, gradientStyleId, and applyTo")
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
    "Set the stroke color of a node in Figma",
    {
      nodeId: z.string(),
      r: z.number().min(0).max(1),
      g: z.number().min(0).max(1),
      b: z.number().min(0).max(1),
      a: z.number().min(0).max(1).optional(),
      weight: z.number().positive().optional(),
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
    "Set both fill and stroke properties for a Figma node",
    {
      nodeId: z.string(),
      fillProps: z.object({
        color: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
        visible: z.boolean().optional(),
        opacity: z.number().min(0).max(1).optional(),
      }).optional(),
      strokeProps: z.object({
        color: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
        weight: z.number().positive().optional(),
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
    "Apply fill and/or stroke styles to multiple nodes",
    {
      entries: z.array(
        z.object({
          nodeId: z.string(),
          fillProps: z
            .object({
              color: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
            })
            .optional(),
          strokeProps: z
            .object({
              color: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
              weight: z.number().positive().optional(),
            })
            .optional(),
        })
      ),
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
    "Create a gradient paint style in Figma",
    {
      name: z.string(),
      gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"]),
      stops: z.array(
        z.object({
          position: z.number().min(0).max(1),
          color: z.tuple([z.number(), z.number(), z.number(), z.number()]),
        })
      ),
    },
    async ({ name, gradientType, stops }) => {
      const result = await figmaClient.executeCommand("create_gradient_variable", { name, gradientType, stops });
      return { content: [{ type: "text", text: `Created gradient ${result.id}` }] };
    }
  );

  // Apply Gradient Style
  server.tool(
    "apply_gradient_style",
    "Apply a gradient style to a node in Figma",
    {
      nodeId: z.string(),
      gradientStyleId: z.string(),
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
    "Apply a gradient directly to a node without using styles",
    {
      nodeId: z.string().describe("The ID of the node to apply gradient to"),
      gradientType: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"]).describe("Type of gradient"),
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
      ).describe("Array of gradient stops"),
      applyTo: z.enum(["FILL", "STROKE", "BOTH"]).default("FILL").describe("Apply to fill, stroke, or both")
    },
    async ({ nodeId, gradientType, stops, applyTo }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("apply_direct_gradient", { nodeId: id, gradientType, stops, applyTo });
      return { content: [{ type: "text", text: `Applied direct gradient to ${id}` }] };
    }
  );

  // Apply Grayscale Gradient (Convenience function)
  server.tool(
    "apply_grayscale_gradient",
    "Apply a predefined grayscale gradient to a node",
    {
      nodeId: z.string().describe("The ID of the node to apply gradient to"),
      applyTo: z.enum(["FILL", "STROKE", "BOTH"]).default("FILL").describe("Apply to fill, stroke, or both")
    },
    async ({ nodeId, applyTo }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("apply_grayscale_gradient", { nodeId: id, applyTo });
      return { content: [{ type: "text", text: `Applied grayscale gradient to ${id}` }] };
    }
  );
}
