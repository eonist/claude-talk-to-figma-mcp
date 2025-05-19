import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaCommand, BaseFigmaNode, RGBAColor } from "./types.js";
import type { FigmaClient } from "./index.js";

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
    }
  ): Promise<BaseFigmaNode> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand("create_rectangle", {
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
    return this.executeCommand("insert_image", {
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
      return this.executeCommand("create_frame", {
        frames: params.map(cfg => ({
          ...cfg,
          name: cfg.name || "Frame",
          parentId: cfg.parentId ? ensureNodeIdIsString(cfg.parentId) : undefined,
        })),
      });
    } else {
      // Single mode
      const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
      return this.executeCommand("create_frame", {
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
    return this.executeCommand("create_text", {
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
    return this.executeCommand("create_ellipse", {
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
    return this.executeCommand("create_line", {
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
    return this.executeCommand("create_vector", {
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
    return this.executeCommand("insert_svg_vector", {
      svg: params.svg,
      x: params.x || 0,
      y: params.y || 0,
      name: params.name || "SVG Vector",
      parentId: parent,
    });
  },


  async moveNode(
    this: FigmaClient,
    params: { nodeId: string; x: number; y: number }
  ): Promise<any> {
    const id = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand("move_node", { nodeId: id, x: params.x, y: params.y });
  },

  async moveNodes(
    this: FigmaClient,
    params: { nodeIds: string[]; x: number; y: number }
  ): Promise<any> {
    const ids = params.nodeIds.map(ensureNodeIdIsString);
    return this.executeCommand("move_nodes", { nodeIds: ids, x: params.x, y: params.y });
  },

  async cloneNode(
    this: FigmaClient,
    params: { nodeId: string; x?: number; y?: number }
  ): Promise<BaseFigmaNode> {
    const id = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand("clone_node", { nodeId: id, x: params.x, y: params.y });
  },

  async cloneNodes(
    this: FigmaClient,
    params: {
      nodeIds: string[];
      positions?: { x: number; y: number }[];
      offsetX?: number;
      offsetY?: number;
      parentId?: string;
    }
  ): Promise<any> {
    return this.executeCommand("clone_nodes", params);
  },

  async resizeNode(
    this: FigmaClient,
    params: { nodeId: string; width: number; height: number }
  ): Promise<any> {
    const id = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand("resize_node", { nodeId: id, width: params.width, height: params.height });
  },

  async deleteNode(this: FigmaClient, nodeId: string): Promise<any> {
    const id = ensureNodeIdIsString(nodeId);
    return this.executeCommand("delete_node", { nodeId: id });
  },

  async deleteNodes(this: FigmaClient, nodeIds: string[]): Promise<any> {
    const ids = nodeIds.map(ensureNodeIdIsString);
    return this.executeCommand("delete_nodes", { nodeIds: ids });
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
    
    return this.executeCommand("set_fill_color", {
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
    
    return this.executeCommand("set_stroke_color", {
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
    return this.executeCommand("create_button", {
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
    return this.executeCommand("create_page", { name: params?.name });
  },
};
