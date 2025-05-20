import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../types/commands.js";
import type { FigmaClient } from "./index.js";
import type { RGBAColor } from "./types.js";

/**
 * Style-related Figma commands.
 */
export const styleCommands = {
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
   * Sets both fill and stroke properties on a node in a single call
   *
   * @param params.nodeId - The node ID to style
   * @param params.fillProps - Optional fill properties
   * @param params.strokeProps - Optional stroke properties
   */
  async setStyle(
    this: FigmaClient,
    params: any
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.SET_STYLE, params);
  },

  /**
   * Gets all styles in Figma.
   * @param params - (optional) parameters
   * @returns {Promise<any>}
   */
  async getStyles(
    this: FigmaClient,
    params: any = {}
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.GET_STYLE, params);
  }
};
