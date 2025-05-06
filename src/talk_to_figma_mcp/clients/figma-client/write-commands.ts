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
    return this.executeCommand("create_frame", {
      ...params,
      name: params.name || "Frame",
      parentId: parent,
    });
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
};
