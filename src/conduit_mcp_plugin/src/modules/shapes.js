/**
 * Shapes operations module.
 * Provides functions to create and manipulate geometric nodes in Figma via MCP.
 *
 * Exposed functions:
 * - createRectangle({ rectangle } | { rectangles }): Promise<{ ids: string[] }>
 * - createFrame({ frame } | { frames }): Promise<{ ids: string[] }>
 * - createEllipse({ ellipse } | { ellipses }): Promise<{ ids: string[] }>
 * - createPolygon({ polygon } | { polygons }): Promise<{ ids: string[] }>
 * - createLine({ line } | { lines }): Promise<{ ids: string[] }>
 * - createStar(params): Promise<{ id: string }>
 * - createVector(params): Promise<{ id: string }>
 * - createVectors(params): Promise<{ ids: string[] }>
 * - setCornerRadius(params): Promise<{ success: boolean }> (works on rectangle and frame nodes)
 *
 * @example
 * import { shapeOperations } from './modules/shapes.js';
 * const rect = await shapeOperations.createRectangle({ x: 10, y: 20, width: 50, height: 50 });
 * console.log('Created rectangle', rect);
 */

import { setFill, setStroke } from "./shape/shapes-helpers.js";
import { createRectangle } from "./shape/shapes-rectangle.js";
import { createFrame } from "./shape/shapes-frame.js";
import { createEllipse } from "./shape/shapes-ellipse.js";
import { createPolygon } from "./shape/shapes-polygon.js";
import { createStar } from "./shape/shapes-star.js";
import { createVector, createVectors } from "./shape/shapes-vector.js";
import { createLine } from "./shape/shapes-line.js";

export {
  createRectangle,
  createFrame,
  createEllipse,
  createPolygon,
  createStar,
  createVector,
  createVectors,
  createLine
};

/**
 * Collection of shape operation functions for Figma.
 * @namespace shapeOperations
 * @property {function} createRectangle - Create a rectangle node.
 * @property {function} createFrame - Create a frame node.
 * @property {function} createEllipse - Create an ellipse node.
 * @property {function} createPolygon - Create a polygon node.
 * @property {function} createStar - Create a star node.
 * @property {function} createVector - Create a vector node.
 * @property {function} createVectors - Create multiple vector nodes.
 * @property {function} createLine - Create a line node.
 */
import { boolean_operation } from './node/node-misc.js';

/**
 * Unified handler for RESIZE_NODE plugin command.
 * Accepts both { resize }, { resizes }, or flat { nodeId, width, height }.
 * @function resizeNodeUnified
 * @param {object} params
 * @returns {Promise<any>}
 */
async function resizeNodeUnified(params) {
  // These functions are not imported above, but assumed to be available in the original codebase.
  // If not, they should be imported from their respective modules.
  if (params && (params.resize || params.resizes)) {
    return shapeOperations.resizeNode(params);
  } else {
    return shapeOperations.resizeNodes({ resizes: [params] });
  }
}

export const shapeOperations = {
  createRectangle,
  createFrame,
  createEllipse,
  createPolygon,
  createStar,
  createVector,
  createVectors,
  createLine,
  boolean: boolean_operation,
  resizeNodeUnified,

  /**
   * Unified handler for CREATE_VECTOR plugin command.
   * Accepts both { vector }, { vectors }, or flat { x, y, ... }.
   * @function createVectorUnified
   * @param {object} params
   * @returns {Promise<any>}
   */
  async createVectorUnified(params) {
    if (params && (params.vector || params.vectors)) {
      return shapeOperations.createVector(params);
    } else {
      return shapeOperations.createVectors({ vectors: [params] });
    }
  },

  /**
   * Unified handler for SET_CORNER_RADIUS plugin command.
   * Accepts both { radii }, { options }, or flat { nodeId, ... }.
   * @function setCornerRadiusUnified
   * @param {object} params
   * @returns {Promise<any>}
   */
  async setCornerRadiusUnified(params) {
    if (params && (params.radii || params.options)) {
      return shapeOperations.setNodeCornerRadii(params);
    } else {
      return shapeOperations.setNodesCornerRadii(params);
    }
  },

  /**
   * Unified handler for CREATE_FRAME plugin command.
   * Accepts both { frame }, { frames }, or flat { x, y, ... }.
   * @function createFrameUnified
   * @param {object} params
   * @returns {Promise<any>}
   */
  async createFrameUnified(params) {
    if (params && (params.frame || params.frames)) {
      return shapeOperations.createFrame(params);
    } else {
      return shapeOperations.createFrame({ frame: params });
    }
  },

  /**
   * Unified handler for CREATE_RECTANGLE plugin command.
   * Accepts both { rectangle }, { rectangles }, or flat { x, y, ... }.
   * @function createRectangleUnified
   * @param {object} params
   * @returns {Promise<any>}
   */
  async createRectangleUnified(params) {
    if (params && (params.rectangle || params.rectangles)) {
      return shapeOperations.createRectangle(params);
    } else {
      return shapeOperations.createRectangle({ rectangle: params });
    }
  }
  // Note: If any legacy batch/single functions remain, remove them.
};
