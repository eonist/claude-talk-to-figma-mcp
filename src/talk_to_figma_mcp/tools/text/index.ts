/**
 * Herramientas MCP relacionadas con texto en Figma
 * 
 * Estas herramientas permiten crear y manipular elementos de texto
 * en el documento de Figma.
 */

import { z } from "zod";
import { FigmaMcpServer } from "../../core/server/mcp-server";
import { RequestManager } from "../../core/handlers/request-manager";
import { ChannelManager } from "../../core/channels/channel-manager";
import { logger } from "../../utils/logger";

/**
 * Registra herramientas relacionadas con texto en el servidor MCP
 * 
 * @param server Instancia del servidor MCP
 * @param requestManager Gestor de solicitudes Figma
 * @param channelManager Gestor de canales
 */
export function registerTextTools(
  server: FigmaMcpServer,
  requestManager: RequestManager,
  channelManager: ChannelManager
): void {
  logger.info("Registrando herramientas de texto...");

  // Herramienta: create_text
  server.registerTool(
    "create_text",
    "Create a new text element in Figma",
    {
      x: z.number().describe("X position"),
      y: z.number().describe("Y position"),
      text: z.string().describe("Text content"),
      name: z.string().optional().describe("Optional name for the text node by default following text"),
      parentId: z.string().optional().describe("Optional parent node ID to append the text to"),
      fontSize: z.number().optional().describe("Font size (default: 14)"),
      fontWeight: z.number().optional().describe("Font weight (e.g., 400 for Regular, 700 for Bold)"),
      fontColor: z.object({
        r: z.number().min(0).max(1).describe("Red component (0-1)"),
        g: z.number().min(0).max(1).describe("Green component (0-1)"),
        b: z.number().min(0).max(1).describe("Blue component (0-1)"),
        a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)")
      }).optional().describe("Font color in RGBA format"),
    },
    async ({ x, y, text, name, parentId, fontSize, fontWeight, fontColor }) => {
      try {
        const result = await requestManager.sendCommand(
          "create_text", 
          { 
            x, y, text, name, parentId, 
            fontSize, fontWeight, fontColor 
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
              text: `Error creating text: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_text_content
  server.registerTool(
    "set_text_content",
    "Set the text content of an existing text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      text: z.string().describe("New text content"),
    },
    async ({ nodeId, text }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_text_content", 
          { nodeId, text }
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
              text: `Error setting text content: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_multiple_text_contents
  server.registerTool(
    "set_multiple_text_contents",
    "Set multiple text contents parallelly in a node",
    {
      nodeId: z.string().describe("The ID of the node containing the text nodes to replace"),
      text: z.array(z.object({
        nodeId: z.string().describe("The ID of the text node"),
        text: z.string().describe("The replacement text")
      })).describe("Array of text node IDs and their replacement texts"),
    },
    async ({ nodeId, text }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_multiple_text_contents", 
          { nodeId, text }
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
              text: `Error setting multiple text contents: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: get_styled_text_segments
  server.registerTool(
    "get_styled_text_segments",
    "Get text segments with specific styling in a text node",
    {
      nodeId: z.string().describe("The ID of the text node to analyze"),
      property: z.enum([
        "fillStyleId", 
        "fontName", 
        "fontSize", 
        "textCase", 
        "textDecoration", 
        "textStyleId", 
        "fills", 
        "letterSpacing", 
        "lineHeight", 
        "fontWeight"
      ]).describe("The style property to analyze segments by"),
    },
    async ({ nodeId, property }) => {
      try {
        const result = await requestManager.sendCommand(
          "get_styled_text_segments", 
          { nodeId, property }
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
              text: `Error getting styled text segments: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_font_name
  server.registerTool(
    "set_font_name",
    "Set the font name and style of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      family: z.string().describe("Font family name"),
      style: z.string().optional().describe("Font style (e.g., 'Regular', 'Bold', 'Italic')"),
    },
    async ({ nodeId, family, style }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_font_name", 
          { nodeId, family, style }
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
              text: `Error setting font name: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_font_size
  server.registerTool(
    "set_font_size",
    "Set the font size of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      fontSize: z.number().positive().describe("Font size in pixels"),
    },
    async ({ nodeId, fontSize }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_font_size", 
          { nodeId, fontSize }
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
              text: `Error setting font size: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_font_weight
  server.registerTool(
    "set_font_weight",
    "Set the font weight of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      weight: z.number().describe("Font weight (100, 200, 300, 400, 500, 600, 700, 800, 900)"),
    },
    async ({ nodeId, weight }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_font_weight", 
          { nodeId, weight }
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
              text: `Error setting font weight: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_letter_spacing
  server.registerTool(
    "set_letter_spacing",
    "Set the letter spacing of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      letterSpacing: z.number().describe("Letter spacing value"),
      unit: z.enum(["PIXELS", "PERCENT"]).optional().describe("Unit type (PIXELS or PERCENT)"),
    },
    async ({ nodeId, letterSpacing, unit }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_letter_spacing", 
          { nodeId, letterSpacing, unit }
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
              text: `Error setting letter spacing: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_line_height
  server.registerTool(
    "set_line_height",
    "Set the line height of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      lineHeight: z.number().describe("Line height value"),
      unit: z.enum(["PIXELS", "PERCENT", "AUTO"]).optional().describe("Unit type (PIXELS, PERCENT, or AUTO)"),
    },
    async ({ nodeId, lineHeight, unit }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_line_height", 
          { nodeId, lineHeight, unit }
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
              text: `Error setting line height: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_paragraph_spacing
  server.registerTool(
    "set_paragraph_spacing",
    "Set the paragraph spacing of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      paragraphSpacing: z.number().describe("Paragraph spacing value in pixels"),
    },
    async ({ nodeId, paragraphSpacing }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_paragraph_spacing", 
          { nodeId, paragraphSpacing }
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
              text: `Error setting paragraph spacing: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_text_case
  server.registerTool(
    "set_text_case",
    "Set the text case of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      textCase: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE"]).describe("Text case type"),
    },
    async ({ nodeId, textCase }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_text_case", 
          { nodeId, textCase }
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
              text: `Error setting text case: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_text_decoration
  server.registerTool(
    "set_text_decoration",
    "Set the text decoration of a text node in Figma",
    {
      nodeId: z.string().describe("The ID of the text node to modify"),
      textDecoration: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"]).describe("Text decoration type"),
    },
    async ({ nodeId, textDecoration }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_text_decoration", 
          { nodeId, textDecoration }
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
              text: `Error setting text decoration: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: load_font_async
  server.registerTool(
    "load_font_async",
    "Load a font asynchronously in Figma",
    {
      family: z.string().describe("Font family name"),
      style: z.string().optional().describe("Font style (e.g., 'Regular', 'Bold', 'Italic')"),
    },
    async ({ family, style }) => {
      try {
        const result = await requestManager.sendCommand(
          "load_font_async", 
          { family, style }
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
              text: `Error loading font: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}