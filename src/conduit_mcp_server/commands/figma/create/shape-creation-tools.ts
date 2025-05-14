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
    `Creates a new rectangle shape node in the specified Figma document at the given coordinates, with the specified width and height.
Optionally, you can provide a name, a parent node ID to attach the rectangle to, and a corner radius for rounded corners.
This tool is useful for programmatically generating UI elements, backgrounds, or design primitives in Figma via MCP.

Parameters:
  - x (number, required): The X coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 100
  - y (number, required): The Y coordinate (in Figma canvas units, pixels) for the top-left corner of the rectangle. Must be >= 0. Example: 200
  - width (number, required): The width of the rectangle in pixels. Must be > 0. Example: 300
  - height (number, required): The height of the rectangle in pixels. Must be > 0. Example: 150
  - name (string, optional): The name to assign to the rectangle node in Figma. Example: "Button Background"
  - parentId (string, optional): The Figma node ID of the parent to attach the rectangle to. If omitted, the rectangle is added to the root.
  - cornerRadius (number, optional): The corner radius (in pixels) for rounded corners. Must be >= 0. Example: 8

Returns:
  - content: Array containing a text message with the created rectangle's node ID.
    Example: { "content": [{ "type": "text", "text": "Created rectangle 123:456" }] }

Annotations:
  - title: "Create Rectangle (Figma)"
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

  // Register the "create_rectangles" tool for creating multiple rectangles in Figma.
  server.tool(
    "create_rectangles",
    `Create multiple rectangles in Figma.

Parameters:
  - rectangles (array, required): An array of rectangle configuration objects. Each object should include:
      - x (number, required): X coordinate for the top-left corner.
      - y (number, required): Y coordinate for the top-left corner.
      - width (number, required): Width in pixels.
      - height (number, required): Height in pixels.
      - name (string, optional): Name for the rectangle node.
      - parentId (string, optional): Figma node ID of the parent.
      - cornerRadius (number, optional): Corner radius in pixels.

Returns:
  - content: Array containing a text message with the number of rectangles created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 rectangles." }] }

Annotations:
  - title: "Create Rectangles (Batch)"
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
    `Create a new frame in Figma.

Parameters:
  - x (number, required): X coordinate for the top-left corner.
  - y (number, required): Y coordinate for the top-left corner.
  - width (number, required): Width in pixels.
  - height (number, required): Height in pixels.
  - name (string, optional): Name for the frame node.
  - parentId (string, optional): Figma node ID of the parent.
  - fillColor (any, optional): Fill color for the frame.
  - strokeColor (any, optional): Stroke color for the frame.
  - strokeWeight (number, optional): Stroke weight for the frame.

Returns:
  - content: Array containing a text message with the created frame's node ID.
    Example: { "content": [{ "type": "text", "text": "Created frame 123:456" }] }

Annotations:
  - title: "Create Frame"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "x": 50,
      "y": 100,
      "width": 400,
      "height": 300,
      "name": "Main Frame"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created frame 123:456" }]
    }
`,
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
    `Create a new line in Figma.

Parameters:
  - x1 (number, required): X coordinate for the start point.
  - y1 (number, required): Y coordinate for the start point.
  - x2 (number, required): X coordinate for the end point.
  - y2 (number, required): Y coordinate for the end point.
  - parentId (string, optional): Figma node ID of the parent.
  - strokeColor (any, optional): Stroke color for the line.
  - strokeWeight (number, optional): Stroke weight for the line.

Returns:
  - content: Array containing a text message with the created line's node ID.
    Example: { "content": [{ "type": "text", "text": "Created line 123:456" }] }

Annotations:
  - title: "Create Line"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "x1": 10,
      "y1": 20,
      "x2": 110,
      "y2": 20
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created line 123:456" }]
    }
`,
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
    `Create multiple lines in Figma.

Parameters:
  - lines (array, required): An array of line configuration objects. Each object should include:
      - x1 (number, required): X coordinate for the start point.
      - y1 (number, required): Y coordinate for the start point.
      - x2 (number, required): X coordinate for the end point.
      - y2 (number, required): Y coordinate for the end point.
      - parentId (string, optional): Figma node ID of the parent.
      - strokeColor (any, optional): Stroke color for the line.
      - strokeWeight (number, optional): Stroke weight for the line.

Returns:
  - content: Array containing a text message with the number of lines created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 lines." }] }

Annotations:
  - title: "Create Lines (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "lines": [
        { "x1": 10, "y1": 20, "x2": 110, "y2": 20 },
        { "x1": 20, "y1": 30, "x2": 120, "y2": 30 }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created 2/2 lines." }]
    }
`,
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
    `Create a new ellipse in Figma.

Parameters:
  - x (number, required): X coordinate for the top-left corner.
  - y (number, required): Y coordinate for the top-left corner.
  - width (number, required): Width in pixels.
  - height (number, required): Height in pixels.
  - name (string, optional): Name for the ellipse node.
  - parentId (string, optional): Figma node ID of the parent.
  - fillColor (any, optional): Fill color for the ellipse.
  - strokeColor (any, optional): Stroke color for the ellipse.
  - strokeWeight (number, optional): Stroke weight for the ellipse.

Returns:
  - content: Array containing a text message with the created ellipse's node ID.
    Example: { "content": [{ "type": "text", "text": "Created ellipse 123:456" }] }

Annotations:
  - title: "Create Ellipse"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "x": 60,
      "y": 80,
      "width": 120,
      "height": 90,
      "name": "Ellipse1"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created ellipse 123:456" }]
    }
`,
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
    `Create multiple polygons in Figma.

Parameters:
  - polygons (array, required): An array of polygon configuration objects. Each object should include:
      - x (number, required): X coordinate for the top-left corner.
      - y (number, required): Y coordinate for the top-left corner.
      - width (number, required): Width in pixels.
      - height (number, required): Height in pixels.
      - sides (number, required): Number of sides (minimum 3).
      - name (string, optional): Name for the polygon node.
      - parentId (string, optional): Figma node ID of the parent.
      - fillColor (any, optional): Fill color for the polygon.
      - strokeColor (any, optional): Stroke color for the polygon.
      - strokeWeight (number, optional): Stroke weight for the polygon.

Returns:
  - content: Array containing a text message with the number of polygons created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 polygons." }] }

Annotations:
  - title: "Create Polygons (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "polygons": [
        { "x": 10, "y": 20, "width": 100, "height": 100, "sides": 5 },
        { "x": 120, "y": 20, "width": 80, "height": 80, "sides": 6 }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created 2/2 polygons." }]
    }
`,
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
    `Create multiple ellipses in Figma.

Parameters:
  - ellipses (array, required): An array of ellipse configuration objects. Each object should include:
      - x (number, required): X coordinate for the top-left corner.
      - y (number, required): Y coordinate for the top-left corner.
      - width (number, required): Width in pixels.
      - height (number, required): Height in pixels.
      - name (string, optional): Name for the ellipse node.
      - parentId (string, optional): Figma node ID of the parent.
      - fillColor (any, optional): Fill color for the ellipse.
      - strokeColor (any, optional): Stroke color for the ellipse.
      - strokeWeight (number, optional): Stroke weight for the ellipse.

Returns:
  - content: Array containing a text message with the number of ellipses created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 ellipses." }] }

Annotations:
  - title: "Create Ellipses (Batch)"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "ellipses": [
        { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Ellipse1" },
        { "x": 120, "y": 20, "width": 80, "height": 40 }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Created 2/2 ellipses." }]
    }
`,
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
