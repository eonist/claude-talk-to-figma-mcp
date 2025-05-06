import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";

/**
 * Registers shape-creation-related commands:
 * - create_rectangle, create_rectangles
 * - create_line, create_lines
 * - create_polygons
 * - create_ellipses
 */
export function registerShapeCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Single rectangle
  server.tool(
    "create_rectangle",
    "Create a new rectangle in Figma",
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      name: z.string().optional(), parentId: z.string().optional(),
      cornerRadius: z.number().min(0).optional()
    },
    async ({ x, y, width, height, name, parentId, cornerRadius }) => {
      const params: any = { x, y, width, height, name, parentId };
      const node = await figmaClient.createRectangle(params);
      if (cornerRadius != null) {
        await figmaClient.executeCommand("set_corner_radius", {
          nodeId: node.id, radius: cornerRadius
        });
      }
      return { content: [{ type: "text", text: `Created rectangle ${node.id}` }] };
    }
  );

  // Batch rectangles
  server.tool(
    "create_rectangles",
    "Create multiple rectangles in Figma",
    { rectangles: z.array(z.object({
        x: z.number(), y: z.number(),
        width: z.number(), height: z.number(),
        name: z.string().optional(), parentId: z.string().optional(),
        cornerRadius: z.number().min(0).optional()
      }))
    },
    async ({ rectangles }) => {
      const ids: string[] = [];
      for (const cfg of rectangles) {
        try {
          const node = await figmaClient.createRectangle(cfg);
          if (cfg.cornerRadius != null) {
            await figmaClient.executeCommand("set_corner_radius", {
              nodeId: node.id, radius: cfg.cornerRadius
            });
          }
          ids.push(node.id);
        } catch {
          /* skip errors */
        }
      }
      return { content: [{ type: "text", text: `Created rectangles: ${ids.join(", ")}` }] };
    }
  );

  // Single line
  server.tool(
    "create_line",
    "Create a new line in Figma",
    {
      x1: z.number(), y1: z.number(),
      x2: z.number(), y2: z.number(),
      parentId: z.string().optional(),
      strokeColor: z.any().optional(),
      strokeWeight: z.number().optional()
    },
    async ({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight }) => {
      const node = await figmaClient.createLine({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight });
      return { content: [{ type: "text", text: `Created line ${node.id}` }] };
    }
  );

  // Batch lines
  server.tool(
    "create_lines",
    "Create multiple lines in Figma",
    { lines: z.array(z.object({
        x1: z.number(), y1: z.number(),
        x2: z.number(), y2: z.number(),
        parentId: z.string().optional(),
        strokeColor: z.any().optional(),
        strokeWeight: z.number().optional()
      }))
    },
    async ({ lines }) => {
      const ids: string[] = [];
      for (const cfg of lines) {
        try {
          const node = await figmaClient.createLine(cfg);
          ids.push(node.id);
        } catch {
          /* skip errors */
        }
      }
      return { content: [{ type: "text", text: `Created lines: ${ids.join(", ")}` }] };
    }
  );

  // Batch polygons
  server.tool(
    "create_polygons",
    "Create multiple polygons in Figma",
    { polygons: z.array(z.object({
        x: z.number(), y: z.number(),
        width: z.number(), height: z.number(),
        sides: z.number().min(3),
        name: z.string().optional(), parentId: z.string().optional(),
        fillColor: z.any().optional(), strokeColor: z.any().optional(),
        strokeWeight: z.number().optional()
      }))
    },
    async ({ polygons }) => {
      const ids: string[] = [];
      for (const cfg of polygons) {
        try {
          const node = await figmaClient.createPolygon(cfg);
          ids.push(node.id);
        } catch {
          /* skip errors */
        }
      }
      return { content: [{ type: "text", text: `Created polygons: ${ids.join(", ")}` }] };
    }
  );

  // Batch ellipses
  server.tool(
    "create_ellipses",
    "Create multiple ellipses in Figma",
    { ellipses: z.array(z.object({
        x: z.number(), y: z.number(),
        width: z.number(), height: z.number(),
        name: z.string().optional(), parentId: z.string().optional(),
        fillColor: z.any().optional(), strokeColor: z.any().optional(),
        strokeWeight: z.number().optional()
      }))
    },
    async ({ ellipses }) => {
      const ids: string[] = [];
      for (const cfg of ellipses) {
        try {
          const node = await figmaClient.createEllipse(cfg);
          ids.push(node.id);
        } catch {
          /* skip errors */
        }
      }
      return { content: [{ type: "text", text: `Created ellipses: ${ids.join(", ")}` }] };
    }
  );
}
