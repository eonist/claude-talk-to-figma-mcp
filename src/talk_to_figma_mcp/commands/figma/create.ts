import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../clients/figma-client.js";

/**
 * Registers creation commands for the MCP server:
 * - create_rectangle
 * - create_rectangles (batch)
 * - create_line
 * - create_lines (batch)
 */
export function registerCreateCommands(server: McpServer, figmaClient: FigmaClient) {

  // Single rectangle
  server.tool(
    "create_rectangle",
    "Create a new rectangle in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width"),
      height: z.number().describe("Height"),
      name: z.string().optional().describe("Name"),
      parentId: z.string().optional().describe("Parent ID"),
      cornerRadius: z.number().min(0).optional().describe("Corner radius")
    },
    async ({ x, y, width, height, name, parentId, cornerRadius }) => {
      const params: any = { x, y, width, height, name, parentId };
      try {
        const node = await figmaClient.createRectangle(params);
        if (cornerRadius !== undefined) {
          await figmaClient.executeCommand("set_corner_radius", {
            nodeId: node.id,
            radius: cornerRadius
          });
        }
        return { content: [{ type: "text", text: `Created rectangle ID: ${node.id}` }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${String(err)}` }] };
      }
    }
  );

  // Batch rectangles
  server.tool(
    "create_rectangles",
    "Create multiple rectangles in Figma",
    {
      rectangles: z
        .array(
          z.object({
            x: z.number(),
            y: z.number(),
            width: z.number(),
            height: z.number(),
            name: z.string().optional(),
            parentId: z.string().optional(),
            cornerRadius: z.number().min(0).optional()
          })
        )
        .describe("Array of rectangle configurations")
    },
    async ({ rectangles }) => {
      const ids: string[] = [];
      for (const cfg of rectangles) {
        try {
          const node = await figmaClient.createRectangle(cfg);
          if (cfg.cornerRadius !== undefined) {
            await figmaClient.executeCommand("set_corner_radius", {
              nodeId: node.id,
              radius: cfg.cornerRadius
            });
          }
          ids.push(node.id);
        } catch {
          // continue on error
        }
      }
      return {
        content: [
          { type: "text", text: `Created rectangle IDs: ${ids.join(", ")}` }
        ]
      };
    }
  );

  // Single line
  server.tool(
    "create_line",
    "Create a new line in Figma",
    {
      x1: z.number().describe("Start X position"),
      y1: z.number().describe("Start Y position"),
      x2: z.number().describe("End X position"),
      y2: z.number().describe("End Y position"),
      parentId: z.string().optional().describe("Parent ID"),
      strokeColor: z.any().optional().describe("Stroke color"),
      strokeWeight: z.number().optional().describe("Stroke weight")
    },
    async ({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight }) => {
      try {
        const node = await figmaClient.createLine({ x1, y1, x2, y2, parentId, strokeColor, strokeWeight });
        return { content: [{ type: "text", text: `Created line ID: ${node.id}` }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Error: ${String(err)}` }] };
      }
    }
  );

  // Batch lines
  server.tool(
    "create_lines",
    "Create multiple lines in Figma",
    {
      lines: z
        .array(
          z.object({
            x1: z.number(),
            y1: z.number(),
            x2: z.number(),
            y2: z.number(),
            parentId: z.string().optional(),
            strokeColor: z.any().optional(),
            strokeWeight: z.number().optional()
          })
        )
        .describe("Array of line parameters")
    },
    async ({ lines }) => {
      if (!lines || lines.length === 0) {
        throw new Error("No lines provided");
      }
      const ids: string[] = [];
      for (const cfg of lines) {
        try {
          const node = await figmaClient.createLine(cfg);
          ids.push(node.id);
        } catch {
          // continue on error
        }
      }
      return {
        content: [
          { type: "text", text: `Created line IDs: ${ids.join(", ")}` }
        ]
      };
    }
  );

}
