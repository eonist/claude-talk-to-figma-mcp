/**
 * @fileoverview
 * Registers shape-creation-related commands for the MCP server.
 * 
 * Exports the function `registerShapeCreationCommands` which adds:
 * - create_rectangle, create_rectangles: Create one or more rectangles in Figma
 * - create_frame: Create a new frame in Figma
 * - create_line, create_lines: Create one or more lines in Figma
 * - create_ellipse, create_ellipses: Create one or more ellipses in Figma
 * - create_polygons: Create multiple polygons in Figma
 * 
 * These tools validate input parameters, call the Figma client, and handle errors.
 * 
 * @module commands/figma/create/shape-creation-tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { CreateRectangleParams } from "../../../types/command-params.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../utils/error-handling.js";

/**
 * Registers shape-creation-related commands with the MCP server.
 * 
 * @param server - The MCP server instance to register tools on
 * @param figmaClient - The Figma client for executing commands
 * 
 * Adds:
 * - create_rectangle, create_rectangles: Create one or more rectangles in Figma
 * - create_frame: Create a new frame in Figma
 * - create_line, create_lines: Create one or more lines in Figma
 * - create_ellipse, create_ellipses: Create one or more ellipses in Figma
 * - create_polygons: Create multiple polygons in Figma
 */
export function registerShapeCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Register the "create_rectangle" tool for creating a single rectangle in Figma.
  server.tool(
    "create_rectangle",
    "Create a new rectangle in Figma",
    {
      x: z.number(), y: z.number(),
      width: z.number(), height: z.number(),
      name: z.string().optional(), parentId: z.string().optional(),
      cornerRadius: z.number().min(0).optional()
    },
    // Tool handler: validates input, calls Figma client, and returns result or error.
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
        // Handle errors and return a formatted error response.
        return handleToolError(err, "shape-creation-tools", "create_rectangle") as any;
      }
    }
  );

  // Register the "create_rectangles" tool for creating multiple rectangles in Figma.
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
    // Tool handler: processes each rectangle, calls Figma client, and returns batch results.
    async ({ rectangles }) => {
      const results = await processBatch(
        rectangles,
        async cfg => {
          const node = await figmaClient.createRectangle(cfg);
          if (cfg.cornerRadius != null) {
            await figmaClient.executeCommand("set_corner_radius", { 
              commandId: uuidv4(),
              nodeId: node.id, 
              radius: cfg.cornerRadius 
            });
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

  // Register the "create_frame" tool for creating a new frame in Figma.
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
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async (args) => {
      try {
        const params = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createFrame(params);
        return { content: [{ type: "text", text: `Created frame ${node.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "shape-creation-tools", "create_frame") as any;
      }
    }
  );

  // Register the "create_line" tool for creating a single line in Figma.
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
    // Tool handler: validates input, calls Figma client, and returns result.
    async ({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight }) => {
      const node = await figmaClient.createLine({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight });
      return { content: [{ type: "text", text: `Created line ${node.id}` }] };
    }
  );

  // Register the "create_lines" tool for creating multiple lines in Figma.
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
    // Tool handler: processes each line, calls Figma client, and returns batch results.
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

  // Register the "create_ellipse" tool for creating a single ellipse in Figma.
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
    // Tool handler: validates input, calls Figma client, and returns result or error.
    async (args) => {
      try {
        const params = { commandId: uuidv4(), ...args };
        const node = await figmaClient.createEllipse(params);
        return { content: [{ type: "text", text: `Created ellipse ${node.id}` }] };
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "shape-creation-tools", "create_ellipse") as any;
      }
    }
  );

  // Register the "create_polygons" tool for creating multiple polygons in Figma.
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
    // Tool handler: processes each polygon, calls Figma client, and returns batch results.
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

  // Register the "create_ellipses" tool for creating multiple ellipses in Figma.
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
    // Tool handler: processes each ellipse, calls Figma client, and returns batch results.
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
