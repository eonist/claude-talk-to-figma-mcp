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
 /**
 * Applies mask operations to Figma nodes by grouping them and setting mask properties.
 * Supports both single operations and batch processing.
 * 
 * @async
 * @function setMask
 * @param {Object} params - The parameters object
 * @param {string} [params.targetNodeId] - ID of the node to be masked (for single operation)
 * @param {string} [params.maskNodeId] - ID of the node to use as mask (for single operation)
 * @param {Array<Object>} [params.operations] - Array of operations for batch processing
 * @param {string} params.operations[].targetNodeId - ID of the node to be masked
 * @param {string} params.operations[].maskNodeId - ID of the node to use as mask
 * @returns {Promise<Array<Object>>} Array of results, each containing success status and details
 * @returns {boolean} returns[].success - Whether the operation succeeded
 * @returns {string} [returns[].nodeId] - ID of the created masked group (on success)
 * @returns {string} [returns[].error] - Error message (on failure)
 * @returns {string} [returns[].targetNodeId] - Original target node ID
 * @returns {string} [returns[].maskNodeId] - Original mask node ID
 * 
 * @example
 * // Single operation
 * const result = await setMask({
 *   targetNodeId: "123:456",
 *   maskNodeId: "789:012"
 * });
 * 
 * @example
 * // Batch operations
 * const results = await setMask({
 *   operations: [
 *     { targetNodeId: "123:456", maskNodeId: "789:012" },
 *     { targetNodeId: "345:678", maskNodeId: "901:234" }
 *   ]
 * });
 * 
 * @note The mask node must be positioned below the target node in the layer hierarchy
 *       for the masking to work correctly. This function preserves the existing layer
 *       order from the page when grouping nodes.
 */
async function setMask(params) {
  // Parse input parameters to support both single and batch operations
  // If operations array is provided, use it; otherwise create single operation from individual IDs
  const ops = Array.isArray(params.operations)
    ? params.operations
    : (params.targetNodeId && params.maskNodeId
        ? [{ targetNodeId: params.targetNodeId, maskNodeId: params.maskNodeId }]
        : []);
  
  // Array to collect results from all operations
  const results = [];

  // Validate that we have operations to process
  if (!ops.length) {
    return [{ success: false, error: "No operations provided" }];
  }

  // Process each operation individually
  for (const op of ops) {
    try {
      // Extract node IDs from current operation
      const { targetNodeId, maskNodeId } = op;
      
      // Validate required parameters for this operation
      if (!targetNodeId || !maskNodeId) {
        results.push({
          success: false,
          error: "Missing node IDs",
          targetNodeId,
          maskNodeId
        });
        continue; // Skip to next operation
      }

      // Fetch the actual nodes from Figma using their IDs
      const targetNode = await figma.getNodeByIdAsync(targetNodeId);
      const maskNode = await figma.getNodeByIdAsync(maskNodeId);
      
      // Verify both nodes exist and are accessible
      if (!targetNode || !maskNode) {
        results.push({
          success: false,
          error: "Nodes not found",
          targetNodeId,
          maskNodeId
        });
        continue; // Skip to next operation
      }

      // Set the mask property BEFORE grouping to ensure it's applied correctly
      // This is crucial - the isMask property must be set before the nodes are grouped
      maskNode.isMask = true;
      
      // Group the nodes together using Figma's built-in group function
      // The layer order is preserved from the page hierarchy (mask should be below target)
      const maskGroup = figma.group([targetNode, maskNode], figma.currentPage);
      
      // Set a descriptive name for the masked group
      maskGroup.name = "Masked_" + (targetNode.name || targetNodeId);

      // Record successful operation
      results.push({
        success: true,
        nodeId: maskGroup.id,
        targetNodeId,
        maskNodeId
      });

    } catch (error) {
      // Handle any unexpected errors during processing
      results.push({
        success: false,
        error: error.message || String(error),
        targetNodeId: op.targetNodeId,
        maskNodeId: op.maskNodeId
      });
    }
  }
  
  // Return all results (successful and failed operations)
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
