import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { CreateRectangleParams } from "../../../types/command-params.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../utils/error-handling.js";

/**
 * Registers shape-creation-related commands:
 * - create_rectangle, create_rectangles
 * - create_frame
 * - create_line, create_lines
 * - create_ellipse, create_ellipses
 * - create_polygons
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
    async (args, extra): Promise<any> => {
      try {
        const params: CreateRectangleParams = { commandId: uuidv4(), ...args };
      const node = await figmaClient.createRectangle(params);
      if (args.cornerRadius != null) {
        await figmaClient.executeCommand("set_corner_radius", {
          commandId: uuidv4(),
          nodeId: node.id,
          radius: args.cornerRadius
        });
      }
        return { content: [{ type: "text", text: `Created rectangle ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "shape-creation-tools", "create_rectangle") as any;
      }
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
      const results = await processBatch(
        rectangles,
        async cfg => {
          const node = await figmaClient.createRectangle(cfg);
          if (cfg.cornerRadius != null) {
            await figmaClient.executeCommand("set_corner_radius", { nodeId: node.id, radius: cfg.cornerRadius });
          }
          return node.id;
        }
      );
      const successCount = results.filter(r => r.result).length;
      return {
        content: [{ type: "text", text: `Created ${successCount}/${rectangles.length} rectangles.` }],
        _meta: { results }
      };
    }
  );

  // Create Frame (supports auto layout)
  server.tool(
    "create_frame",
    "Create a new frame in Figma",
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      name: z.string().optional(), parentId: z.string().optional(),
      fillColor: z.any().optional(), strokeColor: z.any().optional(),
      strokeWeight: z.number().optional()
    },
    async (args) => {
      try {
        const params = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createFrame(params);
        return { content: [{ type: "text", text: `Created frame ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "shape-creation-tools", "create_frame") as any;
      }
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
      const results = await processBatch(
        lines,
        cfg => figmaClient.createLine(cfg).then(node => node.id)
      );
      const successCount = results.filter(r => r.result).length;
      return {
        content: [{ type: "text", text: `Created ${successCount}/${lines.length} lines.` }],
        _meta: { results }
      };
    }
  );

  // Single ellipse
  server.tool(
    "create_ellipse",
    "Create a new ellipse in Figma",
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      name: z.string().optional(), parentId: z.string().optional(),
      fillColor: z.any().optional(), strokeColor: z.any().optional(),
      strokeWeight: z.number().optional()
    },
    async (args) => {
      try {
        const params = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createEllipse(params);
        return { content: [{ type: "text", text: `Created ellipse ${node.id}` }] };
      } catch (err) {
        return handleToolError(err, "shape-creation-tools", "create_ellipse") as any;
      }
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
      const results = await processBatch(
        polygons,
        cfg => figmaClient.createPolygon(cfg).then(node => node.id)
      );
      const successCount = results.filter(r => r.result).length;
      return {
        content: [{ type: "text", text: `Created ${successCount}/${polygons.length} polygons.` }],
        _meta: { results }
      };
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
      const results = await processBatch(
        ellipses,
        cfg => figmaClient.createEllipse(cfg).then(node => node.id)
      );
      const successCount = results.filter(r => r.result).length;
      return {
        content: [{ type: "text", text: `Created ${successCount}/${ellipses.length} ellipses.` }],
        _meta: { results }
      };
    }
  );
}
