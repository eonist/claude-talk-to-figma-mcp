#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";

import path from "path";

// Define TypeScript interfaces for Figma responses
interface FigmaResponse {
  id: string;
  result?: any;
  error?: string;
}

// Define interface for command progress updates
interface CommandProgressUpdate {
  type: 'command_progress';
  commandId: string;
  commandType: string;
  status: 'started' | 'in_progress' | 'completed' | 'error';
  progress: number;
  totalItems: number;
  processedItems: number;
  currentChunk?: number;
  totalChunks?: number;
  chunkSize?: number;
  message: string;
  payload?: any;
  timestamp: number;
}

/**
 * Custom logging interface for MCP server
 * 
 * Provides structured logging with:
 * - Severity levels (info, debug, warn, error)
 * - stderr output to avoid command interference
 * - Timestamp prefixing
 * - Error stack traces
 * 
 * Usage:
 * - info: General operational messages
 * - debug: Detailed debugging information
 * - warn: Warning conditions
 * - error: Error conditions
 * - log: Raw logging without formatting
 * 
 * @example
 * logger.info('Server started');
 * logger.debug('Connection details:', details);
 * logger.error('Failed to connect:', error);
 */
const logger = {
  info: (message: string) => process.stderr.write(`[INFO] ${message}\n`),
  debug: (message: string) => process.stderr.write(`[DEBUG] ${message}\n`),
  warn: (message: string) => process.stderr.write(`[WARN] ${message}\n`),
  error: (message: string) => process.stderr.write(`[ERROR] ${message}\n`),
  log: (message: string) => process.stderr.write(`[LOG] ${message}\n`)
};

// WebSocket connection and request tracking
// pendingRequests stores outstanding command requests. Each entry is keyed by a unique command ID,
// and the value contains:
// - resolve: Function to resolve the command promise upon receiving a valid response.
// - reject: Function to reject the command promise in case of errors.
// - timeout: Timeout identifier for this pending request.
// - lastActivity: Timestamp representing the last time data was received for this request.

let ws: WebSocket | null = null;
const pendingRequests = new Map<string, {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
  lastActivity: number; // Add timestamp for last activity
}>();

// Track which channel each client is in
let currentChannel: string | null = null;

// Create MCP server
const server = new McpServer({
  name: "ClaudeTalkToFigmaMCP",
  version: "0.4.0",
  capabilities: { tools: {} }
});

/**
 * List all exposed MCP tools.
 *
 * @returns {Promise<{ content: Array<{ type: string; text: string }> }>} A promise resolving to an object containing a list of tool names.
 */
server.tool(
  "get_tools",
  "List all exposed MCP tools",
  async () => {
    const toolNames = [
      "get_tools",
      "get_document_info",
      "get_selection",
      "get_node_info",
    "rename_layer",
    "rename_layers",
    "ai_rename_layers",
    "rename_multiple"
    ];
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(toolNames, null, 2)
        }
      ]
    };
  }
);

// Add command line argument parsing
const args = process.argv.slice(2);
const serverArg = args.find(arg => arg.startsWith('--server='));
const portArg = args.find(arg => arg.startsWith('--port='));
const reconnectArg = args.find(arg => arg.startsWith('--reconnect-interval='));

const serverUrl = serverArg ? serverArg.split('=')[1] : 'localhost';
const defaultPort = portArg ? parseInt(portArg.split('=')[1], 10) : 3055;
const reconnectInterval = reconnectArg ? parseInt(reconnectArg.split('=')[1], 10) : 2000;

const WS_URL = serverUrl === 'localhost' ? `ws://${serverUrl}` : `wss://${serverUrl}`;

/**
 * Get Document Info Tool
 *
 * Retrieves detailed information about the current Figma document.
 *
 * @returns {Promise<{ content: Array<{ type: string; text: string }> }>} A promise resolving to an object containing the document info as JSON text.
 *
 * @throws Will throw an error if the document info cannot be retrieved.
 *
 * @example
 * const docInfo = await getDocumentInfo();
 * console.log(docInfo);
 */
