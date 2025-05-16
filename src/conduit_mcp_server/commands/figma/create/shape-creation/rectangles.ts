import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { RectangleSchema, SingleRectangleSchema, BatchRectanglesSchema } from "./rectangle-schema.js";
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
 * - create_rectangle: Create one or more rectangles in Figma.
 */
export function registerRectanglesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_rectangle
   *
   * Creates one or more rectangle shape nodes in the specified Figma document.
   * Accepts either a single rectangle config (via the 'rectangle' property) or an array of configs (via the 'rectangles' property).
   * Optionally, you can provide a name, a parent node ID to attach the rectangle(s) to, and a corner radius for rounded corners.
   *
   * This tool is useful for programmatically generating UI elements, backgrounds, or design primitives in Figma via MCP.
   *
   * @param {object} args - The input object. Must provide either:
   *   - rectangle: A single rectangle config object (x, y, width, height, name?, parentId?, cornerRadius?)
   *   - rectangles: An array of rectangle config objects (same shape as above)
   *
   * @returns {Promise<object>} Returns a promise resolving to an object containing a text message with the created rectangle node ID(s).
   *
   * @example
   * // Single rectangle
   * {
   *   rectangle: {
   *     x: 100,
   *     y: 200,
   *     width: 300,
   *     height: 150,
   *     name: "Button Background",
   *     cornerRadius: 8
   *   }
   * }
   *
   * // Multiple rectangles
   * {
   *   rectangles: [
   *     { x: 10, y: 20, width: 100, height: 50, name: "Rect1" },
   *     { x: 120, y: 20, width: 80, height: 40 }
   *   ]
   * }
   */
  server.tool(
    "create_rectangle",
    `Creates one or more rectangle shape nodes in the specified Figma document. Accepts either a single rectangle config (via 'rectangle') or an array of configs (via 'rectangles'). Optionally, you can provide a name, a parent node ID to attach the rectangle(s) to, and a corner radius for rounded corners.

Input:
  - rectangle: A single rectangle configuration object.
  - rectangles: An array of rectangle configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created rectangle node ID(s).
`,
    {
      rectangle: SingleRectangleSchema
        .describe("A single rectangle configuration object. Each object should include coordinates, dimensions, and optional properties for a rectangle.")
        .optional(),
      rectangles: BatchRectanglesSchema
        .describe("An array of rectangle configuration objects. Each object should include coordinates, dimensions, and optional properties for a rectangle.")
        .optional(),
    },
    {
      title: "Create Rectangle(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          rectangle: {
            x: 100,
            y: 200,
            width: 300,
            height: 150,
            name: "Button Background",
            cornerRadius: 8
          }
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
    // Tool handler: supports both single object and array input via 'rectangle' or 'rectangles'.
    async (args, extra): Promise<any> => {
      try {
        let rects;
        if (args.rectangles) {
          rects = args.rectangles;
        } else if (args.rectangle) {
          rects = [args.rectangle];
        } else {
          throw new Error("You must provide either 'rectangle' or 'rectangles' as input.");
        }
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
