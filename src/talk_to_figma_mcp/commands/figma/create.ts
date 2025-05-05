import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../clients/figma-client.js";
import { logger } from "../../utils/logger.js";
import { SvgUtils } from "../../utils/svg-utils.js";
import path from "path";

/**
 * Registers create commands for the MCP server
 * 
 * These commands handle operations that create elements in Figma, including:
 * - Rectangles
 * - Frames
 * - Batch frames
 * - Text elements
 * - Ellipses
 * - Polygons
 * - Stars
 * - Component instances
 * - Vectors
 * - Lines
 * - SVG vectors
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
export function registerCreateCommands(server: McpServer, figmaClient: FigmaClient) {

  /**
   * Create Rectangle Tool
   */
  server.tool(
    "create_rectangle",
    "Create a new rectangle in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width of the rectangle"),
      height: z.number().describe("Height of the rectangle"),
      name: z.string().optional().describe("Optional name for the rectangle"),
      parentId: z.string().optional().describe("Optional parent node ID to append the rectangle to"),
    },
    async ({ x, y, width, height, name, parentId }) => {
      try {
        const result = await figmaClient.createRectangle({ x, y, width, height, name: name || "Rectangle", parentId });
        return { content: [{ type: "text", text: `Created rectangle with ID: ${result.id}` }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error creating rectangle: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Create Frame Tool
   */
  server.tool(
    "create_frame",
    "Create a new frame in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width of the frame"),
      height: z.number().describe("Height of the frame"),
      name: z.string().optional().describe("Optional name for the frame"),
      parentId: z.string().optional().describe("Optional parent node ID to append the frame to"),
      fillColor: z.object({
        r: z.number().min(0).max(1).describe("Red component (0-1)"),
        g: z.number().min(0).max(1).describe("Green component (0-1)"),
        b: z.number().min(0).max(1).describe("Blue component (0-1)"),
        a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)")
      }).optional().describe("Fill color in RGBA format"),
      strokeColor: z.object({
        r: z.number().min(0).max(1).describe("Red component (0-1)"),
        g: z.number().min(0).max(1).describe("Green component (0-1)"),
        b: z.number().min(0).max(1).describe("Blue component (0-1)"),
        a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)")
      }).optional().describe("Stroke color in RGBA format"),
      strokeWeight: z.number().positive().optional().describe("Stroke weight")
    },
    async ({ x, y, width, height, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.createFrame({ x, y, width, height, name, parentId, fillColor, strokeColor, strokeWeight });
        return { content:[{ type:"text", text: `Created frame "${result.name}" with ID: ${result.id}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating frame: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Create Frames Tool (batch)
   */
  server.tool(
    "create_frames",
    "Create multiple frames in Figma",
    {
      frames: z.array(
        z.object({
          x: z.number().describe("X position"),
          y: z.number().describe("Y position"),
          width: z.number().describe("Width of the frame"),
          height: z.number().describe("Height of the frame"),
          name: z.string().optional().describe("Optional name for the frame"),
          parentId: z.string().optional().describe("Optional parent node ID"),
          fillColor: z.object({
            r: z.number().min(0).max(1).describe("Red component (0-1)"),
            g: z.number().min(0).max(1).describe("Green component (0-1)"),
            b: z.number().min(0).max(1).describe("Blue component (0-1)"),
            a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)")
          }).optional(),
          strokeColor: z.object({
            r: z.number().min(0).max(1).describe("Red component (0-1)"),
            g: z.number().min(0).max(1).describe("Green component (0-1)"),
            b: z.number().min(0).max(1).describe("Blue component (0-1)"),
            a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)")
          }).optional(),
          strokeWeight: z.number().positive().optional().describe("Stroke weight")
        })
      ).describe("Array of frame configurations")
    },
    async ({ frames }) => {
      try {
        const created: string[] = [];
        for (const cfg of frames) {
          const node = await figmaClient.createFrame(cfg);
          created.push(node.id);
        }
        return { content:[{ type:"text", text: `Created frames with IDs: ${created.join(", ")}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating frames: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Create Text Tool
   */
  server.tool(
    "create_text",
    "Create a new text element in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      text: z.string().describe("Text content"),
      fontSize: z.number().optional().describe("Font size (default: 14)"),
      fontWeight: z.number().optional().describe("Font weight"),
      fontColor: z.object({
        r: z.number().min(0).max(1).describe("Red component (0-1)"),
        g: z.number().min(0).max(1).describe("Green component (0-1)"),
        b: z.number().min(0).max(1).describe("Blue component (0-1)"),
        a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)")
      }).optional(),
      name: z.string().optional().describe("Optional name"),
      parentId: z.string().optional().describe("Optional parent node ID")
    },
    async ({ x, y, text, fontSize, fontWeight, fontColor, name, parentId }) => {
      try {
        const result = await figmaClient.createText({ x, y, text, fontSize, fontWeight, fontColor, name, parentId });
        return { content:[{ type:"text", text: `Created text "${result.name}" with ID: ${result.id}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating text: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Create Ellipse Tool
   */
  server.tool(
    "create_ellipse",
    "Create a new ellipse in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width of the ellipse"),
      height: z.number().describe("Height of the ellipse"),
      name: z.string().optional().describe("Optional name"),
      parentId: z.string().optional().describe("Optional parent node ID"),
      fillColor: z.object({
        r: z.number().min(0).max(1).describe("Red component (0-1)"),
        g: z.number().min(0).max(1).describe("Green component (0-1)"),
        b: z.number().min(0).max(1).describe("Blue component (0-1)"),
        a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)")
      }).optional(),
      strokeColor: z.object({
        r: z.number().min(0).max(1).describe("Red component (0-1)"),
        g: z.number().min(0).max(1).describe("Green component (0-1)"),
        b: z.number().min(0).max(1).describe("Blue component (0-1)"),
        a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)")
      }).optional(),
      strokeWeight: z.number().positive().optional().describe("Stroke weight")
    },
    async ({ x, y, width, height, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.createEllipse({ x, y, width, height, name, parentId, fillColor, strokeColor, strokeWeight });
        return { content:[{ type:"text", text: `Created ellipse with ID: ${result.id}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating ellipse: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Create Polygon Tool
   */
  server.tool(
    "create_polygon",
    "Create a new polygon in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width"),
      height: z.number().describe("Height"),
      sides: z.number().min(3).optional().describe("Number of sides"),
      name: z.string().optional().describe("Optional name"),
      parentId: z.string().optional().describe("Optional parent node ID"),
      fillColor: z.object({ r:z.number(),g:z.number(),b:z.number(),a:z.number().optional() }).optional(),
      strokeColor: z.object({ r:z.number(),g:z.number(),b:z.number(),a:z.number().optional() }).optional(),
      strokeWeight: z.number().positive().optional().describe("Stroke weight")
    },
    async ({ x, y, width, height, sides, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.executeCommand("create_polygon", { x, y, width, height, sides, name, parentId, fillColor, strokeColor, strokeWeight });
        return { content:[{ type:"text", text: `Created polygon with ID: ${result.id}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating polygon: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Create Star Tool
   */
  server.tool(
    "create_star",
    "Create a new star in Figma",
    {
      x: z.number().describe("X"),
      y: z.number().describe("Y"),
      width: z.number().describe("Width"),
      height: z.number().describe("Height"),
      points: z.number().min(3).optional().describe("Points"),
      innerRadius: z.number().min(0.01).max(0.99).optional().describe("Inner radius"),
      name: z.string().optional().describe("Optional name"),
      parentId: z.string().optional().describe("Optional parent node ID"),
      fillColor: z.object({r:z.number(),g:z.number(),b:z.number(),a:z.number().optional()}).optional(),
      strokeColor: z.object({r:z.number(),g:z.number(),b:z.number(),a:z.number().optional()}).optional(),
      strokeWeight: z.number().positive().optional().describe("Stroke weight")
    },
    async ({ x, y, width, height, points, innerRadius, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.executeCommand("create_star", { x, y, width, height, points, innerRadius, name, parentId, fillColor, strokeColor, strokeWeight });
        return { content:[{ type:"text", text: `Created star with ID: ${result.id}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating star: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Create Component Instance Tool
   */
  server.tool(
    "create_component_instance",
    "Create an instance of a component in Figma",
    {
      componentKey: z.string().describe("Key of the component"),
      x: z.number().describe("X position"),
      y: z.number().describe("Y position")
    },
    async ({ componentKey, x, y }) => {
      try {
        const result = await figmaClient.executeCommand("create_component_instance", { componentKey, x, y });
        return { content:[{ type:"text", text: `Created instance with ID: ${result.id}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating component instance: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Create Vector Tool
   */
  server.tool(
    "create_vector",
    "Create a new vector in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width"),
      height: z.number().describe("Height"),
      vectorPaths: z.array(z.object({
        windingRule: z.enum(["EVENODD","NONZERO"]).optional(),
        data: z.string().describe("SVG path data")
      })).describe("Vector paths"),
      name: z.string().optional(),
      parentId: z.string().optional(),
      fillColor: z.object({r:z.number(),g:z.number(),b:z.number(),a:z.number().optional()}).optional(),
      strokeColor: z.object({r:z.number(),g:z.number(),b:z.number(),a:z.number().optional()}).optional(),
      strokeWeight: z.number().positive().optional()
    },
    async ({ x, y, width, height, vectorPaths, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.executeCommand("create_vector", { x, y, width, height, vectorPaths, name, parentId, fillColor, strokeColor, strokeWeight });
        return { content:[{ type:"text", text: `Created vector with ID: ${result.id}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating vector: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Create Line Tool
   */
  server.tool(
    "create_line",
    "Create a new line in Figma",
    {
      x: z.number().describe("Starting X position"),
      y: z.number().describe("Starting Y position"),
      x2: z.number().describe("Ending X position"),
      y2: z.number().describe("Ending Y position"),
      name: z.string().optional(),
      parentId: z.string().optional(),
      strokeColor: z.object({r:z.number(),g:z.number(),b:z.number(),a:z.number().optional()}).optional(),
      strokeWeight: z.number().positive().optional()
    },
    async ({ x, y, x2, y2, name, parentId, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.executeCommand("create_line", { x, y, x2, y2, name, parentId, strokeColor, strokeWeight });
        return { content:[{ type:"text", text: `Created line with ID: ${result.id}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating line: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );

  /**
   * Insert SVG Vector Tool
   */
  server.tool(
    "insert_svg_vector",
    "Insert SVG content as a vector in Figma",
    {
      svg: z.string().optional().describe("SVG content"),
      svgPath: z.string().optional().describe("Path to SVG file"),
      x: z.number().optional().describe("X position"),
      y: z.number().optional().describe("Y position"),
      name: z.string().optional(),
      parentId: z.string().optional()
    },
    async ({ svg, svgPath, x, y, name, parentId }) => {
      try {
        let svgContent = svg;
        let nodeName = name;
        if (svgPath) {
          svgContent = await SvgUtils.readSvgFile(svgPath);
          nodeName = nodeName || SvgUtils.getSvgFilename(svgPath);
        }
        const result = await figmaClient.insertSvgVector({ svg: svgContent!, x, y, name: nodeName, parentId });
        return { content:[{ type:"text", text: `Created SVG vector with ID: ${result.id}` }] };
      } catch (error) {
        return { content:[{ type:"text", text: `Error creating SVG vector: ${error instanceof Error ? error.message : String(error)}` }] };
      }
    }
  );
}
