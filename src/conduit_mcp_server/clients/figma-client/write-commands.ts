import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaCommand, BaseFigmaNode, RGBAColor } from "./types.js";
import type { FigmaClient } from "./index.js";
import { MCP_COMMANDS } from "../types/commands.js";

export const writeCommands = {
  /**
   * Creates a rectangle node in Figma.
   * @param params - Rectangle properties (position, size, color, etc.)
   * @returns The created rectangle node.
   */
  async createRectangle(
    this: FigmaClient,
    params: {
      x: number;
      y: number;
      width: number;
      height: number;
      name?: string;
      parentId?: string;
      fillColor?: RGBAColor;
      strokeColor?: RGBAColor;
      strokeWeight?: number;
      cornerRadius?: number;
    }
  ): Promise<BaseFigmaNode> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_RECTANGLE, {
      ...params,
      name: params.name || "Rectangle",
      parentId: parent,
    });
  },

  /**
   * Inserts an image node into Figma from a URL or data.
   * @param params - Image properties (URL, position, size, etc.)
   * @returns The created image node.
   */
  async insertImage(
    this: FigmaClient,
    params: {
      url: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      name?: string;
      parentId?: string;
    }
  ): Promise<BaseFigmaNode> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.INSERT_IMAGE, {
      url: params.url,
      x: params.x || 0,
      y: params.y || 0,
      width: params.width,
      height: params.height,
      name: params.name || "Image",
      parentId: parent,
    });
  },

  /**
   * Creates one or more frame nodes in Figma.
   * Accepts either a single frame config or an array for batch creation.
   * @param params - Frame properties or array of frame configs.
   * @returns The created frame node(s).
   */
  async createFrame(
    this: FigmaClient,
    params:
      | {
          x: number;
          y: number;
          width: number;
          height: number;
          name?: string;
          parentId?: string;
          fillColor?: RGBAColor;
          strokeColor?: RGBAColor;
          strokeWeight?: number;
        }
      | Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          name?: string;
          parentId?: string;
          fillColor?: RGBAColor;
          strokeColor?: RGBAColor;
          strokeWeight?: number;
        }>
  ): Promise<BaseFigmaNode | BaseFigmaNode[]> {
    if (Array.isArray(params)) {
      // Batch mode
      return this.executeCommand(MCP_COMMANDS.CREATE_FRAME, {
        frames: params.map(cfg => ({
          ...cfg,
          name: cfg.name || "Frame",
          parentId: cfg.parentId ? ensureNodeIdIsString(cfg.parentId) : undefined,
        })),
      });
    } else {
      // Single mode
      const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
      return this.executeCommand(MCP_COMMANDS.CREATE_FRAME, {
        frame: {
          ...params,
          name: params.name || "Frame",
          parentId: parent,
        },
      });
    }
  },


  /**
   * Creates an ellipse node in Figma.
   * @param params - Ellipse properties (position, size, color, etc.)
   * @returns The created ellipse node.
   */
  async createEllipse(
    this: FigmaClient,
    params: {
      x: number;
      y: number;
      width: number;
      height: number;
      name?: string;
      parentId?: string;
      fillColor?: RGBAColor;
      strokeColor?: RGBAColor;
      strokeWeight?: number;
    }
  ): Promise<BaseFigmaNode> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_ELLIPSE, {
      ...params,
      name: params.name || "Ellipse",
      parentId: parent,
    });
  },

  /**
   * Creates a line node in Figma.
   * @param params - Line properties (start/end points, color, etc.)
   * @returns The created line node.
   */
  async createLine(
    this: FigmaClient,
    params: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      parentId?: string;
      strokeColor?: RGBAColor;
      strokeWeight?: number;
    }
  ): Promise<BaseFigmaNode> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_LINE, {
      x: params.x1,
      y: params.y1,
      x2: params.x2,
      y2: params.y2,
      parentId: parent,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight,
    });
  },

  /**
   * Creates a vector node in Figma.
   * @param params - Vector properties (position, size, paths, etc.)
   * @returns The created vector node.
   */
  async createVector(
    this: FigmaClient,
    params: {
      x: number;
      y: number;
      width: number;
      height: number;
      name?: string;
      parentId?: string;
      vectorPaths?: Array<{ windingRule?: string; data: string }>;
      fillColor?: RGBAColor;
      strokeColor?: RGBAColor;
      strokeWeight?: number;
    }
  ): Promise<BaseFigmaNode> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_VECTOR, {
      ...params,
      name: params.name || "Vector",
      parentId: parent,
    });
  },

  /**
   * Inserts an SVG vector node into Figma.
   * @param params - SVG markup and properties (position, name, etc.)
   * @returns The created SVG vector node.
   */
  async insertSvgVector(
    this: FigmaClient,
    params: {
      svg: string;
      x?: number;
      y?: number;
      name?: string;
      parentId?: string;
    }
  ): Promise<BaseFigmaNode> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.INSERT_SVG_VECTOR, {
      svg: params.svg,
      x: params.x || 0,
      y: params.y || 0,
      name: params.name || "SVG Vector",
      parentId: parent,
    });
  },


  /**
   * Moves one or more nodes to a new position.
   * Accepts either { nodeId } for single or { nodeIds } for batch, plus x and y.
   * @param params - Node IDs and new position.
   * @returns The result of the move operation.
   */
  async moveNode(
    this: FigmaClient,
    params: { nodeId?: string; nodeIds?: string[]; x: number; y: number }
  ): Promise<any> {
    let nodeIds: string[] = [];
    if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
      nodeIds = params.nodeIds.map(ensureNodeIdIsString);
    } else if (params.nodeId) {
      nodeIds = [ensureNodeIdIsString(params.nodeId)];
    } else {
      throw new Error("moveNode: Provide either nodeId or nodeIds.");
    }
    return this.executeCommand(MCP_COMMANDS.MOVE_NODE, { nodeIds, x: params.x, y: params.y });
  },

  /**
   * Clones one or more nodes.
   * Accepts either { nodeId } for single or { nodeIds } for batch, plus optional params.
   * @param params - Node IDs and clone options.
   * @returns The result of the clone operation.
   */
  async cloneNode(
    this: FigmaClient,
    params: {
      nodeId?: string;
      nodeIds?: string[];
      x?: number;
      y?: number;
      positions?: { x: number; y: number }[];
      offsetX?: number;
      offsetY?: number;
      parentId?: string;
    }
  ): Promise<any> {
    let nodeIds: string[] = [];
    if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
      nodeIds = params.nodeIds.map(ensureNodeIdIsString);
    } else if (params.nodeId) {
      nodeIds = [ensureNodeIdIsString(params.nodeId)];
    } else {
      throw new Error("cloneNode: Provide either nodeId or nodeIds.");
    }
    // Pass through other params as needed (positions, offsetX, etc.)
    const { x, y, positions, offsetX, offsetY, parentId } = params;
    return this.executeCommand(MCP_COMMANDS.CLONE_NODE, {
      nodeIds,
      x,
      y,
      positions,
      offsetX,
      offsetY,
      parentId: parentId ? ensureNodeIdIsString(parentId) : undefined
    });
  },

  /**
   * Resizes a node to the specified width and height.
   * @param params - Node ID and new size.
   * @returns The result of the resize operation.
   */
  async resizeNode(
    this: FigmaClient,
    params: { nodeId: string; width: number; height: number }
  ): Promise<any> {
    const id = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand(MCP_COMMANDS.RESIZE_NODE, { nodeId: id, width: params.width, height: params.height });
  },

  /**
   * Deletes one or more nodes.
   * Accepts either { nodeId } for single or { nodeIds } for batch, like create_rectangle.
   * @param params - Node IDs to delete.
   * @returns The result of the delete operation.
   */
  async deleteNode(
    this: FigmaClient,
    params: { nodeId?: string; nodeIds?: string[] }
  ): Promise<any> {
    let nodeIds: string[] = [];
    if (params.nodeIds && Array.isArray(params.nodeIds)) {
      nodeIds = params.nodeIds.map(ensureNodeIdIsString);
    } else if (params.nodeId) {
      nodeIds = [ensureNodeIdIsString(params.nodeId)];
    } else {
      throw new Error("deleteNode: Must provide nodeId or nodeIds");
    }
    // If backend supports batch in DELETE_NODE, always use nodeIds param
    return this.executeCommand(MCP_COMMANDS.DELETE_NODE, { nodeIds });
  },

  /**
   * Sets the fill color of a node.
   * @param params - Node ID and color values.
   * @returns The result of the fill color operation.
   */
  async setFillColor(
    this: FigmaClient,
    params: {
      nodeId: string;
      r: number;
      g: number;
      b: number;
      a?: number;
    }
  ): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand(MCP_COMMANDS.SET_FILL_COLOR, {
      nodeId: nodeIdString,
      color: {
        r: params.r,
        g: params.g,
        b: params.b,
        a: params.a || 1
      }
    });
  },

  /**
   * Sets the stroke color of a node.
   * @param params - Node ID and color values.
   * @returns The result of the stroke color operation.
   */
  async setStrokeColor(
    this: FigmaClient,
    params: {
      nodeId: string;
      r: number;
      g: number;
      b: number;
      a?: number;
      weight?: number;
    }
  ): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand(MCP_COMMANDS.SET_STROKE_COLOR, {
      nodeId: nodeIdString,
      color: {
        r: params.r,
        g: params.g,
        b: params.b,
        a: params.a || 1
      },
      weight: params.weight || 1
    });
  },

  /**
   * Creates a complete button with background and text.
   * @param params - Button properties (position, size, style, etc.)
   * @returns The IDs of the created button elements.
   */
  async createButton(
    this: FigmaClient,
    params: {
      x: number;
      y: number;
      width?: number;
      height?: number;
      text?: string;
      style?: {
        background?: { r: number; g: number; b: number; a?: number };
        text?: { r: number; g: number; b: number; a?: number };
        fontSize?: number;
        fontWeight?: number;
        cornerRadius?: number;
      };
      name?: string;
      parentId?: string;
    }
  ): Promise<{frameId: string, backgroundId: string, textId: string}> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_BUTTON, {
      ...params,
      name: params.name || "Button",
      parentId: parent,
    });
  },
};
