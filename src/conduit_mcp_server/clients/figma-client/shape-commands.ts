import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../types/commands.js";
import type { BaseFigmaNode, RGBAColor } from "./types.js";
import type { FigmaClient } from "./index.js";

/**
 * Shape-related Figma commands.
 */
export const shapeCommands = {
  /**
   * Creates a rectangle in Figma.
   * 
   * @param {object} params - Rectangle parameters
   * @returns {Promise<BaseFigmaNode>} The created rectangle
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
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_RECTANGLE, {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      name: params.name || "Rectangle",
      parentId: parentIdString,
      fillColor: params.fillColor,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight,
      cornerRadius: params.cornerRadius
    });
  },

  /**
   * Creates an ellipse in Figma.
   * 
   * @param {object} params - Ellipse parameters
   * @returns {Promise<BaseFigmaNode>} The created ellipse
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
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_ELLIPSE, {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      name: params.name || "Ellipse",
      parentId: parentIdString,
      fillColor: params.fillColor,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  },

  /**
   * Creates a polygon node in Figma.
   * @param {object} params - Polygon parameters.
   * @param {number} params.x - X position.
   * @param {number} params.y - Y position.
   * @param {number} params.width - Width of the polygon.
   * @param {number} params.height - Height of the polygon.
   * @param {number} [params.sides] - Number of sides.
   * @param {string} [params.name] - Name of the node.
   * @param {string} [params.parentId] - Parent node ID.
   * @param {RGBAColor} [params.fillColor] - Fill color.
   * @param {RGBAColor} [params.strokeColor] - Stroke color.
   * @param {number} [params.strokeWeight] - Stroke weight.
   * @returns {Promise<BaseFigmaNode>} The created polygon node.
   */
  async createPolygon(
    this: FigmaClient,
    params: {
      x: number;
      y: number;
      width: number;
      height: number;
      sides?: number;
      name?: string;
      parentId?: string;
      fillColor?: RGBAColor;
      strokeColor?: RGBAColor;
      strokeWeight?: number;
    }
  ): Promise<BaseFigmaNode> {
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_POLYGON, {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      sides: params.sides,
      name: params.name,
      parentId: parentIdString,
      fillColor: params.fillColor,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  },

  /**
   * Creates a frame in Figma.
   * 
   * @param {object} params - Frame parameters
   * @returns {Promise<BaseFigmaNode>} The created frame
   */
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
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_FRAME, {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      name: params.name || "Frame",
      parentId: parentIdString,
      fillColor: params.fillColor || { r: 1, g: 1, b: 1, a: 1 },
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  },

  /**
   * Creates a line in Figma.
   *
   * @param {object} params - Line parameters
   * @returns {Promise<BaseFigmaNode>} The created line node
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
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_LINE, {
      x1: params.x1,
      y1: params.y1,
      x2: params.x2,
      y2: params.y2,
      parentId: parentIdString,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  },

  /**
   * Creates a new vector node in Figma.
   *
   * @param {object} params - Vector parameters
   * @returns {Promise<BaseFigmaNode>} The created vector node
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
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_VECTOR, {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      name: params.name || "Vector",
      parentId: parentIdString,
      vectorPaths: params.vectorPaths,
      fillColor: params.fillColor,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  },

  /**
   * Inserts an SVG vector in Figma.
   * 
   * @param {object} params - SVG vector parameters
   * @returns {Promise<BaseFigmaNode>} The created SVG vector node
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
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.INSERT_SVG_VECTOR, {
      svg: params.svg,
      x: params.x || 0,
      y: params.y || 0,
      name: params.name || "SVG Vector",
      parentId: parentIdString
    });
  }
};
