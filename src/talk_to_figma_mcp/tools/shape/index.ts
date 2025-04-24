/**
 * Herramientas MCP relacionadas con la creación y manipulación de formas en Figma
 * 
 * Estas herramientas permiten crear y modificar diferentes tipos de formas
 * como rectángulos, elipses, polígonos y estrellas.
 */

import { z } from "zod";
import { FigmaMcpServer } from "../../core/server/mcp-server";
import { RequestManager } from "../../core/handlers/request-manager";
import { ChannelManager } from "../../core/channels/channel-manager";
import { logger } from "../../utils/logger";

/**
 * Registra herramientas relacionadas con formas en el servidor MCP
 * 
 * @param server Instancia del servidor MCP
 * @param requestManager Gestor de solicitudes Figma
 * @param channelManager Gestor de canales
 */
export function registerShapeTools(
  server: FigmaMcpServer,
  requestManager: RequestManager,
  channelManager: ChannelManager
): void {
  logger.info("Registrando herramientas de formas...");

  // Herramienta: create_rectangle
  server.registerTool(
    "create_rectangle",
    "Create a new rectangle in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().positive().describe("Width of the rectangle"),
      height: z.number().positive().describe("Height of the rectangle"),
      name: z.string().optional().describe("Optional name for the rectangle"),
      parentId: z.string().optional().describe("Optional parent node ID to append the rectangle to"),
    },
    async ({ x, y, width, height, name, parentId }) => {
      try {
        const result = await requestManager.sendCommand(
          "create_rectangle", 
          { x, y, width, height, name, parentId }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
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

  // Herramienta: create_ellipse
  server.registerTool(
    "create_ellipse",
    "Create a new ellipse in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().positive().describe("Width of the ellipse"),
      height: z.number().positive().describe("Height of the ellipse"),
      name: z.string().optional().describe("Optional name for the ellipse"),
      parentId: z.string().optional().describe("Optional parent node ID to append the ellipse to"),
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
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ x, y, width, height, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await requestManager.sendCommand(
          "create_ellipse", 
          { 
            x, y, width, height, name, parentId, 
            fillColor, strokeColor, strokeWeight 
          }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating ellipse: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: create_polygon
  server.registerTool(
    "create_polygon",
    "Create a new polygon in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().positive().describe("Width of the polygon"),
      height: z.number().positive().describe("Height of the polygon"),
      sides: z.number().int().min(3).optional().describe("Number of sides (default: 6)"),
      name: z.string().optional().describe("Optional name for the polygon"),
      parentId: z.string().optional().describe("Optional parent node ID to append the polygon to"),
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
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ x, y, width, height, sides, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await requestManager.sendCommand(
          "create_polygon", 
          { 
            x, y, width, height, sides, name, parentId, 
            fillColor, strokeColor, strokeWeight 
          }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating polygon: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: create_star
  server.registerTool(
    "create_star",
    "Create a new star in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().positive().describe("Width of the star"),
      height: z.number().positive().describe("Height of the star"),
      points: z.number().int().min(3).optional().describe("Number of points (default: 5)"),
      innerRadius: z.number().min(0.01).max(0.99).optional().describe("Inner radius ratio (0.01-0.99, default: 0.5)"),
      name: z.string().optional().describe("Optional name for the star"),
      parentId: z.string().optional().describe("Optional parent node ID to append the star to"),
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
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ x, y, width, height, points, innerRadius, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await requestManager.sendCommand(
          "create_star", 
          { 
            x, y, width, height, points, innerRadius, name, parentId, 
            fillColor, strokeColor, strokeWeight 
          }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating star: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: create_frame
  server.registerTool(
    "create_frame",
    "Create a new frame in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      width: z.number().positive().describe("Width of the frame"),
      height: z.number().positive().describe("Height of the frame"),
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
      strokeWeight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ x, y, width, height, name, parentId, fillColor, strokeColor, strokeWeight }) => {
      try {
        const result = await requestManager.sendCommand(
          "create_frame", 
          { 
            x, y, width, height, name, parentId, 
            fillColor, strokeColor, strokeWeight 
          }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
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

  // Herramienta: set_corner_radius
  server.registerTool(
    "set_corner_radius",
    "Set the corner radius of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      radius: z.number().min(0).describe("Corner radius value"),
      corners: z.array(z.boolean()).length(4).optional().describe("Optional array of 4 booleans to specify which corners to round [topLeft, topRight, bottomRight, bottomLeft]"),
    },
    async ({ nodeId, radius, corners }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_corner_radius", 
          { nodeId, radius, corners }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting corner radius: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_fill_color
  server.registerTool(
    "set_fill_color",
    "Set the fill color of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      r: z.number().min(0).max(1).describe("Red component (0-1)"),
      g: z.number().min(0).max(1).describe("Green component (0-1)"),
      b: z.number().min(0).max(1).describe("Blue component (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
    },
    async ({ nodeId, r, g, b, a }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_fill_color", 
          { nodeId, r, g, b, a }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting fill color: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_stroke_color
  server.registerTool(
    "set_stroke_color",
    "Set the stroke color of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      r: z.number().min(0).max(1).describe("Red component (0-1)"),
      g: z.number().min(0).max(1).describe("Green component (0-1)"),
      b: z.number().min(0).max(1).describe("Blue component (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
      weight: z.number().positive().optional().describe("Stroke weight"),
    },
    async ({ nodeId, r, g, b, a, weight }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_stroke_color", 
          { nodeId, r, g, b, a, weight }
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting stroke color: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}