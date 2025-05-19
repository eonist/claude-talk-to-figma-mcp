import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaCommand, BaseFigmaNode, RGBAColor } from "./types.js";
import type { FigmaClient } from "./index.js";
import { MCP_COMMANDS } from "../types/commands.js";

export const writeCommands = {
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

  // Insert Image Tool
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

  async createText(
    this: FigmaClient,
    params: {
      x: number;
      y: number;
      text: string;
      fontSize?: number;
      fontWeight?: number;
      fontColor?: RGBAColor;
      name?: string;
      parentId?: string;
    }
  ): Promise<BaseFigmaNode> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_TEXT, {
      ...params,
      fontSize: params.fontSize || 14,
      fontWeight: params.fontWeight || 400,
      fontColor: params.fontColor,
      name: params.name || "Text",
      parentId: parent,
    });
  },

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
   * Sets the fill color of a node
   * 
   * @param {object} params - Fill color parameters
   * @returns {Promise<any>} Operation result
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
   * Sets the stroke color of a node
   * 
   * @param {object} params - Stroke color parameters
   * @returns {Promise<any>} Operation result
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
   * Creates a complete button with background and text
   * 
   * @param {object} params - Button parameters
   * @returns {Promise<{frameId: string, backgroundId: string, textId: string}>} Created button elements
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

  /**
   * Creates a new page in the document.
   * @param {object} params - { name?: string }
   * @returns {Promise<{ id: string, name: string, childCount: number }>} The new page info
   */
  async createPage(
    this: FigmaClient,
    params: { name?: string }
  ): Promise<{ id: string; name: string; childCount: number }> {
    return this.executeCommand(MCP_COMMANDS.CREATE_PAGE, { name: params?.name });
  },
};
