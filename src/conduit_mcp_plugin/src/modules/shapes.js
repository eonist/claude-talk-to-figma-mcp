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
  // Support both single and batch
  const ops = Array.isArray(params.operations)
    ? params.operations
    : (params.targetNodeId && params.maskNodeId
        ? [{ targetNodeId: params.targetNodeId, maskNodeId: params.maskNodeId, channelId: params.channelId }]
        : []);
  const results = [];
  for (const op of ops) {
    try {
      const { targetNodeId, maskNodeId } = op;
      const targetNode = figma.getNodeById(targetNodeId);
      const maskNode = figma.getNodeById(maskNodeId);

      if (!targetNode || !maskNode) {
        results.push({
          success: false,
          error: "One or both nodes not found",
          targetNodeId,
          maskNodeId
        });
        continue;
      }

      // Only allow masking for rectangles, ellipses, polygons, vectors, frames, groups
      const validTargetTypes = ["RECTANGLE", "ELLIPSE", "POLYGON", "FRAME", "GROUP", "VECTOR"];
      const validMaskTypes = ["RECTANGLE", "ELLIPSE", "POLYGON", "VECTOR"];
      if (!validTargetTypes.includes(targetNode.type) || !validMaskTypes.includes(maskNode.type)) {
        results.push({
          success: false,
          error: "Invalid node types for masking operation",
          targetNodeId,
          maskNodeId
        });
        continue;
      }

      // Create a frame to contain the masked result
      const maskFrame = figma.createFrame();
      maskFrame.name = `Masked_${targetNode.name || targetNodeId}`;
      maskFrame.x = targetNode.x;
      maskFrame.y = targetNode.y;
      maskFrame.resize(targetNode.width, targetNode.height);

      // Clone the target and mask nodes
      const clonedTarget = targetNode.clone();
      clonedTarget.x = 0;
      clonedTarget.y = 0;
      maskFrame.appendChild(clonedTarget);

      const clonedMask = maskNode.clone();
      clonedMask.x = maskNode.x - targetNode.x;
      clonedMask.y = maskNode.y - targetNode.y;
      maskFrame.appendChild(clonedMask);

      // Apply the mask
      clonedTarget.isMask = false;
      clonedMask.isMask = true;

      // Insert the masked frame in the same parent as the target
      const parent = targetNode.parent;
      const targetIndex = parent.children.indexOf(targetNode);
      parent.insertChild(targetIndex, maskFrame);

      // Remove original nodes
      targetNode.remove();
      maskNode.remove();

      // Select the new masked group
      figma.currentPage.selection = [maskFrame];

      results.push({
        success: true,
        message: "Mask applied successfully",
        nodeId: maskFrame.id,
        targetNodeId,
        maskNodeId
      });
    } catch (error) {
      results.push({
        success: false,
        error: error && error.message ? error.message : String(error)
      });
    }
  }
  return results;
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
