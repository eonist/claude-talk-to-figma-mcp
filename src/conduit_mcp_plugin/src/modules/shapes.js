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

      // Move original nodes instead of cloning
      const originalTargetParent = targetNode.parent;
      const originalMaskParent = maskNode.parent;
      const targetIndex = originalTargetParent.children.indexOf(targetNode);

      console.log(`setMask: Moving original nodes - Target: ${targetNode.type}, Mask: ${maskNode.type}`);

      // Create frame with clipping enabled
      const maskFrame = figma.createFrame();
      maskFrame.name = `Masked_${targetNode.name || targetNodeId}`;
      maskFrame.x = targetNode.x;
      maskFrame.y = targetNode.y;
      maskFrame.resize(targetNode.width, targetNode.height);
      maskFrame.clipContent = true;

      // Calculate relative positions for nodes within the frame
      const maskRelativeX = maskNode.x - targetNode.x;
      const maskRelativeY = maskNode.y - targetNode.y;
      console.log(`setMask: Calculated relative positions - Mask: (${maskRelativeX}, ${maskRelativeY})`);

      // Set mask properties on original nodes BEFORE moving them
      try {
        maskNode.isMask = true;
        targetNode.isMask = false;
        console.log(`setMask: Set isMask properties successfully`);
      } catch (maskPropertyError) {
        console.log(`setMask: Error setting isMask properties:`, maskPropertyError && maskPropertyError.message ? maskPropertyError.message : maskPropertyError);
        results.push({
          success: false,
          error: `Failed to set mask properties: ${maskPropertyError && maskPropertyError.message ? maskPropertyError.message : maskPropertyError}`,
          targetNodeId,
          maskNodeId
        });
        continue;
      }

      // Move nodes into the frame (mask first, then target)
      try {
        // Move mask node first
        maskFrame.appendChild(maskNode);
        maskNode.x = maskRelativeX;
        maskNode.y = maskRelativeY;
        console.log(`setMask: Moved mask node to frame`);

        // Move target node
        maskFrame.appendChild(targetNode);
        targetNode.x = 0;
        targetNode.y = 0;
        console.log(`setMask: Moved target node to frame`);

      } catch (moveError) {
        console.log(`setMask: Error moving nodes:`, moveError && moveError.message ? moveError.message : moveError);
        // Clean up the frame if move failed
        maskFrame.remove();
        results.push({
          success: false,
          error: `Failed to move nodes: ${moveError && moveError.message ? moveError.message : moveError}`,
          targetNodeId,
          maskNodeId
        });
        continue;
      }

      // Insert the masked frame at the original target position
      try {
        if (!originalTargetParent) {
          console.log("setMask: Target node has no parent", { targetNodeId, maskNodeId });
          results.push({
            success: false,
            error: "Target node has no parent",
            targetNodeId,
            maskNodeId
          });
          continue;
        }
        originalTargetParent.insertChild(targetIndex, maskFrame);
        console.log(`setMask: Inserted masked frame into parent`);

        // Select the new masked group
        figma.currentPage.selection = [maskFrame];

        results.push({
          success: true,
          message: "Mask applied successfully using original nodes",
          nodeId: maskFrame.id,
          targetNodeId,
          maskNodeId
        });

      } catch (insertError) {
        console.log(`setMask: Error inserting frame:`, insertError && insertError.message ? insertError.message : insertError);
        results.push({
          success: false,
          error: `Failed to insert masked frame: ${insertError && insertError.message ? insertError.message : insertError}`,
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
