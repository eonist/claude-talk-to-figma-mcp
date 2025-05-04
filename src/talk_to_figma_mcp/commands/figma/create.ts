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
 * - Text elements
 * - Ellipses
 * - Polygons
 * - Stars
 * - Component instances
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
export function registerCreateCommands(server: McpServer, figmaClient: FigmaClient) {
  
  /**
   * Create Rectangle Tool
   *
   * Creates a new rectangle in Figma at the specified position and size.
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
      parentId: z
        .string()
        .optional()
        .describe("Optional parent node ID to append the rectangle to"),
    },
    async ({ x, y, width, height, name, parentId }) => {
      try {
        const result = await figmaClient.createRectangle({
          x,
          y,
          width,
          height,
          name: name || "Rectangle",
          parentId,
        });
        return {
          content: [
            {
              type: "text",
              text: `Created rectangle "${JSON.stringify(result)}"`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating rectangle: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Create Frame Tool
   * 
   * Creates a new frame in Figma at the specified position and size.
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
      parentId: z
        .string()
        .optional()
        .describe("Optional parent node ID to append the frame to"),
      fillColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Fill color in RGBA format"),
      strokeColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Stroke color in RGBA format"),
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({
      x,
      y,
      width,
      height,
      name,
      parentId,
      fillColor,
      strokeColor,
      strokeWeight,
    }) => {
      try {
        const result = await figmaClient.createFrame({
          x,
          y,
          width,
          height,
          name,
          parentId,
          fillColor,
          strokeColor,
          strokeWeight
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Created frame "${result.name}" with ID: ${result.id}. Use the ID as the parentId to appendChild inside this frame.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating frame: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Create Text Tool
   *
   * Creates a new text element in Figma at the specified position.
   */
  server.tool(
    "create_text",
    "Create a new text element in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      text: z.string().describe("Text content"),
      fontSize: z.number().optional().describe("Font size (default: 14)"),
      fontWeight: z
        .number()
        .optional()
        .describe("Font weight (e.g., 400 for Regular, 700 for Bold)"),
      fontColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Font color in RGBA format"),
      name: z
        .string()
        .optional()
        .describe("Optional name for the text node by default following text"),
      parentId: z
        .string()
        .optional()
        .describe("Optional parent node ID to append the text to"),
    },
    async ({ x, y, text, fontSize, fontWeight, fontColor, name, parentId }) => {
      try {
        const result = await figmaClient.createText({
          x,
          y,
          text,
          fontSize,
          fontWeight,
          fontColor,
          name,
          parentId
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Created text "${result.name}" with ID: ${result.id}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating text: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Create Ellipse Tool
   *
   * Creates a new ellipse in Figma at the specified position and size.
   */
  server.tool(
    "create_ellipse",
    "Create a new ellipse in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width of the ellipse"),
      height: z.number().describe("Height of the ellipse"),
      name: z.string().optional().describe("Optional name for the ellipse"),
      parentId: z.string().optional().describe("Optional parent node ID to append the ellipse to"),
      fillColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Fill color in RGBA format"),
      strokeColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Stroke color in RGBA format"),
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ x, y, width, height, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.createEllipse({
          x,
          y,
          width,
          height,
          name,
          parentId,
          fillColor,
          strokeColor,
          strokeWeight
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Created ellipse with ID: ${result.id}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating ellipse: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Create Polygon Tool
   *
   * Creates a new polygon in Figma.
   */
  server.tool(
    "create_polygon",
    "Create a new polygon in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width of the polygon"),
      height: z.number().describe("Height of the polygon"),
      sides: z.number().min(3).optional().describe("Number of sides (default: 6)"),
      name: z.string().optional().describe("Optional name for the polygon"),
      parentId: z.string().optional().describe("Optional parent node ID to append the polygon to"),
      fillColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Fill color in RGBA format"),
      strokeColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Stroke color in RGBA format"),
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ x, y, width, height, sides, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.executeCommand("create_polygon", {
          x,
          y,
          width,
          height,
          sides: sides || 6,
          name: name || "Polygon",
          parentId,
          fillColor,
          strokeColor,
          strokeWeight,
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Created polygon with ID: ${result.id} and ${sides || 6} sides`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating polygon: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Create Star Tool
   *
   * Creates a new star in Figma.
   */
  server.tool(
    "create_star",
    "Create a new star in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width of the star"),
      height: z.number().describe("Height of the star"),
      points: z.number().min(3).optional().describe("Number of points (default: 5)"),
      innerRadius: z.number().min(0.01).max(0.99).optional().describe("Inner radius ratio (0.01-0.99, default: 0.5)"),
      name: z.string().optional().describe("Optional name for the star"),
      parentId: z.string().optional().describe("Optional parent node ID to append the star to"),
      fillColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Fill color in RGBA format"),
      strokeColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Stroke color in RGBA format"),
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ x, y, width, height, points, innerRadius, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.executeCommand("create_star", {
          x,
          y,
          width,
          height,
          points: points || 5,
          innerRadius: innerRadius || 0.5,
          name: name || "Star",
          parentId,
          fillColor,
          strokeColor,
          strokeWeight,
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Created star with ID: ${result.id}, ${points || 5} points, and inner radius ratio of ${innerRadius || 0.5}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating star: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Create Component Instance Tool
   *
   * Creates an instance of a component in Figma.
   */
  server.tool(
    "create_component_instance",
    "Create an instance of a component in Figma",
    {
      componentKey: z.string().describe("Key of the component to instantiate"),
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
    },
    async ({ componentKey, x, y }) => {
      try {
        const result = await figmaClient.executeCommand("create_component_instance", {
          componentKey,
          x,
          y,
        });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating component instance: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Create Vector Tool
   *
   * Creates a new vector node in Figma.
   */
  server.tool(
    "create_vector",
    "Create a new vector in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().describe("Width of the vector"),
      height: z.number().describe("Height of the vector"),
      vectorPaths: z.array(
        z.object({
          windingRule: z.enum(["EVENODD", "NONZERO"]).optional().describe("Path winding rule"),
          data: z.string().describe("SVG path data")
        })
      ).describe("Array of vector paths"),
      name: z.string().optional().describe("Optional name for the vector"),
      parentId: z.string().optional().describe("Optional parent node ID to append the vector to"),
      fillColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Fill color in RGBA format"),
      strokeColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Stroke color in RGBA format"),
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ x, y, width, height, vectorPaths, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.executeCommand("create_vector", {
          x,
          y,
          width,
          height,
          vectorPaths,
          name: name || "Vector",
          parentId,
          fillColor,
          strokeColor,
          strokeWeight,
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Created vector with ID: ${result.id}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating vector: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Create Line Tool
   *
   * Creates a new line in Figma.
   */
  server.tool(
    "create_line",
    "Create a new line in Figma",
    {
      x: z.number().describe("Starting X position"),
      y: z.number().describe("Starting Y position"),
      x2: z.number().describe("Ending X position"),
      y2: z.number().describe("Ending Y position"),
      name: z.string().optional().describe("Optional name for the line"),
      parentId: z.string().optional().describe("Optional parent node ID to append the line to"),
      strokeColor: z
        .object({
          r: z.number().min(0).max(1).describe("Red component (0-1)"),
          g: z.number().min(0).max(1).describe("Green component (0-1)"),
          b: z.number().min(0).max(1).describe("Blue component (0-1)"),
          a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
        })
        .optional()
        .describe("Stroke color in RGBA format"),
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ x, y, x2, y2, name, parentId, strokeColor, strokeWeight }) => {
      try {
        const result = await figmaClient.executeCommand("create_line", {
          x,
          y,
          x2,
          y2,
          name: name || "Line",
          parentId,
          strokeColor: strokeColor || { r: 0, g: 0, b: 0, a: 1 },
          strokeWeight: strokeWeight || 1,
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Created line with ID: ${result.id}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating line: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Insert SVG Vector Tool
   * 
   * Creates a vector node from SVG string content or file in Figma
   */
  server.tool(
    "insert_svg_vector",
    "Insert SVG content as a vector in Figma",
    {
      svg: z.string().optional().describe("SVG string content to convert to Figma vector"),
      svgPath: z.string().optional().describe("Path to an SVG file to load (alternative to svg string)"),
      x: z.number().optional().describe("X position"),
      y: z.number().optional().describe("Y position"),
      name: z.string().optional().describe("Optional name for the vector (defaults to filename if using svgPath)"),
      parentId: z.string().optional().describe("Optional parent node ID to append the vector to"),
    },
    async ({ svg, svgPath, x, y, name, parentId }) => {
      try {
        let svgContent = svg;
        let nodeName = name;
        
        // If svgPath is provided, load SVG from file
        if (svgPath) {
          try {
            // Read SVG file
            svgContent = await SvgUtils.readSvgFile(svgPath);
            
            // If no name is provided, use the filename
            if (!nodeName) {
              nodeName = SvgUtils.getSvgFilename(svgPath);
            }
            
            logger.info(`Loaded SVG from file: ${svgPath}`);
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error reading SVG file: ${error instanceof Error ? error.message : String(error)}`
                }
              ]
            };
          }
        }
        
        // Validate we have SVG content from either source
        if (!svgContent) {
          return {
            content: [
              {
                type: "text",
                text: "Either svg content or svgPath must be provided"
              }
            ]
          };
        }
        
        // Validate SVG content appears to be valid
        if (!SvgUtils.isValidSvgContent(svgContent)) {
          return {
            content: [
              {
                type: "text",
                text: "The provided content does not appear to be valid SVG"
              }
            ]
          };
        }
        
        // Create the SVG vector in Figma
        const result = await figmaClient.insertSvgVector({
          svg: svgContent,
          x: x || 0,
          y: y || 0,
          name: nodeName || "SVG Vector",
          parentId
        });
        
        // Return success response with metadata about the source
        const sourceInfo = svgPath ? `from file: ${path.basename(svgPath)}` : "from SVG string";
        
        return {
          content: [
            {
              type: "text",
              text: `Created SVG vector ${sourceInfo} with ID: ${result.id}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating SVG vector: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
