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
    async ({ nodeId, r, g, b, a }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.setFillColor({ nodeId: id, r, g, b, a });
      return { content: [{ type: "text", text: `Set fill ${id}` }] };
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
    async ({ nodeId, r, g, b, a, weight }) => {
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
}
