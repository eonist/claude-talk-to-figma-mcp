import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { CreateRectangleParams } from "../../../../types/command-params.js";
import { v4 as uuidv4 } from "uuid";
import { handleToolError } from "../../../../utils/error-handling.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers shape-creation-related commands with the MCP server.
 * 
 * @param server - The MCP server instance to register tools on
 * @param figmaClient - The Figma client for executing commands
 * 
 * Adds:
 * - create_rectangle, create_rectangles: Create one or more rectangles in Figma
 */
export function registerRectanglesTools(server: McpServer, figmaClient: FigmaClient) {
  /**
   * MCP Tool: create_rectangle
   * 
   * Creates a new rectangle shape node in the specified Figma document at the given coordinates, with the specified width and height.
   * Optionally, you can provide a name, a parent node ID to attach the rectangle to, and a corner radius for rounded corners.
   * This tool is useful for programmatically generating UI elements, backgrounds, or design primitives in Figma via MCP.
   * 
   * Parameters:
   *   - x (number, required): The X coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 100
   *   - y (number, required): The Y coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 200
   *   - width (number, required): The width of the rectangle in pixels. Must be > 0. Example: 300
   *   - height (number, required): The height of the rectangle in pixels. Must be > 0. Example: 150
   *   - name (string, optional): The name to assign to the rectangle node in Figma. Example: "Button Background"
   *   - parentId (string, optional): The Figma node ID of the parent to attach the rectangle to. If omitted, the rectangle is added to the root.
   *   - cornerRadius (number, optional): The corner radius (in pixels) for rounded corners. Must be >= 0. Example: 8
   * 
   * Returns:
   *   - content: Array containing a text message with the created rectangle's node ID.
   *     Example: { "content": [{ "type": "text", "text": "Created rectangle 123:456" }] }
   * 
   * Usage Example:
   *   Input:
   *     {
   *       "x": 100,
   *       "y": 200,
   *       "width": 300,
   *       "height": 150,
   *       "name": "Button Background",
   *       "cornerRadius": 8
   *     }
   *   Output:
   *     {
   *       "content": [{ "type": "text", "text": "Created rectangle 123:456" }]
   *     }
   */
  server.tool(
    "create_rectangle",
    `Creates a new rectangle shape node in the specified Figma document at the given coordinates, with the specified width and height. Optionally, you can provide a name, a parent node ID to attach the rectangle to, and a corner radius for rounded corners.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created rectangle's node ID.

Annotations:
  - title: "Create Rectangle"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 150,
      "name": "Button Background",
      "cornerRadius": 8
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created rectangle 123:456" }]
    }
`,
    {
      x: z.number().min(0, "x must be >= 0")
        .describe("The X coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 100"),
      y: z.number().min(0, "y must be >= 0")
        .describe("The Y coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 200"),
      width: z.number().positive("width must be > 0")
        .describe("The width of the rectangle in pixels. Must be > 0. Example: 300"),
      height: z.number().positive("height must be > 0")
        .describe("The height of the rectangle in pixels. Must be > 0. Example: 150"),
      name: z.string().describe("The name to assign to the rectangle node in Figma. Example: 'Button Background'").optional(),
      parentId: z.string().describe("The Figma node ID of the parent to attach the rectangle to. If omitted, the rectangle is added to the root.").optional(),
      cornerRadius: z.number().min(0, "cornerRadius must be >= 0")
        .describe("The corner radius (in pixels) for rounded corners. Must be >= 0. Example: 8").optional()
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

  /**
   * MCP Tool: create_rectangles
   * 
   * Creates multiple rectangles in Figma based on the provided array of rectangle configuration objects.
   * Each object should specify the coordinates, dimensions, and optional properties for a rectangle.
   * This tool is useful for batch-generating UI elements or design primitives in Figma via MCP.
   * 
   * Parameters:
   *   - rectangles (array, required): An array of rectangle configuration objects. Each object should include:
   *       - x (number, required): X coordinate for the top-left corner.
   *       - y (number, required): Y coordinate for the top-left corner.
   *       - width (number, required): Width in pixels.
   *       - height (number, required): Height in pixels.
   *       - name (string, optional): Name for the rectangle node.
   *       - parentId (string, optional): Figma node ID of the parent.
   *       - cornerRadius (number, optional): Corner radius in pixels.
   * 
   * Returns:
   *   - content: Array containing a text message with the number of rectangles created.
   *     Example: { "content": [{ "type": "text", "text": "Created 3/3 rectangles." }] }
   * 
   * Usage Example:
   *   Input:
   *     {
   *       "rectangles": [
   *         { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Rect1" },
   *         { "x": 120, "y": 20, "width": 80, "height": 40 }
   *       ]
   *     }
   *   Output:
   *     {
   *       "content": [{ "type": "text", "text": "Created 2/2 rectangles." }]
   *     }
   */
  server.tool(
    "create_rectangles",
    `Creates multiple rectangles in Figma based on the provided array of rectangle configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of rectangles created.

Annotations:
  - title: "Create Rectangles"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "rectangles": [
        { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Rect1" },
        { "x": 120, "y": 20, "width": 80, "height": 40 }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created 2/2 rectangles." }]
    }
`,
    { rectangles: z.array(
        z.object({
          x: z.number().min(0, "x must be >= 0")
            .describe("The X coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 100"),
          y: z.number().min(0, "y must be >= 0")
            .describe("The Y coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 200"),
          width: z.number().positive("width must be > 0")
            .describe("The width of the rectangle in pixels. Must be > 0. Example: 300"),
          height: z.number().positive("height must be > 0")
            .describe("The height of the rectangle in pixels. Must be > 0. Example: 150"),
          name: z.string()
            .describe("The name to assign to the rectangle node in Figma. Example: 'Button Background'")
            .optional(),
          parentId: z.string()
            .describe("The Figma node ID of the parent to attach the rectangle to. If omitted, the rectangle is added to the root.")
            .optional(),
          cornerRadius: z.number().min(0, "cornerRadius must be >= 0")
            .describe("The corner radius (in pixels) for rounded corners. Must be >= 0. Example: 8")
            .optional()
        })
      ).describe("An array of rectangle configuration objects. Each object should include coordinates, dimensions, and optional properties for a rectangle.")
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
}
