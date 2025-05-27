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

  if (!ops.length) {
    console.log("setMask: No operations provided");
    return [{ success: false, error: "No operations provided" }];
  }

  for (const op of ops) {
    try {
      const { targetNodeId, maskNodeId } = op;
      console.log(`setMask: Processing targetNodeId=${targetNodeId}, maskNodeId=${maskNodeId}`);

      const targetNode = await figma.getNodeByIdAsync(targetNodeId);
      const maskNode = await figma.getNodeByIdAsync(maskNodeId);

      if (!targetNode || !maskNode) {
        console.log("setMask: One or both nodes not found", { targetNodeId, maskNodeId });
        results.push({
          success: false,
          error: "One or both nodes not found",
          targetNodeId,
          maskNodeId
        });
        continue;
      }

      // Updated valid node types based on Figma API docs and your recommendations
      const validTargetTypes = [
        "RECTANGLE", "ELLIPSE", "POLYGON", "STAR", "VECTOR",
        "FRAME", "GROUP", "COMPONENT", "COMPONENT_SET", 
        "INSTANCE", "TEXT", "SHAPE_WITH_TEXT", "STICKY", 
        "LINE", "BOOLEAN_OPERATION"
      ];
      const validMaskTypes = [
        "RECTANGLE", "ELLIPSE", "POLYGON", "STAR", "VECTOR",
        "BOOLEAN_OPERATION", "COMPONENT", "COMPONENT_SET", 
        "INSTANCE", "TEXT", "SHAPE_WITH_TEXT", "STICKY", 
        "LINE", "FRAME", "GROUP"
      ];
      console.log(`setMask: targetNode.type=${targetNode.type}, maskNode.type=${maskNode.type}`);
      if (!validTargetTypes.includes(targetNode.type) || !validMaskTypes.includes(maskNode.type)) {
        console.log("setMask: Invalid node types for masking operation", { targetNodeType: targetNode.type, maskNodeType: maskNode.type });
        results.push({
          success: false,
          error: "Invalid node types for masking operation",
          targetNodeId,
          maskNodeId
        });
        continue;
      }

      // Clone nodes and check extensibility
      let clonedTarget, clonedMask;
      try {
        clonedTarget = targetNode.clone();
        clonedMask = maskNode.clone();
      } catch (cloneError) {
        console.log("setMask: Clone failed for " + targetNode.type + " or " + maskNode.type + ":", cloneError && cloneError.message ? cloneError.message : cloneError);
        results.push({
          success: false,
          error: `Clone operation failed: ${cloneError.message}`,
          targetNodeId,
          maskNodeId
        });
        continue;
      }

      // Check if cloned nodes are extensible
      const targetExtensible = Object.isExtensible(clonedTarget);
      const maskExtensible = Object.isExtensible(clonedMask);
      console.log(`setMask: Target clone extensible: ${targetExtensible}, type: ${clonedTarget.type}`);
      console.log(`setMask: Mask clone extensible: ${maskExtensible}, type: ${clonedMask.type}`);

      if (!targetExtensible || !maskExtensible) {
        const nonExtensibleTypes = [];
        if (!targetExtensible) nonExtensibleTypes.push(clonedTarget.type);
        if (!maskExtensible) nonExtensibleTypes.push(clonedMask.type);
        console.log(`setMask: Skipping mask operation - non-extensible node types: ${nonExtensibleTypes.join(', ')}`);
        results.push({
          success: false,
          error: `Cannot apply mask - node types not extensible: ${nonExtensibleTypes.join(', ')}`,
          targetNodeId,
          maskNodeId,
          nonExtensibleTypes
        });
        continue;
      }

      // Create frame with clipping enabled
      const maskFrame = figma.createFrame();
      maskFrame.name = `Masked_${targetNode.name || targetNodeId}`;
      maskFrame.x = targetNode.x;
      maskFrame.y = targetNode.y;
      maskFrame.resize(targetNode.width, targetNode.height);
      maskFrame.clipContent = true; // Essential for masking

      // Position and configure nodes (only if extensible)
      try {
        // Position mask relative to frame
        clonedMask.x = maskNode.x - targetNode.x;
        clonedMask.y = maskNode.y - targetNode.y;
        clonedMask.isMask = true;

        // Position target
        clonedTarget.x = 0;
        clonedTarget.y = 0;
        clonedTarget.isMask = false;

        // Add mask first, then content
        maskFrame.appendChild(clonedMask);
        maskFrame.appendChild(clonedTarget);

        // Insert the masked frame
        const parent = targetNode.parent;
        if (!parent) {
          console.log("setMask: Target node has no parent", { targetNodeId, maskNodeId });
          results.push({
            success: false,
            error: "Target node has no parent",
            targetNodeId,
            maskNodeId
          });
          continue;
        }

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

      } catch (maskError) {
        console.log("setMask: Error setting mask properties:", maskError && maskError.message ? maskError.message : maskError);
        // Clean up the frame if mask application failed
        maskFrame.remove();
        results.push({
          success: false,
          error: `Failed to apply mask properties: ${maskError.message}`,
          targetNodeId,
          maskNodeId
        });
      }

    } catch (error) {
      console.log("setMask: Unexpected error:", error && error.message ? error.message : error);
      results.push({
        success: false,
        error: error && error.message ? error.message : String(error),
        targetNodeId: op.targetNodeId,
        maskNodeId: op.maskNodeId
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
