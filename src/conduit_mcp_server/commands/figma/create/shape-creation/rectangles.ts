import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { RectangleSchema } from "./rectangle-schema.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { CreateRectangleParams } from "../../../../types/command-params.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";

/**
 * Registers shape-creation-related commands with the MCP server.
 * 
 * @param {McpServer} server - The MCP server instance to register tools on.
 * @param {FigmaClient} figmaClient - The Figma client for executing commands.
 * 
 * Adds:
 * - create_rectangle, create_rectangles: Create one or more rectangles in Figma.
 */
export function registerRectanglesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_rectangle
   * 
   * Creates a new rectangle shape node in the specified Figma document at the given coordinates, with the specified width and height.
   * Optionally, you can provide a name, a parent node ID to attach the rectangle to, and a corner radius for rounded corners.
   * This tool is useful for programmatically generating UI elements, backgrounds, or design primitives in Figma via MCP.
   * 
   * @param {number} x - The X coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0.
   * @param {number} y - The Y coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0.
   * @param {number} width - The width of the rectangle in pixels. Must be > 0.
   * @param {number} height - The height of the rectangle in pixels. Must be > 0.
   * @param {string} [name] - Optional. The name to assign to the rectangle node in Figma.
   * @param {string} [parentId] - Optional. The Figma node ID of the parent to attach the rectangle to. If omitted, the rectangle is added to the root.
   * @param {number} [cornerRadius] - Optional. The corner radius (in pixels) for rounded corners. Must be >= 0.
   * 
   * @returns {Promise<object>} Returns a promise resolving to an object containing a text message with the created rectangle's node ID.
   * 
   * @example
   * {
   *   x: 100,
   *   y: 200,
   *   width: 300,
   *   height: 150,
   *   name: "Button Background",
   *   cornerRadius: 8
   * }
   */
  server.tool(
    "create_rectangle",
    `Creates one or more rectangle shape nodes in the specified Figma document. Accepts either a single rectangle config or an array of configs. Optionally, you can provide a name, a parent node ID to attach the rectangle(s) to, and a corner radius for rounded corners.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created rectangle node ID(s).
`,
    {
      rectangles: RectangleSchema
        .describe("A rectangle configuration object or an array of rectangle configuration objects. Each object should include coordinates, dimensions, and optional properties for a rectangle."),
    },
    {
      title: "Create Rectangle(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          rectangles: [
            {
              x: 100,
              y: 200,
              width: 300,
              height: 150,
              name: "Button Background",
              cornerRadius: 8
            }
          ]
        },
        {
          rectangles: [
            { x: 10, y: 20, width: 100, height: 50, name: "Rect1" },
            { x: 120, y: 20, width: 80, height: 40 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "Width and height must be greater than zero.",
        "Corner radius should not exceed half the smallest dimension.",
        "If parentId is invalid, the rectangle will be added to the root."
      ],
      extraInfo: "Useful for generating UI elements, backgrounds, or design primitives programmatically. Batch creation is efficient for generating multiple design elements at once."
    },
    // Tool handler: supports both single object and array input.
    async ({ rectangles }, extra): Promise<any> => {
      try {
        const rects = Array.isArray(rectangles) ? rectangles : [rectangles];
        const results = await processBatch(
          rects,
          async cfg => {
            const params: CreateRectangleParams = { commandId: uuidv4(), ...cfg };
            const node = await figmaClient.createRectangle(params);
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
        const nodeIds = results.map(r => r.result).filter(Boolean);
        if (nodeIds.length === 1) {
          return { content: [{ type: "text", text: `Created rectangle ${nodeIds[0]}` }] };
        } else {
          return { content: [{ type: "text", text: `Created rectangles: ${nodeIds.join(", ")}` }] };
        }
      } catch (err) {
        // Handle errors and return a formatted error response.
        return handleToolError(err, "shape-creation-tools", "create_rectangle") as any;
      }
    }
  );
}
