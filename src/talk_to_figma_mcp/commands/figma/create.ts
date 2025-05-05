import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../clients/figma-client.js";

/**
 * Registers rectangle creation commands for the MCP server:
 * - create_rectangle
 * - create_rectangles (batch)
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

}