server.tool(
  "get_document_info",
  "Get detailed information about the current Figma document",
  {},
  async () => {
    try {
      const result = await sendCommandToFigma("get_document_info");
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
            text: `Error getting document info: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Document Info Tool
 * 
 * Retrieves comprehensive information about the current Figma document and its structure.
 * This tool provides a detailed snapshot of the document's hierarchy and metadata.
 * 
 * Returns:
 * - document name and ID
 * - current page details
 * - hierarchical list of child nodes with their properties
 * - page summary information
 * 
 * @example
 * // Get document structure
 * const docInfo = await getDocumentInfo();
 * console.log(`Current page: ${docInfo.currentPage.name}`);
 * console.log(`Total children: ${docInfo.currentPage.childCount}`);
 * 
 * // Inspect specific child node
 * const firstChild = docInfo.children[0];
 * console.log(`First node: ${firstChild.name} (${firstChild.type})`);
 * 
 * @returns {Promise<{
*   name: string,
*   id: string,
*   type: string,
*   children: Array<{id: string, name: string, type: string}>,
*   currentPage: {
*     id: string,
*     name: string,
*     childCount: number
*   },
*   pages: Array<{
*     id: string,
*     name: string,
*     childCount: number
*   }>
* }>}
*/
server.tool(
  "get_selection",
  "Get information about the current selection in Figma",
  {},
  async () => {
    try {
      const result = await sendCommandToFigma("get_selection");
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
            text: `Error getting selection: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Get Node Info Tool
 *
 * Retrieves detailed information about a specific node in Figma.
 *
 * @param {object} params - Parameters for getting node info.
 * @param {string} params.nodeId - The ID of the node to get information about.
 *
 * @returns {Promise<{ content: Array<{ type: string; text: string }> }>} A promise resolving to an object containing the filtered node info as JSON text.
 *
 * @throws Will throw an error if the node info cannot be retrieved.
 *
 * @example
 * const nodeInfo = await getNodeInfo({ nodeId: "123" });
 * console.log(nodeInfo);
 */
server.tool(
  "get_node_info",
  "Get detailed information about a specific node in Figma",
  {
    nodeId: z.string().describe("The ID of the node to get information about"),
  },
  async ({ nodeId }) => {
    try {
      const result = await sendCommandToFigma("get_node_info", { nodeId });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(filterFigmaNode(result))
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting node info: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Converts RGBA color values to hexadecimal string format.
 * 
 * @param {Object} color - RGBA color object
 * @param {number} color.r - Red channel (0-1)
 * @param {number} color.g - Green channel (0-1)
 * @param {number} color.b - Blue channel (0-1) 
 * @param {number} color.a - Alpha channel (0-1)
 * @returns {string} Hex color string (e.g. "#ff0000" or "#ff0000ff")
 * 
 * @example
 * rgbaToHex({r: 1, g: 0, b: 0, a: 1}) // Returns "#ff0000"
 * rgbaToHex({r: 1, g: 0, b: 0, a: 0.5}) // Returns "#ff000080"
 */
function rgbaToHex(color: any): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a === 255 ? '' : a.toString(16).padStart(2, '0')}`;
}

/**
 * Filters and processes Figma node data for client consumption
 * 
 * Supported Node Types:
 * - FRAME: Container nodes with layout capabilities
 * - COMPONENT: Reusable design elements
 * - INSTANCE: Instances of components
 * - GROUP: Collection of nodes
 * - RECTANGLE/ELLIPSE/TEXT: Basic shape and text nodes
 *
 * Filtered Attributes:
 * - fills: Color and gradient fills
 * - strokes: Border styles
 * - effects: Shadows, blurs etc
 * - cornerRadius: Corner rounding
 * - textStyles: Font and text formatting
 * 
 * Special Handling:
 * - Removes boundVariables and imageRefs
 * - Converts colors to hex format
 * - Cleans up gradient stops
 * - Processes nested children recursively
 *
 * @param {any} node - Raw Figma node to filter
 * @returns {any | null} Filtered node or null if node should be excluded
 */
/**
 * Filters and processes Figma node data for client consumption.
 * 
 * @param {FigmaNode} node - Raw Figma node to filter
 * @returns {FilteredNode | null} Filtered node data or null if node should be excluded
 * 
 * @typedef {Object} FigmaNode
 * @property {string} id - Node ID
 * @property {string} name - Node name
 * @property {string} type - Node type (FRAME, COMPONENT, GROUP etc)
 * @property {Array<FigmaNode>} [children] - Child nodes
 * @property {Array<Object>} [fills] - Fill styles
 * @property {Array<Object>} [strokes] - Stroke styles
 * @property {Object} [style] - Text styling properties
 * 
 * @typedef {Object} FilteredNode
 * @property {string} id - Node ID
 * @property {string} name - Node name 
 * @property {string} type - Node type
 * @property {Array<FilteredNode>} [children] - Filtered child nodes
 * @property {Array<Object>} [fills] - Processed fill styles with hex colors
 * @property {Array<Object>} [strokes] - Processed stroke styles
 * @property {Object} [style] - Cleaned text style properties
 */
function filterFigmaNode(node: any) {
  // Skip VECTOR type nodes
  if (node.type === "VECTOR") {
    return null;
  }

  const filtered: any = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  if (node.fills && node.fills.length > 0) {
    filtered.fills = node.fills.map((fill: any) => {
      const processedFill = { ...fill };

      // Remove boundVariables and imageRef
      delete processedFill.boundVariables;
      delete processedFill.imageRef;

      // Process gradientStops if present
      if (processedFill.gradientStops) {
        processedFill.gradientStops = processedFill.gradientStops.map((stop: any) => {
          const processedStop = { ...stop };
          // Convert color to hex if present
          if (processedStop.color) {
            processedStop.color = rgbaToHex(processedStop.color);
          }
          // Remove boundVariables
          delete processedStop.boundVariables;
          return processedStop;
        });
      }

      // Convert solid fill colors to hex
      if (processedFill.color) {
        processedFill.color = rgbaToHex(processedFill.color);
      }

      return processedFill;
    });
  }

  if (node.strokes && node.strokes.length > 0) {
    filtered.strokes = node.strokes.map((stroke: any) => {
      const processedStroke = { ...stroke };
      // Remove boundVariables
      delete processedStroke.boundVariables;
      // Convert color to hex if present
      if (processedStroke.color) {
        processedStroke.color = rgbaToHex(processedStroke.color);
      }
      return processedStroke;
    });
  }

  if (node.cornerRadius !== undefined) {
    filtered.cornerRadius = node.cornerRadius;
  }

  if (node.absoluteBoundingBox) {
    filtered.absoluteBoundingBox = node.absoluteBoundingBox;
  }

  if (node.characters) {
    filtered.characters = node.characters;
  }

  if (node.style) {
    filtered.style = {
      fontFamily: node.style.fontFamily,
      fontStyle: node.style.fontStyle,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      textAlignHorizontal: node.style.textAlignHorizontal,
      letterSpacing: node.style.letterSpacing,
      lineHeightPx: node.style.lineHeightPx
    };
  }

  if (node.children) {
    filtered.children = node.children
      .map((child: any) => filterFigmaNode(child))
      .filter((child: any) => child !== null); // Remove null children (VECTOR nodes)
  }

  return filtered;
}

// Nodes Info Tool
server.tool(
  "get_nodes_info",
  "Get detailed information about multiple nodes in Figma",
  {
    nodeIds: z.array(z.string()).describe("Array of node IDs to get information about")
  },
  async ({ nodeIds }) => {
    try {
      const results = await Promise.all(
        nodeIds.map(async (nodeId) => {
          const result = await sendCommandToFigma('get_node_info', { nodeId });
          return { nodeId, info: result };
        })
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results.map((result) => filterFigmaNode(result.info)))
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting nodes info: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Create Rectangle Tool
 *
 * Creates a new rectangle in Figma at the specified position and size.
 *
 * @param {object} params - Parameters for creating the rectangle.
 * @param {number} params.x - X position of the rectangle.
 * @param {number} params.y - Y position of the rectangle.
 * @param {number} params.width - Width of the rectangle.
 * @param {number} params.height - Height of the rectangle.
 * @param {string} [params.name] - Optional name for the rectangle.
 * @param {string} [params.parentId] - Optional parent node ID to append the rectangle to.
 *
 * @returns {Promise<{ content: Array<{ type: string; text: string }> }>} A promise resolving to an object containing creation result text.
 *
 * @throws Will throw an error if the rectangle cannot be created.
 *
 * @example
 * await createRectangle({ x: 10, y: 20, width: 100, height: 50, name: "MyRect" });
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
      const result = await sendCommandToFigma("create_rectangle", {
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
            text: `Error creating rectangle: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Create Frame Tool
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
      const result = await sendCommandToFigma("create_frame", {
        x,
        y,
        width,
        height,
        name: name || "Frame",
        parentId,
        fillColor: fillColor || { r: 1, g: 1, b: 1, a: 1 },
        strokeColor: strokeColor,
        strokeWeight: strokeWeight,
      });
      const typedResult = result as { name: string; id: string };
      return {
        content: [
          {
            type: "text",
            text: `Created frame "${typedResult.name}" with ID: ${typedResult.id}. Use the ID as the parentId to appendChild inside this frame.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating frame: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Create Text Tool
 *
 * Creates a new text element in Figma at the specified position with optional styling.
 *
 * @param {object} params - Parameters for creating the text element.
 * @param {number} params.x - X position of the text.
 * @param {number} params.y - Y position of the text.
 * @param {string} params.text - Text content.
 * @param {number} [params.fontSize=14] - Font size.
 * @param {number} [params.fontWeight=400] - Font weight.
 * @param {object} [params.fontColor] - Font color in RGBA format.
 * @param {string} [params.name] - Optional name for the text node.
 * @param {string} [params.parentId] - Optional parent node ID to append the text to.
 *
 * @returns {Promise<{ content: Array<{ type: string; text: string }> }>} A promise resolving to an object containing creation result text.
 *
 * @throws Will throw an error if the text element cannot be created.
 *
 * @example
 * await createText({ x: 10, y: 20, text: "Hello World", fontSize: 16, fontWeight: 700 });
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
      const result = await sendCommandToFigma("create_text", {
        x,
        y,
        text,
        fontSize: fontSize || 14,
        fontWeight: fontWeight || 400,
        fontColor: fontColor || { r: 0, g: 0, b: 0, a: 1 },
        name: name || "Text",
        parentId,
      });
      const typedResult = result as { name: string; id: string };
      return {
        content: [
          {
            type: "text",
            text: `Created text "${typedResult.name}" with ID: ${typedResult.id}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating text: ${error instanceof Error ? error.message : String(error)
              }`,
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
 *
 * @param {object} params - Parameters for creating the ellipse.
 * @param {number} params.x - X position of the ellipse.
 * @param {number} params.y - Y position of the ellipse.
 * @param {number} params.width - Width of the ellipse.
 * @param {number} params.height - Height of the ellipse.
 * @param {string} [params.name] - Optional name for the ellipse.
 * @param {string} [params.parentId] - Optional parent node ID to append the ellipse to.
 * @param {object} [params.fillColor] - Optional fill color in RGBA format.
 * @param {object} [params.strokeColor] - Optional stroke color in RGBA format.
 * @param {number} [params.strokeWeight] - Optional stroke weight.
 *
 * @returns {Promise<{ content: Array<{ type: string; text: string }> }>} A promise resolving to an object containing creation result text.
 *
 * @throws Will throw an error if the ellipse cannot be created.
 *
 * @example
 * await createEllipse({ x: 10, y: 20, width: 100, height: 50, name: "MyEllipse" });
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
      const result = await sendCommandToFigma("create_ellipse", {
        x,
        y,
        width,
        height,
        name: name || "Ellipse",
        parentId,
        fillColor,
        strokeColor,
        strokeWeight,
      });
      
      const typedResult = result as { id: string, name: string };
      return {
        content: [
          {
            type: "text",
            text: `Created ellipse with ID: ${typedResult.id}`
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

// Create Polygon Tool
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
      const result = await sendCommandToFigma("create_polygon", {
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
      
      const typedResult = result as { id: string, name: string };
      return {
        content: [
          {
            type: "text",
            text: `Created polygon with ID: ${typedResult.id} and ${sides || 6} sides`
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

// Create Star Tool
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
      const result = await sendCommandToFigma("create_star", {
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
      
      const typedResult = result as { id: string, name: string };
      return {
        content: [
          {
            type: "text",
            text: `Created star with ID: ${typedResult.id}, ${points || 5} points, and inner radius ratio of ${innerRadius || 0.5}`
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
 * Set Fill Color Tool
 *
 * Sets the fill color of a node in Figma, which can be a TextNode or FrameNode.
 *
 * @param {object} params - Parameters for setting fill color.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {number} params.r - Red component (0-1).
 * @param {number} params.g - Green component (0-1).
 * @param {number} params.b - Blue component (0-1).
 * @param {number} [params.a=1] - Alpha component (0-1).
 *
 * @returns {Promise<object>} An object containing the node's name.
 *
 * @throws Will throw an error if the node is not found or does not support fills.
 *
 * @example
 * await server.tool("set_fill_color", { nodeId: "123", r: 1, g: 0, b: 0, a: 1 });
 */
server.tool(
  "set_fill_color",
  "Set the fill color of a node in Figma can be TextNode or FrameNode",
  {
    nodeId: z.string().describe("The ID of the node to modify"),
    r: z.number().min(0).max(1).describe("Red component (0-1)"),
    g: z.number().min(0).max(1).describe("Green component (0-1)"),
    b: z.number().min(0).max(1).describe("Blue component (0-1)"),
    a: z.number().min(0).max(1).optional().describe("Alpha component (0-1)"),
  },
  async ({ nodeId, r, g, b, a }) => {
    try {
      const result = await sendCommandToFigma("set_fill_color", {
        nodeId,
        color: { r, g, b, a: a || 1 },
      });
      const typedResult = result as { name: string };
      return {
        content: [
          {
            type: "text",
            text: `Set fill color of node "${typedResult.name
              }" to RGBA(${r}, ${g}, ${b}, ${a || 1})`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting fill color: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Set Stroke Color Tool
 *
 * Sets the stroke color of a node in Figma.
 *
 * @param {object} params - Parameters for setting stroke color.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {number} params.r - Red component (0-1).
 * @param {number} params.g - Green component (0-1).
 * @param {number} params.b - Blue component (0-1).
 * @param {number} [params.a=1] - Alpha component (0-1).
 * @param {number} [params.weight=1] - Stroke weight.
 *
 * @returns {Promise<object>} An object containing the node's name.
 *
 * @throws Will throw an error if the node is not found or does not support strokes.
 *
 * @example
 * await server.tool("set_stroke_color", { nodeId: "123", r: 0, g: 0, b: 0, a: 1, weight: 2 });
 */
server.tool(
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
      const result = await sendCommandToFigma("set_stroke_color", {
        nodeId,
        color: { r, g, b, a: a || 1 },
        weight: weight || 1,
      });
      const typedResult = result as { name: string };
      return {
        content: [
          {
            type: "text",
            text: `Set stroke color of node "${typedResult.name
              }" to RGBA(${r}, ${g}, ${b}, ${a || 1}) with weight ${weight || 1}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting stroke color: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Move Node Tool
 *
 * Moves a node to a new position in Figma.
 *
 * @param {object} params - Parameters for moving the node.
 * @param {string} params.nodeId - The ID of the node to move.
 * @param {number} params.x - The new X position.
 * @param {number} params.y - The new Y position.
 *
 * @returns {Promise<object>} An object containing the node's name.
 *
 * @throws Will throw an error if the node is not found or does not support positioning.
 *
 * @example
 * await server.tool("move_node", { nodeId: "123", x: 100, y: 200 });
 */
server.tool(
  "move_node",
  "Move a node to a new position in Figma",
  {
    nodeId: z.string().describe("The ID of the node to move"),
    x: z.number().describe("New X position"),
    y: z.number().describe("New Y position"),
  },
  async ({ nodeId, x, y }) => {
    try {
      const result = await sendCommandToFigma("move_node", { nodeId, x, y });
      const typedResult = result as { name: string };
      return {
        content: [
          {
            type: "text",
            text: `Moved node "${typedResult.name}" to position (${x}, ${y})`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error moving node: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Clone Node Tool
server.tool(
  "clone_node",
  "Clone an existing node in Figma",
  {
    nodeId: z.string().describe("The ID of the node to clone"),
    x: z.number().optional().describe("New X position for the clone"),
    y: z.number().optional().describe("New Y position for the clone")
  },
  async ({ nodeId, x, y }) => {
    try {
      const result = await sendCommandToFigma('clone_node', { nodeId, x, y });
      const typedResult = result as { name: string, id: string };
      return {
        content: [
          {
            type: "text",
            text: `Cloned node "${typedResult.name}" with new ID: ${typedResult.id}${x !== undefined && y !== undefined ? ` at position (${x}, ${y})` : ''}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error cloning node: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Resize Node Tool
server.tool(
  "resize_node",
  "Resize a node in Figma",
  {
    nodeId: z.string().describe("The ID of the node to resize"),
    width: z.number().positive().describe("New width"),
    height: z.number().positive().describe("New height"),
  },
  async ({ nodeId, width, height }) => {
    try {
      const result = await sendCommandToFigma("resize_node", {
        nodeId,
        width,
        height,
      });
      const typedResult = result as { name: string };
      return {
        content: [
          {
            type: "text",
            text: `Resized node "${typedResult.name}" to width ${width} and height ${height}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error resizing node: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Delete Node Tool
server.tool(
  "delete_node",
  "Delete a node from Figma",
  {
    nodeId: z.string().describe("The ID of the node to delete"),
  },
  async ({ nodeId }) => {
    try {
      await sendCommandToFigma("delete_node", { nodeId });
      return {
        content: [
          {
            type: "text",
            text: `Deleted node with ID: ${nodeId}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error deleting node: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Export Node as Image Tool
server.tool(
  "export_node_as_image",
  "Export a node as an image from Figma",
  {
    nodeId: z.string().describe("The ID of the node to export"),
    format: z
      .enum(["PNG", "JPG", "SVG", "PDF"])
      .optional()
      .describe("Export format"),
    scale: z.number().positive().optional().describe("Export scale"),
  },
  async ({ nodeId, format, scale }) => {
    try {
      const result = await sendCommandToFigma("export_node_as_image", {
        nodeId,
        format: format || "PNG",
        scale: scale || 1,
      });
      const typedResult = result as { imageData: string; mimeType: string };

      return {
        content: [
          {
            type: "image",
            data: typedResult.imageData,
            mimeType: typedResult.mimeType || "image/png",
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error exporting node as image: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Set Text Content Tool
server.tool(
  "set_text_content",
  "Set the text content of an existing text node in Figma",
  {
    nodeId: z.string().describe("The ID of the text node to modify"),
    text: z.string().describe("New text content"),
  },
  async ({ nodeId, text }) => {
    try {
      const result = await sendCommandToFigma("set_text_content", {
        nodeId,
        text,
      });
      const typedResult = result as { name: string };
      return {
        content: [
          {
            type: "text",
            text: `Updated text content of node "${typedResult.name}" to "${text}"`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting text content: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Get Styles Tool
/**
 * Get Styles Tool
 *
 * Retrieves all styles from the current Figma document.
 *
 * @returns {Promise<object>} A promise resolving to an object containing all styles.
 *
 * @throws Will throw an error if styles cannot be retrieved.
 *
 * @example
 * const styles = await server.tool("get_styles");
 * console.log(styles);
 */
/**
 * Get Styles Tool
 *
 * Retrieves all styles from the current Figma document.
 *
 * @returns {Promise<object>} A promise resolving to an object containing all styles.
 *
 * @throws Will throw an error if styles cannot be retrieved.
 *
 * @example
 * const styles = await server.tool("get_styles");
 * console.log(styles);
 */
server.tool(
  "get_styles",
  "Get all styles from the current Figma document",
  {},
  async () => {
    try {
      const result = await sendCommandToFigma("get_styles");
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
            text: `Error getting styles: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Get Local Components Tool
/**
 * Get Local Components Tool
 *
 * Retrieves all local components from the current Figma document.
 *
 * @returns {Promise<object>} A promise resolving to an object containing all local components.
 *
 * @throws Will throw an error if local components cannot be retrieved.
 *
 * @example
 * const components = await server.tool("get_local_components");
 * console.log(components);
 */
server.tool(
  "get_local_components",
  "Get all local components from the Figma document",
  {},
  async () => {
    try {
      const result = await sendCommandToFigma("get_local_components");
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
            text: `Error getting local components: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Create Component Instance Tool
/**
 * Create Component Instance Tool
 *
 * Creates an instance of a component in Figma at the specified position.
 *
 * @param {object} params - Parameters for creating the component instance.
 * @param {string} params.componentKey - Key of the component to instantiate.
 * @param {number} params.x - X position.
 * @param {number} params.y - Y position.
 *
 * @returns {Promise<object>} A promise resolving to an object containing the created instance details.
 *
 * @throws Will throw an error if the component instance cannot be created.
 *
 * @example
 * const instance = await server.tool("create_component_instance", { componentKey: "abc123", x: 10, y: 20 });
 * console.log(instance);
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
      const result = await sendCommandToFigma("create_component_instance", {
        componentKey,
        x,
        y,
      });
      const typedResult = result as any;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(typedResult),
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating component instance: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Set Corner Radius Tool
 *
 * Sets the corner radius of a node in Figma.
 *
 * @param {object} params - Parameters for setting corner radius.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {number} params.radius - The corner radius value.
 * @param {boolean[]} [params.corners] - Optional array of 4 booleans specifying which corners to round [topLeft, topRight, bottomRight, bottomLeft].
 *
 * @returns {Promise<object>} An object containing the node's name.
 *
 * @throws Will throw an error if the node is not found or does not support corner radius.
 *
 * @example
 * await server.tool("set_corner_radius", { nodeId: "123", radius: 10, corners: [true, true, false, false] });
 */
/**
 * Set Corner Radius Tool
 *
 * Sets the corner radius of a node in Figma.
 *
 * @param {object} params - Parameters for setting corner radius.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {number} params.radius - The corner radius value.
 * @param {boolean[]} [params.corners] - Optional array of 4 booleans specifying which corners to round [topLeft, topRight, bottomRight, bottomLeft].
 *
 * @returns {Promise<object>} An object containing the node's name.
 *
 * @throws Will throw an error if the node is not found or does not support corner radius.
 *
 * @example
 * await server.tool("set_corner_radius", { nodeId: "123", radius: 10, corners: [true, true, false, false] });
 */
server.tool(
  "set_corner_radius",
  "Set the corner radius of a node in Figma",
  {
    nodeId: z.string().describe("The ID of the node to modify"),
    radius: z.number().min(0).describe("Corner radius value"),
    corners: z
      .array(z.boolean())
      .length(4)
      .optional()
      .describe(
        "Optional array of 4 booleans to specify which corners to round [topLeft, topRight, bottomRight, bottomLeft]"
      ),
  },
  async ({ nodeId, radius, corners }) => {
    try {
      const result = await sendCommandToFigma("set_corner_radius", {
        nodeId,
        radius,
        corners: corners || [true, true, true, true],
      });
      const typedResult = result as { name: string };
      return {
        content: [
          {
            type: "text",
            text: `Set corner radius of node "${typedResult.name}" to ${radius}px`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting corner radius: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Set Auto Layout Resizing Tool
 *
 * Sets hug or fill sizing mode on an auto layout frame or child node.
 *
 * @param {object} params - Parameters for setting auto layout resizing.
 * @param {string} params.nodeId - The ID of the node to modify sizing for.
 * @param {string} params.axis - The axis to apply sizing mode ("horizontal" or "vertical").
 * @param {string} params.mode - The sizing mode to apply ("FIXED", "HUG", or "FILL").
 *
 * @returns {Promise<object>} An object containing the updated sizing mode.
 *
 * @throws Will throw an error if the node is not found or does not support auto layout.
 *
 * @example
 * await server.tool("set_auto_layout_resizing", { nodeId: "123", axis: "horizontal", mode: "FILL" });
 */
/**
 * Set Auto Layout Resizing Tool
 *
 * Sets hug or fill sizing mode on an auto layout frame or child node.
 *
 * @param {object} params - Parameters for setting auto layout resizing.
 * @param {string} params.nodeId - The ID of the node to modify sizing for.
 * @param {string} params.axis - The axis to apply sizing mode ("horizontal" or "vertical").
 * @param {string} params.mode - The sizing mode to apply ("FIXED", "HUG", or "FILL").
 *
 * @returns {Promise<object>} An object containing the updated sizing mode.
 *
 * @throws Will throw an error if the node is not found or does not support auto layout.
 *
 * @example
 * await server.tool("set_auto_layout_resizing", { nodeId: "123", axis: "horizontal", mode: "FILL" });
 */
server.tool(
  "set_auto_layout_resizing",
  "Set hug or fill sizing mode on an auto layout frame or child node",
  {
    nodeId: z.string().describe("The ID of the node to modify sizing for"),
    axis: z.enum(["horizontal", "vertical"]).describe("Which axis to apply sizing mode"),
    mode: z.enum(["FIXED", "HUG", "FILL"]).describe("Sizing mode to apply")
  },
  async ({ nodeId, axis, mode }) => {
    try {
      const result = await sendCommandToFigma("set_auto_layout_resizing", { nodeId, axis, mode });
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
            text: `Error setting resizing mode: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Auto Layout Tool
 *
 * Configures auto layout properties for a node in Figma.
 *
 * @param {object} params - Parameters for auto layout configuration.
 * @param {string} params.nodeId - The ID of the node to configure auto layout.
 * @param {string} params.layoutMode - Layout direction ("HORIZONTAL", "VERTICAL", or "NONE").
 * @param {number} [params.paddingTop] - Top padding in pixels.
 * @param {number} [params.paddingBottom] - Bottom padding in pixels.
 * @param {number} [params.paddingLeft] - Left padding in pixels.
 * @param {number} [params.paddingRight] - Right padding in pixels.
 * @param {number} [params.itemSpacing] - Spacing between items in pixels.
 * @param {string} [params.primaryAxisAlignItems] - Alignment along primary axis.
 * @param {string} [params.counterAxisAlignItems] - Alignment along counter axis.
 * @param {string} [params.layoutWrap] - Whether items wrap to new lines.
 * @param {boolean} [params.strokesIncludedInLayout] - Whether strokes are included in layout calculations.
 *
 * @returns {Promise<object>} An object with updated auto layout properties.
 *
 * @throws Will throw an error if the node is not found or does not support auto layout.
 *
 * @example
 * await server.tool("set_auto_layout", { nodeId: "123", layoutMode: "HORIZONTAL", paddingTop: 10 });
 */
/**
 * Auto Layout Tool
 *
 * Configures auto layout properties for a node in Figma.
 *
 * @param {object} params - Parameters for auto layout configuration.
 * @param {string} params.nodeId - The ID of the node to configure auto layout.
 * @param {string} params.layoutMode - Layout direction ("HORIZONTAL", "VERTICAL", or "NONE").
 * @param {number} [params.paddingTop] - Top padding in pixels.
 * @param {number} [params.paddingBottom] - Bottom padding in pixels.
 * @param {number} [params.paddingLeft] - Left padding in pixels.
 * @param {number} [params.paddingRight] - Right padding in pixels.
 * @param {number} [params.itemSpacing] - Spacing between items in pixels.
 * @param {string} [params.primaryAxisAlignItems] - Alignment along primary axis.
 * @param {string} [params.counterAxisAlignItems] - Alignment along counter axis.
 * @param {string} [params.layoutWrap] - Whether items wrap to new lines.
 * @param {boolean} [params.strokesIncludedInLayout] - Whether strokes are included in layout calculations.
 *
 * @returns {Promise<object>} An object with updated auto layout properties.
 *
 * @throws Will throw an error if the node is not found or does not support auto layout.
 *
 * @example
 * await server.tool("set_auto_layout", { nodeId: "123", layoutMode: "HORIZONTAL", paddingTop: 10 });
 */
/**
 * Auto Layout Tool
 *
 * Configures auto layout properties for a node in Figma.
 *
 * @param {object} params - Parameters for auto layout configuration.
 * @param {string} params.nodeId - The ID of the node to configure auto layout.
 * @param {string} params.layoutMode - Layout direction ("HORIZONTAL", "VERTICAL", or "NONE").
 * @param {number} [params.paddingTop] - Top padding in pixels.
 * @param {number} [params.paddingBottom] - Bottom padding in pixels.
 * @param {number} [params.paddingLeft] - Left padding in pixels.
 * @param {number} [params.paddingRight] - Right padding in pixels.
 * @param {number} [params.itemSpacing] - Spacing between items in pixels.
 * @param {string} [params.primaryAxisAlignItems] - Alignment along primary axis.
 * @param {string} [params.counterAxisAlignItems] - Alignment along counter axis.
 * @param {string} [params.layoutWrap] - Whether items wrap to new lines.
 * @param {boolean} [params.strokesIncludedInLayout] - Whether strokes are included in layout calculations.
 *
 * @returns {Promise<object>} An object with updated auto layout properties.
 *
 * @throws Will throw an error if the node is not found or does not support auto layout.
 *
 * @example
 * await server.tool("set_auto_layout", { nodeId: "123", layoutMode: "HORIZONTAL", paddingTop: 10 });
 */
server.tool(
  "set_auto_layout",
  "Configure auto layout properties for a node in Figma",
  {
    nodeId: z.string().describe("The ID of the node to configure auto layout"),
    layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"]).describe("Layout direction"),
    paddingTop: z.number().optional().describe("Top padding in pixels"),
    paddingBottom: z.number().optional().describe("Bottom padding in pixels"),
    paddingLeft: z.number().optional().describe("Left padding in pixels"),
    paddingRight: z.number().optional().describe("Right padding in pixels"),
    itemSpacing: z.number().optional().describe("Spacing between items in pixels"),
    primaryAxisAlignItems: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).optional().describe("Alignment along primary axis"),
    counterAxisAlignItems: z.enum(["MIN", "CENTER", "MAX"]).optional().describe("Alignment along counter axis"),
    layoutWrap: z.enum(["WRAP", "NO_WRAP"]).optional().describe("Whether items wrap to new lines"),
    strokesIncludedInLayout: z.boolean().optional().describe("Whether strokes are included in layout calculations")
  },
  async ({ nodeId, layoutMode, paddingTop, paddingBottom, paddingLeft, paddingRight, 
           itemSpacing, primaryAxisAlignItems, counterAxisAlignItems, layoutWrap, strokesIncludedInLayout }) => {
    try {
      const result = await sendCommandToFigma("set_auto_layout", { 
        nodeId, 
        layoutMode, 
        paddingTop, 
        paddingBottom, 
        paddingLeft, 
        paddingRight, 
        itemSpacing, 
        primaryAxisAlignItems, 
        counterAxisAlignItems, 
        layoutWrap, 
        strokesIncludedInLayout 
      });
      
      const typedResult = result as { name: string };
      return {
        content: [
          {
            type: "text",
            text: `Applied auto layout to node "${typedResult.name}" with mode: ${layoutMode}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting auto layout: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Set Font Name Tool
/**
 * Set Font Name Tool
 *
 * Sets the font name and style of a text node in Figma.
 *
 * @param {object} params - Parameters for setting font name.
 * @param {string} params.nodeId - The ID of the text node to modify.
 * @param {string} params.family - Font family name.
 * @param {string} [params.style] - Font style (e.g., "Regular", "Bold", "Italic").
 *
 * @returns {Promise<object>} An object containing the node's name and updated font name.
 *
 * @throws Will throw an error if the font name cannot be set.
 *
 * @example
 * await server.tool("set_font_name", { nodeId: "123", family: "Roboto", style: "Bold" });
 */
server.tool(
  "set_font_name",
  "Set the font name and style of a text node in Figma",
  {
    nodeId: z.string().describe("The ID of the text node to modify"),
    family: z.string().describe("Font family name"),
    style: z.string().optional().describe("Font style (e.g., 'Regular', 'Bold', 'Italic')"),
  },
  async ({ nodeId, family, style }) => {
    try {
      const result = await sendCommandToFigma("set_font_name", {
        nodeId,
        family,
        style
      });
      const typedResult = result as { name: string, fontName: { family: string, style: string } };
      return {
        content: [
          {
            type: "text",
            text: `Updated font of node "${typedResult.name}" to ${typedResult.fontName.family} ${typedResult.fontName.style}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting font name: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Set Font Size Tool
server.tool(
  "set_font_size",
  "Set the font size of a text node in Figma",
  {
    nodeId: z.string().describe("The ID of the text node to modify"),
    fontSize: z.number().positive().describe("Font size in pixels"),
  },
  async ({ nodeId, fontSize }) => {
    try {
      const result = await sendCommandToFigma("set_font_size", {
        nodeId,
        fontSize
      });
      const typedResult = result as { name: string, fontSize: number };
      return {
        content: [
          {
            type: "text",
            text: `Updated font size of node "${typedResult.name}" to ${typedResult.fontSize}px`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting font size: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Set Font Weight Tool
server.tool(
  "set_font_weight",
  "Set the font weight of a text node in Figma",
  {
    nodeId: z.string().describe("The ID of the text node to modify"),
    weight: z.number().describe("Font weight (100, 200, 300, 400, 500, 600, 700, 800, 900)"),
  },
  async ({ nodeId, weight }) => {
    try {
      const result = await sendCommandToFigma("set_font_weight", {
        nodeId,
        weight
      });
      const typedResult = result as { name: string, fontName: { family: string, style: string }, weight: number };
      return {
        content: [
          {
            type: "text",
            text: `Updated font weight of node "${typedResult.name}" to ${typedResult.weight} (${typedResult.fontName.style})`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting font weight: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Set Letter Spacing Tool
server.tool(
  "set_letter_spacing",
  "Set the letter spacing of a text node in Figma",
  {
    nodeId: z.string().describe("The ID of the text node to modify"),
    letterSpacing: z.number().describe("Letter spacing value"),
    unit: z.enum(["PIXELS", "PERCENT"]).optional().describe("Unit type (PIXELS or PERCENT)"),
  },
  async ({ nodeId, letterSpacing, unit }) => {
    try {
      const result = await sendCommandToFigma("set_letter_spacing", {
        nodeId,
        letterSpacing,
        unit: unit || "PIXELS"
      });
      const typedResult = result as { name: string, letterSpacing: { value: number, unit: string } };
      return {
        content: [
          {
            type: "text",
            text: `Updated letter spacing of node "${typedResult.name}" to ${typedResult.letterSpacing.value} ${typedResult.letterSpacing.unit}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting letter spacing: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Set Line Height Tool
/**
 * Set Line Height Tool
 *
 * Sets the line height of a text node in Figma.
 *
 * @param {object} params - Parameters for setting line height.
 * @param {string} params.nodeId - The ID of the text node to modify.
 * @param {number} params.lineHeight - Line height value.
 * @param {string} [params.unit] - Unit type ("PIXELS", "PERCENT", or "AUTO").
 *
 * @returns {Promise<object>} An object containing the node's name and updated line height.
 *
 * @throws Will throw an error if the line height cannot be set.
 *
 * @example
 * await server.tool("set_line_height", { nodeId: "123", lineHeight: 20, unit: "PIXELS" });
 */
server.tool(
  "set_line_height",
  "Set the line height of a text node in Figma",
  {
    nodeId: z.string().describe("The ID of the text node to modify"),
    lineHeight: z.number().describe("Line height value"),
    unit: z.enum(["PIXELS", "PERCENT", "AUTO"]).optional().describe("Unit type (PIXELS, PERCENT, or AUTO)"),
  },
  async ({ nodeId, lineHeight, unit }) => {
    try {
      const result = await sendCommandToFigma("set_line_height", {
        nodeId,
        lineHeight,
        unit: unit || "PIXELS"
      });
      const typedResult = result as { name: string, lineHeight: { value: number, unit: string } };
      return {
        content: [
          {
            type: "text",
            text: `Updated line height of node "${typedResult.name}" to ${typedResult.lineHeight.value} ${typedResult.lineHeight.unit}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting line height: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Set Paragraph Spacing Tool
/**
 * Set Paragraph Spacing Tool
 *
 * Sets the paragraph spacing of a text node in Figma.
 *
 * @param {object} params - Parameters for setting paragraph spacing.
 * @param {string} params.nodeId - The ID of the text node to modify.
 * @param {number} params.paragraphSpacing - Paragraph spacing value in pixels.
 *
 * @returns {Promise<object>} An object containing the node's name and updated paragraph spacing.
 *
 * @throws Will throw an error if the paragraph spacing cannot be set.
 *
 * @example
 * await server.tool("set_paragraph_spacing", { nodeId: "123", paragraphSpacing: 10 });
 */
server.tool(
  "set_paragraph_spacing",
  "Set the paragraph spacing of a text node in Figma",
  {
    nodeId: z.string().describe("The ID of the text node to modify"),
    paragraphSpacing: z.number().describe("Paragraph spacing value in pixels"),
  },
  async ({ nodeId, paragraphSpacing }) => {
    try {
      const result = await sendCommandToFigma("set_paragraph_spacing", {
        nodeId,
        paragraphSpacing
      });
      const typedResult = result as { name: string, paragraphSpacing: number };
      return {
        content: [
          {
            type: "text",
            text: `Updated paragraph spacing of node "${typedResult.name}" to ${typedResult.paragraphSpacing}px`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting paragraph spacing: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Set Text Case Tool
server.tool(
  "set_text_case",
  "Set the text case of a text node in Figma",
  {
    nodeId: z.string().describe("The ID of the text node to modify"),
    textCase: z.enum(["ORIGINAL", "UPPER", "LOWER", "TITLE"]).describe("Text case type"),
  },
  async ({ nodeId, textCase }) => {
    try {
      const result = await sendCommandToFigma("set_text_case", {
        nodeId,
        textCase
      });
      const typedResult = result as { name: string, textCase: string };
      return {
        content: [
          {
            type: "text",
            text: `Updated text case of node "${typedResult.name}" to ${typedResult.textCase}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting text case: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Set Text Decoration Tool
 *
 * Sets the text decoration of a text node in Figma.
 *
 * @param {object} params - Parameters for setting text decoration.
 * @param {string} params.nodeId - The ID of the text node to modify.
 * @param {string} params.textDecoration - Text decoration type ("NONE", "UNDERLINE", or "STRIKETHROUGH").
 *
 * @returns {Promise<object>} An object containing the node's name and applied text decoration.
 *
 * @throws Will throw an error if the node is not found or does not support text decoration.
 *
 * @example
 * await server.tool("set_text_decoration", { nodeId: "123", textDecoration: "UNDERLINE" });
 */
server.tool(
  "set_text_decoration",
  "Set the text decoration of a text node in Figma",
  {
    nodeId: z.string().describe("The ID of the text node to modify"),
    textDecoration: z.enum(["NONE", "UNDERLINE", "STRIKETHROUGH"]).describe("Text decoration type"),
  },
  async ({ nodeId, textDecoration }) => {
    try {
      const result = await sendCommandToFigma("set_text_decoration", {
        nodeId,
        textDecoration
      });
      const typedResult = result as { name: string, textDecoration: string };
      return {
        content: [
          {
            type: "text",
            text: `Updated text decoration of node "${typedResult.name}" to ${typedResult.textDecoration}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting text decoration: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Get Styled Text Segments Tool
 *
 * Retrieves text segments with specific styling in a text node.
 *
 * @param {object} params - Parameters for getting styled text segments.
 * @param {string} params.nodeId - The ID of the text node to analyze.
 * @param {string} params.property - The style property to analyze segments by.
 *   One of: "fillStyleId", "fontName", "fontSize", "textCase", "textDecoration",
 *   "textStyleId", "fills", "letterSpacing", "lineHeight", "fontWeight".
 *
 * @returns {Promise<object>} An object containing the styled text segments.
 *
 * @throws Will throw an error if the node is not found or does not support the property.
 *
 * @example
 * await server.tool("get_styled_text_segments", { nodeId: "123", property: "fontName" });
 */
server.tool(
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
      const result = await sendCommandToFigma("get_styled_text_segments", {
        nodeId,
        property
      });
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting styled text segments: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Load Font Async Tool
 *
 * Loads a font asynchronously in Figma.
 *
 * @param {object} params - Parameters for loading font.
 * @param {string} params.family - Font family name.
 * @param {string} [params.style="Regular"] - Font style (e.g., "Regular", "Bold", "Italic").
 *
 * @returns {Promise<object>} An object indicating success and message.
 *
 * @throws Will throw an error if the font cannot be loaded.
 *
 * @example
 * await server.tool("load_font_async", { family: "Roboto", style: "Bold" });
 */
server.tool(
  "load_font_async",
  "Load a font asynchronously in Figma",
  {
    family: z.string().describe("Font family name"),
    style: z.string().optional().describe("Font style (e.g., 'Regular', 'Bold', 'Italic')"),
  },
  async ({ family, style }) => {
    try {
      const result = await sendCommandToFigma("load_font_async", {
        family,
        style: style || "Regular"
      });
      const typedResult = result as { success: boolean, family: string, style: string, message: string };
      return {
        content: [
          {
            type: "text",
            text: typedResult.message || `Loaded font ${family} ${style || "Regular"}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error loading font: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Get Remote Components Tool
server.tool(
  "get_remote_components",
  "Get available components from team libraries in Figma",
  {},
  async () => {
    try {
      const result = await sendCommandToFigma("get_remote_components");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting remote components: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Design Strategy Prompt
 *
 * Provides best practices for working with Figma designs.
 *
 * @param {object} extra - Additional parameters (unused).
 *
 * @returns {object} An object containing messages and description for the design strategy.
 *
 * @example
 * const strategy = await server.prompt("design_strategy");
 * console.log(strategy);
 */
server.prompt(
  "design_strategy",
  "Best practices for working with Figma designs",
  (extra) => {
    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: `When working with Figma designs, follow these best practices:

1. Start with Document Structure:
   - First use get_document_info() to understand the current document
   - Plan your layout hierarchy before creating elements
   - Create a main container frame for each screen/section

2. Naming Conventions:
   - Use descriptive, semantic names for all elements
   - Follow a consistent naming pattern (e.g., "Login Screen", "Logo Container", "Email Input")
   - Group related elements with meaningful names

3. Layout Hierarchy:
   - Create parent frames first, then add child elements
   - For forms/login screens:
     * Start with the main screen container frame
     * Create a logo container at the top
     * Group input fields in their own containers
     * Place action buttons (login, submit) after inputs
     * Add secondary elements (forgot password, signup links) last

4. Input Fields Structure:
   - Create a container frame for each input field
   - Include a label text above or inside the input
   - Group related inputs (e.g., username/password) together

5. Element Creation:
   - Use create_frame() for containers and input fields
   - Use create_text() for labels, buttons text, and links
   - Set appropriate colors and styles:
     * Use fillColor for backgrounds
     * Use strokeColor for borders
     * Set proper fontWeight for different text elements

6. Modifying existing elements:
  - use set_text_content() to modify text content.

7. Visual Hierarchy:
   - Position elements in logical reading order (top to bottom)
   - Maintain consistent spacing between elements
   - Use appropriate font sizes for different text types:
     * Larger for headings/welcome text
     * Medium for input labels
     * Standard for button text
     * Smaller for helper text/links

8. Best Practices:
   - Verify each creation with get_node_info()
   - Use parentId to maintain proper hierarchy
   - Group related elements together in frames
   - Keep consistent spacing and alignment

Example Login Screen Structure:
- Login Screen (main frame)
  - Logo Container (frame)
    - Logo (image/text)
  - Welcome Text (text)
  - Input Container (frame)
    - Email Input (frame)
      - Email Label (text)
      - Email Field (frame)
    - Password Input (frame)
      - Password Label (text)
      - Password Field (frame)
  - Login Button (frame)
    - Button Text (text)
  - Helper Links (frame)
    - Forgot Password (text)
    - Don't have account (text)`,
          },
        },
      ],
      description: "Best practices for working with Figma designs",
    };
  }
);

server.prompt(
  "read_design_strategy",
  "Best practices for reading Figma designs",
  (extra) => {
    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: `When reading Figma designs, follow these best practices:

1. Start with selection:
   - First use get_selection() to understand the current selection
   - If no selection ask user to select single or multiple nodes

2. Get node infos of the selected nodes:
   - Use get_nodes_info() to get the information of the selected nodes
   - If no selection ask user to select single or multiple nodes
`,
          },
        },
      ],
      description: "Best practices for reading Figma designs",
    };
  }
);

// Text Node Scanning Tool
server.tool(
  "scan_text_nodes",
  "Scan all text nodes in the selected Figma node",
  {
    nodeId: z.string().describe("ID of the node to scan"),
  },
  async ({ nodeId }) => {
    try {
      // Initial response to indicate we're starting the process
      const initialStatus = {
        type: "text" as const,
        text: "Starting text node scanning. This may take a moment for large designs...",
      };

      // Use the plugin's scan_text_nodes function with chunking flag
      const result = await sendCommandToFigma("scan_text_nodes", {
        nodeId,
        useChunking: true,  // Enable chunking on the plugin side
        chunkSize: 10       // Process 10 nodes at a time
      });

      // If the result indicates chunking was used, format the response accordingly
      if (result && typeof result === 'object' && 'chunks' in result) {
        const typedResult = result as {
          success: boolean,
          totalNodes: number,
          processedNodes: number,
          chunks: number,
          textNodes: Array<any>
        };

        const summaryText = `
        Scan completed:
        - Found ${typedResult.totalNodes} text nodes
        - Processed in ${typedResult.chunks} chunks
        `;

        return {
          content: [
            initialStatus,
            {
              type: "text" as const,
              text: summaryText
            },
            {
              type: "text" as const,
              text: JSON.stringify(typedResult.textNodes, null, 2)
            }
          ],
        };
      }

      // If chunking wasn't used or wasn't reported in the result format, return the result as is
      return {
        content: [
          initialStatus,
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error scanning text nodes: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Text Replacement Strategy Prompt
server.prompt(
  "text_replacement_strategy",
  "Systematic approach for replacing text in Figma designs",
  (extra) => {
    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: `# Intelligent Text Replacement Strategy

## 1. Analyze Design & Identify Structure
- Scan text nodes to understand the overall structure of the design
- Use AI pattern recognition to identify logical groupings:
  * Tables (rows, columns, headers, cells)
  * Lists (items, headers, nested lists)
  * Card groups (similar cards with recurring text fields)
  * Forms (labels, input fields, validation text)
  * Navigation (menu items, breadcrumbs)
\`\`\`
scan_text_nodes(nodeId: "node-id")
get_node_info(nodeId: "node-id")  // optional
\`\`\`

## 2. Strategic Chunking for Complex Designs
- Divide replacement tasks into logical content chunks based on design structure
- Use one of these chunking strategies that best fits the design:
  * **Structural Chunking**: Table rows/columns, list sections, card groups
  * **Spatial Chunking**: Top-to-bottom, left-to-right in screen areas
  * **Semantic Chunking**: Content related to the same topic or functionality
  * **Component-Based Chunking**: Process similar component instances together

## 3. Progressive Replacement with Verification
- Create a safe copy of the node for text replacement
- Replace text chunk by chunk with continuous progress updates
- After each chunk is processed:
  * Export that section as a small, manageable image
  * Verify text fits properly and maintain design integrity
  * Fix issues before proceeding to the next chunk

\`\`\`
// Clone the node to create a safe copy
clone_node(nodeId: "selected-node-id", x: [new-x], y: [new-y])

// Replace text chunk by chunk
set_multiple_text_contents(
  nodeId: "parent-node-id", 
  text: [
    { nodeId: "node-id-1", text: "New text 1" },
    // More nodes in this chunk...
  ]
)

// Verify chunk with small, targeted image exports
export_node_as_image(nodeId: "chunk-node-id", format: "PNG", scale: 0.5)
\`\`\`

## 4. Intelligent Handling for Table Data
- For tabular content:
  * Process one row or column at a time
  * Maintain alignment and spacing between cells
  * Consider conditional formatting based on cell content
  * Preserve header/data relationships

## 5. Smart Text Adaptation
- Adaptively handle text based on container constraints:
  * Auto-detect space constraints and adjust text length
  * Apply line breaks at appropriate linguistic points
  * Maintain text hierarchy and emphasis
  * Consider font scaling for critical content that must fit

## 6. Progressive Feedback Loop
- Establish a continuous feedback loop during replacement:
  * Real-time progress updates (0-100%)
  * Small image exports after each chunk for verification
  * Issues identified early and resolved incrementally
  * Quick adjustments applied to subsequent chunks

## 7. Final Verification & Context-Aware QA
- After all chunks are processed:
  * Export the entire design at reduced scale for final verification
  * Check for cross-chunk consistency issues
  * Verify proper text flow between different sections
  * Ensure design harmony across the full composition

## 8. Chunk-Specific Export Scale Guidelines
- Scale exports appropriately based on chunk size:
  * Small chunks (1-5 elements): scale 1.0
  * Medium chunks (6-20 elements): scale 0.7
  * Large chunks (21-50 elements): scale 0.5
  * Very large chunks (50+ elements): scale 0.3
  * Full design verification: scale 0.2

## Sample Chunking Strategy for Common Design Types

### Tables
- Process by logical rows (5-10 rows per chunk)
- Alternative: Process by column for columnar analysis
- Tip: Always include header row in first chunk for reference

### Card Lists
- Group 3-5 similar cards per chunk
- Process entire cards to maintain internal consistency
- Verify text-to-image ratio within cards after each chunk

### Forms
- Group related fields (e.g., "Personal Information", "Payment Details")
- Process labels and input fields together
- Ensure validation messages and hints are updated with their fields

### Navigation & Menus
- Process hierarchical levels together (main menu, submenu)
- Respect information architecture relationships
- Verify menu fit and alignment after replacement

## Best Practices
- **Preserve Design Intent**: Always prioritize design integrity
- **Structural Consistency**: Maintain alignment, spacing, and hierarchy
- **Visual Feedback**: Verify each chunk visually before proceeding
- **Incremental Improvement**: Learn from each chunk to improve subsequent ones
- **Balance Automation & Control**: Let AI handle repetitive replacements but maintain oversight
- **Respect Content Relationships**: Keep related content consistent across chunks

Remember that text is never just text—it's a core design element that must work harmoniously with the overall composition. This chunk-based strategy allows you to methodically transform text while maintaining design integrity.`,
          },
        },
      ],
      description: "Systematic approach for replacing text in Figma designs",
    };
  }
);

/**
 * Set Multiple Text Contents Tool
 *
 * Sets multiple text contents in parallel within a node.
 *
 * @param {object} params - Parameters for setting multiple text contents.
 * @param {string} params.nodeId - The ID of the node containing the text nodes to replace.
 * @param {Array<{nodeId: string, text: string}>} params.text - Array of text node IDs and their replacement texts.
 *
 * @returns {Promise<object>} An object indicating the progress and results of the text replacement.
 *
 * @throws Will throw an error if the text replacement fails.
 *
 * @example
 * await server.tool("set_multiple_text_contents", {
 *   nodeId: "parent-node-id",
 *   text: [
 *     { nodeId: "text-node-1", text: "New text 1" },
 *     { nodeId: "text-node-2", text: "New text 2" }
 *   ]
 * });
 */
server.tool(
  "set_multiple_text_contents",
  "Set multiple text contents parallelly in a node",
  {
    nodeId: z
      .string()
      .describe("The ID of the node containing the text nodes to replace"),
    text: z
      .array(
        z.object({
          nodeId: z.string().describe("The ID of the text node"),
          text: z.string().describe("The replacement text"),
        })
      )
      .describe("Array of text node IDs and their replacement texts"),
  },
  async ({ nodeId, text }, extra) => {
    try {
      if (!text || text.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No text provided",
            },
          ],
        };
      }

      // Initial response to indicate we're starting the process
      const initialStatus = {
        type: "text" as const,
        text: `Starting text replacement for ${text.length} nodes. This will be processed in batches of 5...`,
      };

      // Track overall progress
      let totalProcessed = 0;
      const totalToProcess = text.length;

      // Use the plugin's set_multiple_text_contents function with chunking
      const result = await sendCommandToFigma("set_multiple_text_contents", {
        nodeId,
        text,
      });

      // Cast the result to a specific type to work with it safely
      interface TextReplaceResult {
        success: boolean;
        nodeId: string;
        replacementsApplied?: number;
        replacementsFailed?: number;
        totalReplacements?: number;
        completedInChunks?: number;
        results?: Array<{
          success: boolean;
          nodeId: string;
          error?: string;
          originalText?: string;
          translatedText?: string;
        }>;
      }

      const typedResult = result as TextReplaceResult;

      // Format the results for display
      const success = typedResult.replacementsApplied && typedResult.replacementsApplied > 0;
      const progressText = `
      Text replacement completed:
      - ${typedResult.replacementsApplied || 0} of ${totalToProcess} successfully updated
      - ${typedResult.replacementsFailed || 0} failed
      - Processed in ${typedResult.completedInChunks || 1} batches
      `;

      // Detailed results
      const detailedResults = typedResult.results || [];
      const failedResults = detailedResults.filter(item => !item.success);

      // Create the detailed part of the response
      let detailedResponse = "";
      if (failedResults.length > 0) {
        detailedResponse = `\n\nNodes that failed:\n${failedResults.map(item =>
          `- ${item.nodeId}: ${item.error || "Unknown error"}`
        ).join('\n')}`;
      }

      return {
        content: [
          initialStatus,
          {
            type: "text" as const,
            text: progressText + detailedResponse,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting multiple text contents: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Set Effects Tool
 *
 * Sets the visual effects of a node in Figma.
 *
 * @param {object} params - Parameters for setting effects.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {Array<object>} params.effects - Array of effects to apply.
 *
 * @returns {Promise<object>} An object containing the node's name and applied effects.
 *
 * @throws Will throw an error if the effects cannot be set.
 *
 * @example
 * await server.tool("set_effects", {
 *   nodeId: "123",
 *   effects: [
 *     { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.5 }, offset: { x: 0, y: 2 }, radius: 4 }
 *   ]
 * });
 */
server.tool(
  "set_effects",
  "Set the visual effects of a node in Figma",
  {
    nodeId: z.string().describe("The ID of the node to modify"),
    effects: z.array(
      z.object({
        type: z.enum(["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"]).describe("Effect type"),
        color: z.object({
          r: z.number().min(0).max(1).describe("Red (0-1)"),
          g: z.number().min(0).max(1).describe("Green (0-1)"),
          b: z.number().min(0).max(1).describe("Blue (0-1)"),
          a: z.number().min(0).max(1).describe("Alpha (0-1)")
        }).optional().describe("Effect color (for shadows)"),
        offset: z.object({
          x: z.number().describe("X offset"),
          y: z.number().describe("Y offset")
        }).optional().describe("Offset (for shadows)"),
        radius: z.number().optional().describe("Effect radius"),
        spread: z.number().optional().describe("Shadow spread (for shadows)"),
        visible: z.boolean().optional().describe("Whether the effect is visible"),
        blendMode: z.string().optional().describe("Blend mode")
      })
    ).describe("Array of effects to apply")
  },
  async ({ nodeId, effects }) => {
    try {
      const result = await sendCommandToFigma("set_effects", {
        nodeId,
        effects
      });
      
      const typedResult = result as { name: string, effects: any[] };
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully applied ${effects.length} effect(s) to node "${typedResult.name}"`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting effects: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Set Effect Style ID Tool
 *
 * Applies an effect style to a node in Figma.
 *
 * @param {object} params - Parameters for setting effect style.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {string} params.effectStyleId - The ID of the effect style to apply.
 *
 * @returns {Promise<object>} An object containing the node's name and applied effect style ID.
 *
 * @throws Will throw an error if the effect style cannot be applied.
 *
 * @example
 * await server.tool("set_effect_style_id", { nodeId: "123", effectStyleId: "abc123" });
 */
server.tool(
  "set_effect_style_id",
  "Apply an effect style to a node in Figma",
  {
    nodeId: z.string().describe("The ID of the node to modify"),
    effectStyleId: z.string().describe("The ID of the effect style to apply")
  },
  async ({ nodeId, effectStyleId }) => {
    try {
      const result = await sendCommandToFigma("set_effect_style_id", {
        nodeId,
        effectStyleId
      });
      
      const typedResult = result as { name: string, effectStyleId: string };
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully applied effect style to node "${typedResult.name}"`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error setting effect style: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Group Nodes Tool
server.tool(
  "group_nodes",
  "Group nodes in Figma",
  {
    nodeIds: z.array(z.string()).describe("Array of IDs of the nodes to group"),
    name: z.string().optional().describe("Optional name for the group")
  },
  async ({ nodeIds, name }) => {
    try {
      const result = await sendCommandToFigma("group_nodes", { 
        nodeIds, 
        name 
      });
      
      const typedResult = result as { 
        id: string, 
        name: string, 
        type: string, 
        children: Array<{ id: string, name: string, type: string }> 
      };
      
      return {
        content: [
          {
            type: "text",
            text: `Nodes successfully grouped into "${typedResult.name}" with ID: ${typedResult.id}. The group contains ${typedResult.children.length} elements.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error grouping nodes: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Ungroup Nodes Tool
 *
 * Ungroups nodes in Figma.
 *
 * @param {object} params - Parameters for ungrouping nodes.
 * @param {string} params.nodeId - ID of the node (group or frame) to ungroup.
 *
 * @returns {Promise<object>} An object containing the success status, count of ungrouped elements, and released items.
 *
 * @throws Will throw an error if the node cannot be ungrouped.
 *
 * @example
 * await server.tool("ungroup_nodes", { nodeId: "123" });
 */
server.tool(
  "ungroup_nodes",
  "Ungroup nodes in Figma",
  {
    nodeId: z.string().describe("ID of the node (group or frame) to ungroup"),
  },
  async ({ nodeId }) => {
    try {
      const result = await sendCommandToFigma("ungroup_nodes", { nodeId });
      
      const typedResult = result as { 
        success: boolean, 
        ungroupedCount: number, 
        items: Array<{ id: string, name: string, type: string }> 
      };
      
      return {
        content: [
          {
            type: "text",
            text: `Node successfully ungrouped. ${typedResult.ungroupedCount} elements were released.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error ungrouping node: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Flatten Node Tool
 *
 * Flattens a node in Figma (e.g., for boolean operations or converting to path).
 *
 * @param {object} params - Parameters for flattening a node.
 * @param {string} params.nodeId - ID of the node to flatten.
 *
 * @returns {Promise<object>} An object containing the new node's ID, name, and type.
 *
 * @throws Will throw an error if the node cannot be flattened.
 *
 * @example
 * await server.tool("flatten_node", { nodeId: "123" });
 */
server.tool(
  "flatten_node",
  "Flatten a node in Figma (e.g., for boolean operations or converting to path)",
  {
    nodeId: z.string().describe("ID of the node to flatten"),
  },
  async ({ nodeId }) => {
    try {
      const result = await sendCommandToFigma("flatten_node", { nodeId });
      
      const typedResult = result as { 
        id: string, 
        name: string, 
        type: string 
      };
      
      return {
        content: [
          {
            type: "text",
            text: `Node "${typedResult.name}" flattened successfully. The new node has ID: ${typedResult.id} and is of type ${typedResult.type}.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error flattening node: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Insert Child Tool
 *
 * Inserts a child node inside a parent node in Figma.
 *
 * @param {object} params - Parameters for inserting a child node.
 * @param {string} params.parentId - ID of the parent node where the child will be inserted.
 * @param {string} params.childId - ID of the child node to insert.
 * @param {number} [params.index] - Optional index where to insert the child (if not specified, it will be added at the end).
 *
 * @returns {Promise<object>} An object containing the parent ID, child ID, index, and success status.
 *
 * @throws Will throw an error if the child node cannot be inserted.
 *
 * @example
 * await server.tool("insert_child", { parentId: "parent123", childId: "child456", index: 0 });
 */
server.tool(
  "insert_child",
  "Insert a child node inside a parent node in Figma",
  {
    parentId: z.string().describe("ID of the parent node where the child will be inserted"),
    childId: z.string().describe("ID of the child node to insert"),
    index: z.number().optional().describe("Optional index where to insert the child (if not specified, it will be added at the end)")
  },
  async ({ parentId, childId, index }) => {
    try {
      const result = await sendCommandToFigma("insert_child", { 
        parentId, 
        childId,
        index 
      });
      
      const typedResult = result as { 
        parentId: string,
        childId: string,
        index: number,
        success: boolean
      };
      
      return {
        content: [
          {
            type: "text",
            text: `Child node with ID: ${typedResult.childId} successfully inserted into parent node with ID: ${typedResult.parentId}${index !== undefined ? ` at position ${typedResult.index}` : ''}.`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error inserting child node: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

/**
 * Layer Renaming Tool
 *
 * Renames a specified Figma node.
 *
 * @param nodeId - The unique identifier of the Figma node to rename.
 * @param newName - The new name to assign to the node.
 * @param setAutoRename - (Optional) If set to true, preserves the automatic renaming behavior 
 *                        for TextNodes (i.e. Figma's auto-update of text formatting when changes occur).
 *
 * Example Usage:
 *   - To rename a node while maintaining its TextNode auto-renaming, pass true for setAutoRename.
 */
/**
 * Rename Layer Tool
 *
 * Renames a specified Figma node.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string} params.nodeId - The ID of the node to rename.
 * @param {string} params.newName - The new name for the node.
 * @param {boolean} [params.setAutoRename] - Whether to preserve TextNode autoRename.
 *
 * @returns {Promise<object>} An object containing the result of the rename operation.
 *
 * @example
 * await server.tool("rename_layer", { nodeId: "123", newName: "New Name", setAutoRename: true });
 */
server.tool(
  "rename_layer",
  "Rename a single node with optional TextNode autoRename",
  {
    nodeId: z.string().describe("The ID of the node to rename"),
    newName: z.string().describe("The new name for the node"),
    setAutoRename: z.boolean().optional().describe("Whether to preserve TextNode autoRename")
  },
  async ({ nodeId, newName, setAutoRename }: { nodeId: string; newName: string; setAutoRename?: boolean }) => {
    const result = await sendCommandToFigma("rename_layer", { nodeId, newName, setAutoRename });
    return {
      content: [
        { type: "text", text: JSON.stringify(result) }
      ]
    };
  }
);
/**
 * Rename Layers Tool
 *
 * Renames multiple Figma layers either by assigning a new base name or through a
 * regex pattern-based replacement.
 *
 * - If only new_name is provided, all specified layers will be renamed to that new base name.
 * - If match_pattern and replace_with are provided, the tool will replace the matched part
 *   in each layer's name with the provided replacement text.
 *
 * @param layer_ids - An array of layer IDs to be renamed.
 * @param new_name - The new base name or naming pattern to apply to the layers.
 * @param match_pattern - (Optional) A regex pattern to identify parts of the existing names.
 * @param replace_with - (Optional) The text to replace the matched pattern with.
 *
 * Example Usage:
 *   // Simple renaming:
 *   rename_layers({ layer_ids: ['id1', 'id2'], new_name: "NewLayer" });
 *
 *   // Pattern-based renaming:
 *   rename_layers({ layer_ids: ['id1', 'id2'], new_name: "Layer_$1", match_pattern: "Old(.*)", replace_with: "$1" });
 */
/**
 * Rename Layers Tool
 *
 * Renames multiple Figma layers either by assigning a new base name or through a
 * regex pattern-based replacement.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string[]} params.layer_ids - IDs of layers to rename.
 * @param {string} params.new_name - New base name or pattern including tokens.
 * @param {string} [params.match_pattern] - Regex to match in existing name.
 * @param {string} [params.replace_with] - Text to replace matched pattern.
 *
 * @returns {Promise<object>} An object containing the result of the rename operation.
 *
 * @example
 * await server.tool("rename_layers", { layer_ids: ["id1", "id2"], new_name: "NewName" });
 */
/**
 * Rename Layers Tool
 *
 * Renames multiple Figma layers either by assigning a new base name or through a
 * regex pattern-based replacement.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string[]} params.layer_ids - IDs of layers to rename.
 * @param {string} params.new_name - New base name or pattern including tokens.
 * @param {string} [params.match_pattern] - Regex to match in existing name.
 * @param {string} [params.replace_with] - Text to replace matched pattern.
 *
 * @returns {Promise<object>} An object containing the result of the rename operation.
 *
 * @example
 * await server.tool("rename_layers", { layer_ids: ["id1", "id2"], new_name: "NewName" });
 */
server.tool(
    "rename_layers",
    "Rename specified layers by exact name or pattern replace",
    {
      layer_ids: z.array(z.string()).describe("IDs of layers to rename"),
      new_name: z.string().describe("New base name or pattern including tokens"),
      match_pattern: z.string().optional().describe("Regex to match in existing name"),
      replace_with: z.string().optional().describe("Text to replace matched pattern")
    },
    async ({ layer_ids, new_name, match_pattern, replace_with }) => {
      const result = await sendCommandToFigma("rename_layers", { layer_ids, new_name, match_pattern, replace_with });
      return {
        content: [
          { type: "text", text: JSON.stringify(result) }
        ]
      };
    }
  );

/**
 * Rename Multiple Layers with Distinct Names
 *
 * Renames a collection of layers by applying a unique new name to each layer.
 * Accepts two arrays of equal length—one with layer IDs and one with new names.
 * Calls rename_layer for each layer and aggregates results.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string[]} params.layer_ids - Array of layer IDs to rename.
 * @param {string[]} params.new_names - Array of new names corresponding to each layer ID.
 *
 * @returns {Promise<object>} Object with success status and array of results.
 *
 * @throws Will throw an error if layer_ids or new_names are not arrays or lengths differ.
 *
 * @example
 * const result = await rename_multiple({
 *   layer_ids: ['id1', 'id2'],
 *   new_names: ['New Name for id1', 'New Name for id2']
 * });
 * console.log(result);
 */
/**
 * Rename Multiple Layers Tool
 *
 * Renames multiple layers with distinct new names.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string[]} params.layer_ids - Array of layer IDs to rename.
 * @param {string[]} params.new_names - Array of new names corresponding to each layer ID.
 *
 * @returns {Promise<object>} An object containing the results of the rename operations.
 *
 * @throws Will throw an error if layer_ids and new_names are not arrays or lengths differ.
 *
 * @example
 * await server.tool("rename_multiple", {
 *   layer_ids: ["id1", "id2"],
 *   new_names: ["New Name 1", "New Name 2"]
 * });
 */
/**
 * Rename Multiple Layers Tool
 *
 * Renames multiple layers with distinct new names.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string[]} params.layer_ids - Array of layer IDs to rename.
 * @param {string[]} params.new_names - Array of new names corresponding to each layer ID.
 *
 * @returns {Promise<object>} An object containing the results of the rename operations.
 *
 * @throws Will throw an error if layer_ids and new_names are not arrays or lengths differ.
 *
 * @example
 * await server.tool("rename_multiple", {
 *   layer_ids: ["id1", "id2"],
 *   new_names: ["New Name 1", "New Name 2"]
 * });
 */
server.tool(
  "rename_multiple",
  "Rename multiple layers with distinct new names",
  {
    layer_ids: z.array(z.string()).describe("Array of layer IDs to rename"),
    new_names: z.array(z.string()).describe("Array of new names corresponding to each layer ID")
  },
  async ({ layer_ids, new_names }) => {
    if (!Array.isArray(layer_ids) || !Array.isArray(new_names)) {
      return { content: [{ type: "text", text: "layer_ids and new_names must be arrays" }] };
    }
    if (layer_ids.length !== new_names.length) {
      return { content: [{ type: "text", text: "layer_ids and new_names must be of equal length" }] };
    }

    const results = [];
    for (let i = 0; i < layer_ids.length; i++) {
      const nodeId = layer_ids[i];
      const newName = new_names[i];
      try {
        const result = await sendCommandToFigma("rename_layer", { nodeId, newName });
        results.push({ nodeId, status: "renamed", result });
      } catch (error) {
        results.push({ nodeId, status: "error", error: error instanceof Error ? error.message : String(error) });
      }
    }
    return {
      content: [
        { type: "text", text: JSON.stringify(results, null, 2) }
      ]
    };
  }
);
/**
 * AI-Powered Rename Layers Tool
 *
 * Leverages artificial intelligence to intelligently rename multiple Figma layers.
 *
 * Parameters:
 *   - layer_ids: An array of Figma layer IDs to be renamed.
 *   - context_prompt: (Optional) A textual prompt providing context or guidelines for the AI renaming process.
 *                     If omitted, the tool relies on default AI naming behavior.
 *
 * The tool sends the provided parameters to Figma and returns the AI-generated renaming results.
 *
 * Example Usage:
 *   ai_rename_layers({
 *     layer_ids: ['id1', 'id2'],
 *     context_prompt: "Rename these layers according to our branding guidelines."
 *   });
 */
/**
 * AI-Powered Rename Layers Tool
 *
 * Leverages artificial intelligence to intelligently rename multiple Figma layers.
 *
 * @param {object} params - Parameters for AI renaming.
 * @param {string[]} params.layer_ids - IDs of layers to rename.
 * @param {string} [params.context_prompt] - Optional prompt for AI renaming.
 *
 * @returns {Promise<object>} An object containing the AI-generated renaming results.
 *
 * @example
 * await server.tool("ai_rename_layers", {
 *   layer_ids: ["id1", "id2"],
 *   context_prompt: "Rename these layers according to our branding guidelines."
 * });
 */
/**
 * AI-Powered Rename Layers Tool
 *
 * Leverages artificial intelligence to intelligently rename multiple Figma layers.
 *
 * @param {object} params - Parameters for AI renaming.
 * @param {string[]} params.layer_ids - IDs of layers to rename.
 * @param {string} [params.context_prompt] - Optional prompt for AI renaming.
 *
 * @returns {Promise<object>} An object containing the AI-generated renaming results.
 *
 * @example
 * await server.tool("ai_rename_layers", {
 *   layer_ids: ["id1", "id2"],
 *   context_prompt: "Rename these layers according to our branding guidelines."
 * });
 */
server.tool(
  "ai_rename_layers",
  "AI-powered rename of specified layers",
  {
    layer_ids: z.array(z.string()).describe("IDs of layers to rename"),
    context_prompt: z.string().optional().describe("Prompt for AI renaming")
  },
  async ({ layer_ids, context_prompt }) => {
    const result = await sendCommandToFigma("ai_rename_layers", { layer_ids, context_prompt });
    return {
      content: [
        { type: "text", text: JSON.stringify(result) }
      ]
    };
  }
);

// Define command types and parameters
type FigmaCommand =
  | "get_document_info"
  | "get_selection"
  | "get_node_info"
  | "create_rectangle"
  | "create_frame"
  | "create_text"
  | "create_ellipse"
  | "create_polygon"
  | "create_star"
  | "create_vector"
  | "create_line"
  | "set_fill_color"
  | "set_stroke_color"
  | "move_node"
  | "resize_node"
  | "delete_node"
  | "get_styles"
  | "get_local_components"
  | "get_team_components"
  | "create_component_instance"
  | "export_node_as_image"
  | "join"
  | "set_corner_radius"
  | "clone_node"
  | "set_text_content"
  | "scan_text_nodes"
  | "set_multiple_text_contents"
  | "set_auto_layout"
  | "set_auto_layout_resizing"
  | "set_font_name"
  | "set_font_size"
  | "set_font_weight"
  | "set_letter_spacing"
  | "set_line_height"
  | "set_paragraph_spacing"
  | "set_text_case"
  | "set_text_decoration"
  | "get_styled_text_segments"
  | "load_font_async"
  | "get_remote_components"
  | "set_effects"
  | "set_effect_style_id"
  | "group_nodes"
  | "ungroup_nodes"
  | "flatten_node"
  | "insert_child"
  | "rename_layer"
  | "rename_layers"
  | "ai_rename_layers";

// Helper function to process Figma node responses
/**
 * Processes and filters Figma node responses for client consumption
 * 
 * Sanitizes and formats node data by:
 * - Validating node structure and required properties
 * - Logging processed node details for debugging
 * - Filtering sensitive or internal properties
 * - Formatting position and dimension data
 *
 * Node Processing:
 * 1. Validates node has required ID property
 * 2. Extracts key properties (name, position, dimensions)
 * 3. Logs processing details at appropriate log levels
 * 4. Returns cleaned node data
 *
 * @param {unknown} result - Raw node data from Figma API
 * @returns {any} Processed node data with sensitive/internal data removed
 * 
 * @example
 * const cleanNode = processFigmaNodeResponse(rawNodeData);
 * console.log(cleanNode.name, cleanNode.id);
 */
function processFigmaNodeResponse(result: unknown): any {
  if (!result || typeof result !== "object") {
    return result;
  }

  // Check if this looks like a node response
  const resultObj = result as Record<string, unknown>;
  if ("id" in resultObj && typeof resultObj.id === "string") {
    // It appears to be a node response, log the details
    console.info(
      `Processed Figma node: ${resultObj.name || "Unknown"} (ID: ${resultObj.id
      })`
    );

    if ("x" in resultObj && "y" in resultObj) {
      console.debug(`Node position: (${resultObj.x}, ${resultObj.y})`);
    }

    if ("width" in resultObj && "height" in resultObj) {
      console.debug(`Node dimensions: ${resultObj.width}×${resultObj.height}`);
    }
  }

  return result;
}

/**
 * Connects and manages WebSocket connection to Figma plugin server
 * 
 * Handles the full WebSocket connection lifecycle including:
 * 1. Initial connection attempt
 * 2. Connection state management 
 * 3. Automatic reconnection with exponential backoff
 * 4. Error handling and recovery
 *
 * Connection States:
 * - CONNECTING: Initial connection attempt in progress
 * - OPEN: Successfully connected and ready for commands
 * - CLOSING: Connection is closing (will trigger reconnect)
 * - CLOSED: Connection lost (will trigger reconnect)
 *
 * Error Handling:
 * - Connection failures trigger reconnection with exponential backoff (1.5^n * base interval)
 * - Maximum backoff capped at 30 seconds
 * - Connection timeout after 10 seconds of no response
 * - All pending requests are rejected on disconnect
 * - Socket errors are logged and trigger reconnection
 *
 * @param {number} [port=defaultPort] - Port number to connect to, defaults to 3055
 * 
 * @throws Logs errors but handles them internally without throwing
 * 
 * @example
 * // Connect to default port
 * connectToFigma();
 * 
 * // Connect to specific port
 * connectToFigma(3000);
 */
function connectToFigma(port: number = defaultPort) {
  // If already connected, do nothing
  if (ws && ws.readyState === WebSocket.OPEN) {
    logger.info('Already connected to Figma');
    return;
  }

  // If connection is in progress (CONNECTING state), wait
  if (ws && ws.readyState === WebSocket.CONNECTING) {
    logger.info('Connection to Figma is already in progress');
    return;
  }

  // If there's an existing socket in a closing state, clean it up
  if (ws && (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED)) {
    ws.removeAllListeners();
    ws = null;
  }

  const wsUrl = serverUrl === 'localhost' ? `${WS_URL}:${port}` : WS_URL;
  logger.info(`Connecting to Figma socket server at ${wsUrl}...`);
  
  try {
    ws = new WebSocket(wsUrl);
    
    // Add connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws && ws.readyState === WebSocket.CONNECTING) {
        logger.error('Connection to Figma timed out');
        ws.terminate();
      }
    }, 10000); // 10 second connection timeout
    /**
     * WebSocket Event Handlers
     * 
     * Manages WebSocket lifecycle events:
     * 
     * Connection Events:
     * - open: Successfully connected
     * - close: Connection terminated
     * - error: Connection error occurred
     * 
     * Message Events:
     * - message: Received data from Figma
     * - progress: Command execution updates
     * 
     * Error Recovery:
     * - Automatic reconnection
     * - Command requeuing
     * - State restoration
     * 
     * State Management:
     * - Tracks connection status
     * - Maintains command queue
     * - Handles timeout cleanup
     */
    ws.on('open', () => {
      clearTimeout(connectionTimeout);
      logger.info('Connected to Figma socket server');
      // Reset channel on new connection
      currentChannel = null;
    });

    ws.on("message", (data: any) => {
      try {
        // Attempt to parse the incoming data as JSON.
        const json = JSON.parse(data) as {
          type?: string;
          id?: string;
          message: any;
          [key: string]: any;
        };

        // If the message type indicates a progress update, handle it separately.
        if (json.type === 'progress_update') {
          // Extract the progress data and request identifier.
          const progressData = json.message.data as CommandProgressUpdate;
          const requestId = json.id || '';

          if (requestId && pendingRequests.has(requestId)) {
            const request = pendingRequests.get(requestId)!;
            // Record current activity time.
            request.lastActivity = Date.now();

            // Clear previous timeout and set up a new one to extend activity if command is long-running.
            clearTimeout(request.timeout);
            request.timeout = setTimeout(() => {
              if (pendingRequests.has(requestId)) {
                logger.error(`Request ${requestId} timed out after extended period of inactivity`);
                pendingRequests.delete(requestId);
                request.reject(new Error('Request to Figma timed out'));
              }
            }, 60000); // 60-second timeout extension during activity

            // Log the progress update details.
            logger.info(`Progress update for ${progressData.commandType}: ${progressData.progress}% - ${progressData.message}`);

            // Optionally, you may resolve early if progress indicates 100% completion.
            if (progressData.status === 'completed' && progressData.progress === 100) {
              logger.info(`Operation ${progressData.commandType} completed, waiting for final result`);
            }
          }
          // Exit early after handling progress updates.
          return;
        }

        // For non-progress messages, treat as regular command responses.
        const myResponse = json.message;
        logger.debug(`Received message: ${JSON.stringify(myResponse)}`);

        // Check if this response corresponds to a pending request.
        if (myResponse.id && pendingRequests.has(myResponse.id) && myResponse.result !== undefined) {
          const request = pendingRequests.get(myResponse.id)!;
          // Clear the timeout for the request since we've received a response.
          clearTimeout(request.timeout);

          // If an error occurred in the response, log and reject the promise.
          if (myResponse.error) {
            logger.error(`Error from Figma: ${myResponse.error}`);
            request.reject(new Error(myResponse.error));
          } else {
            // Otherwise, resolve the request promise with the result.
            request.resolve(myResponse.result);
          }
          // Remove the pending request from the tracking map.
          pendingRequests.delete(myResponse.id);
        } else {
          // For broadcast messages or unassociated responses, log accordingly.
          logger.info(`Received broadcast message: ${JSON.stringify(myResponse)}`);
        }
      } catch (error) {
        // Log error details if JSON parsing or any processing fails.
        logger.error(`Error parsing message: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    ws.on('error', (error) => {
      // Log the WebSocket error detail to indicate an error occurred.
      logger.error(`Socket error: ${error}`);
      // Note: Do not attempt reconnection here; let the close event handle reconnection.
    });

    ws.on('close', (code, reason) => {
      // Clear the connection timeout in case it is still pending.
      clearTimeout(connectionTimeout);
      logger.info(`Disconnected from Figma socket server with code ${code} and reason: ${reason || 'No reason provided'}`);
      ws = null;

      // Reject all pending requests since the connection is lost.
      for (const [id, request] of pendingRequests.entries()) {
        clearTimeout(request.timeout);
        request.reject(new Error(`Connection closed with code ${code}: ${reason || 'No reason provided'}`));
        pendingRequests.delete(id);
      }

      // Calculate exponential backoff delay before attempting a reconnection.
      const backoff = Math.min(30000, reconnectInterval * Math.pow(1.5, Math.floor(Math.random() * 5))); // Max 30s
      logger.info(`Attempting to reconnect in ${backoff / 1000} seconds...`);
      setTimeout(() => connectToFigma(port), backoff);
    });
    
  } catch (error) {
    logger.error(`Failed to create WebSocket connection: ${error instanceof Error ? error.message : String(error)}`);
    // Attempt to reconnect after a delay
    setTimeout(() => connectToFigma(port), reconnectInterval);
  }
}

// Function to join a channel
/**
 * Joins a specific Figma communication channel.
 * 
 * Establishes a dedicated channel for communicating with the Figma plugin.
 * The channel is required for most commands except the initial join.
 *
 * @param {string} channelName - Name of the channel to join
 * @returns {Promise<void>} Resolves when channel is joined successfully
 * 
 * @throws {Error} If:
 * - Not connected to Figma
 * - Channel join fails
 * - Invalid channel name provided
 * 
 * @example
 * await joinChannel("my-design-doc");
 */
async function joinChannel(channelName: string): Promise<void> {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error("Not connected to Figma");
  }

  try {
    await sendCommandToFigma("join", { channel: channelName });
    currentChannel = channelName;
    logger.info(`Joined channel: ${channelName}`);
  } catch (error) {
    logger.error(`Failed to join channel: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
/**
 * Sends commands to Figma Plugin via WebSocket
 * 
 * Handles the full command lifecycle including:
 * 1. Connection validation and auto-reconnect
 * 2. Command queuing and execution
 * 3. Response handling and timeout management
 * 4. Progress tracking and updates
 * 
 * Command Flow:
 * 1. Validates connection state
 * 2. Verifies channel requirements
 * 3. Generates unique command ID
 * 4. Sets up timeout and tracking
 * 5. Sends command and awaits response
 * 
 * Error Handling:
 * - Auto-reconnects if disconnected
 * - Rejects on timeout (default 30s)
 * - Handles progress updates
 * - Cleans up on connection loss
 * 
 * @param {FigmaCommand} command - Command to execute
 * @param {unknown} params - Command parameters
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<unknown>} Command result
 * 
 * @throws {Error} When:
 * - Connection fails
 * - Command times out
 * - Channel requirements not met
 * 
 * @example
 * const result = await sendCommandToFigma("create_rectangle", {
 *   x: 100, y: 100, width: 200, height: 100
 * });
 */
function sendCommandToFigma(
  command: FigmaCommand,
  params: unknown = {},
  timeoutMs: number = 30000
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    // If not connected, try to connect first
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      connectToFigma();
      reject(new Error("Not connected to Figma. Attempting to connect..."));
      return;
    }

    // Check if we need a channel for this command
    const requiresChannel = command !== "join";
    if (requiresChannel && !currentChannel) {
      reject(new Error("Must join a channel before sending commands"));
      return;
    }

    const id = uuidv4();
    const request = {
      id,
      type: command === "join" ? "join" : "message",
      ...(command === "join"
        ? { channel: (params as any).channel }
        : { channel: currentChannel }),
      message: {
        id,
        command,
        params: {
          ...(params as any),
          commandId: id, // Include the command ID in params
        },
      },
    };

    // Set a timeout for the request. If no activity occurs within timeoutMs, the promise is rejected.
    const timeout = setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        logger.error(`Request ${id} to Figma timed out after ${timeoutMs / 1000} seconds`);
        reject(new Error('Request to Figma timed out'));
      }
    }, timeoutMs);

    // Store the request callbacks along with the timeout and current time to allow timeout management.
    pendingRequests.set(id, {
      resolve,
      reject,
      timeout,
      lastActivity: Date.now()
    });

    // Send the request
    logger.info(`Sending command to Figma: ${command}`);
    logger.debug(`Request details: ${JSON.stringify(request)}`);
    ws.send(JSON.stringify(request));
  });
}

/**
 * Join Channel Tool
 *
 * Allows joining a specific channel to communicate with Figma.
 *
 * @param {object} params - Parameters for joining a channel.
 * @param {string} params.channel - The name of the channel to join.
 *
 * @returns {Promise<object>} An object indicating success or failure.
 *
 * @throws Will throw an error if the channel name is missing or joining fails.
 *
 * @example
 * await server.tool("join_channel", { channel: "my-channel" });
 */
/**
 * Join Channel Tool
 *
 * Allows joining a specific channel to communicate with Figma.
 *
 * @param {object} params - Parameters for joining a channel.
 * @param {string} params.channel - The name of the channel to join.
 *
 * @returns {Promise<object>} An object indicating success or failure.
 *
 * @throws Will throw an error if the channel name is missing or joining fails.
 *
 * @example
 * await server.tool("join_channel", { channel: "my-channel" });
 */
/**
 * Join Channel Tool
 *
 * Allows joining a specific channel to communicate with Figma.
 *
 * @param {object} params - Parameters for joining a channel.
 * @param {string} params.channel - The name of the channel to join.
 *
 * @returns {Promise<object>} An object indicating success or failure.
 *
 * @throws Will throw an error if the channel name is missing or joining fails.
 *
 * @example
 * await server.tool("join_channel", { channel: "my-channel" });
 */
server.tool(
  "join_channel",
  "Join a specific channel to communicate with Figma",
  {
    channel: z.string().describe("The name of the channel to join").default(""),
  },
  async ({ channel }) => {
    try {
      if (!channel) {
        // If no channel provided, ask the user for input
        return {
          content: [
            {
              type: "text",
              text: "Please provide a channel name to join:",
            },
          ],
          followUp: {
            tool: "join_channel",
            description: "Join the specified channel",
          },
        };
      }

      await joinChannel(channel);
      return {
        content: [
          {
            type: "text",
            text: `Successfully joined channel: ${channel}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error joining channel: ${error instanceof Error ? error.message : String(error)
              }`,
          },
        ],
      };
    }
  }
);

/**
 * Main entry point for the MCP server
 * 
 * Initialization Process:
 * 1. Validates environment and arguments
 * 2. Initializes logging system
 * 3. Establishes Figma connection
 * 4. Creates and configures MCP server
 * 5. Starts listening for commands
 * 
 * Server Configuration:
 * - Uses stdio for transport
 * - Maintains persistent Figma connection
 * - Handles reconnection automatically
 * 
 * Error Recovery:
 * - Logs startup failures
 * - Attempts reconnection on command
 * - Exits with status code on fatal errors
 * 
 * @returns {Promise<void>} Resolves when server is ready
 * 
 * @throws {Error} Exits process on fatal initialization errors
 * 
 * @example
 * main().catch(error => {
 *   logger.error(`Fatal error: ${error.message}`);
 *   process.exit(1);
 * });
 */
async function main() {
  try {
    // Try to connect to Figma socket server
    connectToFigma();
  } catch (error) {
    logger.warn(`Could not connect to Figma initially: ${error instanceof Error ? error.message : String(error)}`);
    logger.warn('Will try to connect when the first command is sent');
  }

  // Start the MCP server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('FigmaMCP server running on stdio');
}

// Run the server
main().catch(error => {
  logger.error(`Error starting FigmaMCP server: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
