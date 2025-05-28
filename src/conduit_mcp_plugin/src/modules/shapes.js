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
import { resizeNode, resizeNodes } from "./node/node-modify.js";

export {
  createRectangle,
  createFrame,
  createEllipse,
  createPolygon,
  createStar,
  createVector,
  createVectors,
  createLine,
  getVector,
  getVectors
};

import { boolean_operation } from './node/node-misc.js';

/**
 * Unified handler for RESIZE_NODE plugin command.
 * Accepts both { resize }, { resizes }, or flat { nodeId, width, height }.
 * @function resizeNodeUnified
 * @param {object} params
 * @returns {Promise<any>}
 */
async function resizeNodeUnified(params) {
  if (params && (params.resize || params.resizes)) {
    // If batch, call resizeNodes
    return resizeNodes(params);
  } else {
    // Single node resize
    return resizeNode(params);
  }
}
 async function setMask(params) {
  try {
    const targetNodeId = params.targetNodeId;
    const maskNodeId = params.maskNodeId;
    
    if (!targetNodeId || !maskNodeId) {
      return [{ success: false, error: "Missing node IDs" }];
    }

    const targetNode = await figma.getNodeByIdAsync(targetNodeId);
    const maskNode = await figma.getNodeByIdAsync(maskNodeId);
    
    if (!targetNode || !maskNode) {
      return [{ success: false, error: "Nodes not found" }];
    }

    // Set mask property BEFORE grouping
    maskNode.isMask = true;
    
    // Group with mask first in selection (this puts it at bottom of group)
    const maskGroup = figma.group([maskNode, targetNode], figma.currentPage);
    maskGroup.name = "Masked_" + targetNode.name;

    return [{ success: true, nodeId: maskGroup.id }];
    
  } catch (error) {
    return [{ success: false, error: error.message }];
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
  getVector,
  getVectors,
  boolean: boolean_operation,
  resizeNodeUnified,

  async createVectorUnified(params) {
    if (params && (params.vector || params.vectors)) {
      return shapeOperations.createVector(params);
    } else {
      return shapeOperations.createVectors({ vectors: [params] });
    }
  },

  async setCornerRadiusUnified(params) {
    if (params && (params.radii || params.options)) {
      return shapeOperations.setNodeCornerRadii(params);
    } else {
      return shapeOperations.setNodesCornerRadii(params);
    }
  },

  async createFrameUnified(params) {
    if (params && (params.frame || params.frames)) {
      return shapeOperations.createFrame(params);
    } else {
      return shapeOperations.createFrame({ frame: params });
    }
  },

  async createRectangleUnified(params) {
    if (params && (params.rectangle || params.rectangles)) {
      return shapeOperations.createRectangle(params);
    } else {
      return shapeOperations.createRectangle({ rectangle: params });
    }
  },

  async rotateNodeUnified(params) {
    const { nodeId, angle, pivot = "center", pivotPoint } = params;
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    if (typeof node.rotation !== "number" || typeof node.x !== "number" || typeof node.y !== "number") {
      throw new Error("Node does not support rotation or positioning");
    }

    function getPivotCoords(node, pivot, pivotPoint) {
      switch (pivot) {
        case "center":
          return { x: node.x + (node.width || 0) / 2, y: node.y + (node.height || 0) / 2 };
        case "top-left":
          return { x: node.x, y: node.y };
        case "top-right":
          return { x: node.x + (node.width || 0), y: node.y };
        case "bottom-left":
          return { x: node.x, y: node.y + (node.height || 0) };
        case "bottom-right":
          return { x: node.x + (node.width || 0), y: node.y + (node.height || 0) };
        case "custom":
          if (!pivotPoint) throw new Error("pivotPoint required for custom pivot");
          return pivotPoint;
        default:
          return { x: node.x + (node.width || 0) / 2, y: node.y + (node.height || 0) / 2 };
      }
    }

    const pivotCoords = getPivotCoords(node, pivot, pivotPoint);
    const dx = node.x - pivotCoords.x;
    const dy = node.y - pivotCoords.y;
    const rad = (angle - (node.rotation || 0)) * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rotatedDx = dx * cos - dy * sin;
    const rotatedDy = dx * sin + dy * cos;
    node.x = pivotCoords.x + rotatedDx;
    node.y = pivotCoords.y + rotatedDy;
    node.rotation = angle;

    return {
      nodeId,
      angle,
      pivot,
      pivotPoint,
      x: node.x,
      y: node.y,
      success: true
    };
  },

  setMask
};
