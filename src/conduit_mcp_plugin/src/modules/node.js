import { clone_node } from './layout/layout-clone.js';
import { resizeNode, resizeNodes, moveNode, moveNodes, setNodeCornerRadii, setNodesCornerRadii } from './node/node-modify.js';
import { deleteNode, deleteNodes, convertRectangleToFrame } from './node/node-edit.js';
import { flattenNode, union_selection, subtract_selection, intersect_selection, exclude_selection } from './node/node-misc.js';

/**
 * Node operations module.
 * Provides functions to manipulate Figma nodes (resize, move, delete, boolean ops, etc.) via MCP.
 *
 * Exposed functions:
 * - resizeNode(params): Promise<{ success: boolean }>
 * - resizeNodes(params): Promise<{ success: boolean, resized: number }>
 * - deleteNode(params): Promise<{ success: boolean }>
 * - deleteNodes(params): Promise<{ success: string[], failed: string[] }>
 * - moveNode(params): Promise<{ success: boolean }>
 * - moveNodes(params): Promise<{ success: boolean, moved: number }>
 * - flattenNode(params): Promise<{ success: boolean, nodeId: string }>
 * - union_selection(params): Promise<{ success: boolean }>
 * - subtract_selection(params): Promise<{ success: boolean }>
 * - intersect_selection(params): Promise<{ success: boolean }>
 * - exclude_selection(params): Promise<{ success: boolean }>
 * - convertRectangleToFrame(params): Promise<{ id, name, width, height }>
 * - setNodeCornerRadii(params): Promise<{ success: boolean }>
 * - setNodesCornerRadii(params): Promise<{ success: boolean, modifiedNodes: string[], errors?: string[] }>
 *
 * @example
 * import { nodeOperations } from './modules/node.js';
 * const result = await nodeOperations.resizeNode({ nodeId, width: 100, height: 100 });
 * console.log('Resized node', result);
 */

/**
 * Resizes a node to the specified dimensions
 * @async
 * @function resizeNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to resize
 * @param {number} params.width - New width
 * @param {number} params.height - New height
 * @returns {Promise<{success: boolean}>}
 */
export async function resizeNode(params) {
  const { nodeId, width, height } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  node.resize(width, height);
  return { success: true };
}

/**
 * Resizes multiple nodes to the same dimensions
 * @async
 * @function resizeNodes
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to resize
 * @param {object} params.targetSize - Target dimensions
 * @param {number} params.targetSize.width - New width
 * @param {number} params.targetSize.height - New height
 * @returns {Promise<{success: boolean, resized: number}>}
 */
export async function resizeNodes(params) {
  const { nodeIds, targetSize } = params;
  let resized = 0;
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) {
      node.resize(targetSize.width, targetSize.height);
      resized++;
    }
  }
  
  return { success: true, resized };
}

/**
 * Deletes a node from the document
 * @async
 * @function deleteNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to delete
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteNode(params) {
  const { nodeId } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  node.remove();
  return { success: true };
}

/**
 * Deletes multiple nodes from the document
 * @async
 * @function deleteNodes
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to delete
 * @returns {Promise<{success: string[], failed: string[]}>}
 */
export async function deleteNodes(params) {
  const { nodeIds } = params;
  const success = [];
  const failed = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) {
      node.remove();
      success.push(id);
    } else {
      failed.push(id);
    }
  }
  
  return { success, failed };
}

/**
 * Moves a node to a new position
 * @async
 * @function moveNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to move
 * @param {number} params.x - New X position
 * @param {number} params.y - New Y position
 * @returns {Promise<{success: boolean}>}
 */
export async function moveNode(params) {
  const { nodeId, x, y } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  node.x = x;
  node.y = y;
  return { success: true };
}

/**
 * Moves multiple nodes to a new position
 * @async
 * @function moveNodes
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to move
 * @param {number} params.x - New X position
 * @param {number} params.y - New Y position
 * @returns {Promise<{success: boolean, moved: number}>}
 */
export async function moveNodes(params) {
  const { nodeIds, x, y } = params;
  let moved = 0;
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) {
      node.x = x;
      node.y = y;
      moved++;
    }
  }
  
  return { success: true, moved };
}

/**
 * Flattens a node
 * @async
 * @function flattenNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to flatten
 * @returns {Promise<{success: boolean, nodeId: string}>}
 */
export async function flattenNode(params) {
  const { nodeId } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  figma.currentPage.selection = [node];
  const flattened = figma.flatten();
  return { success: true, nodeId: flattened.id };
}


/**
 * Converts a rectangle node to a frame, preserving all properties and optionally placing elements inside it.
 * This allows adding children to what was previously a rectangle, as frames can contain child elements.
 *
 * @async
 * @function convertRectangleToFrame
 * @param {object} params - Conversion parameters
 * @param {string} params.nodeId - ID of the rectangle to convert
 * @param {string[]} [params.elementsToPlace] - Optional array of node IDs to place inside the new frame
 * @param {boolean} [params.deleteOriginal=true] - Whether to delete the original rectangle after conversion
 * @returns {Promise<{ id: string, name: string, width: number, height: number }>} Created frame info
 * @throws {Error} If node not found or is not a rectangle
 * 
 * @example
 * const frameResult = await convertRectangleToFrame({ 
 *   nodeId: "123:456", 
 *   elementsToPlace: ["123:457", "123:458"] 
 * });
 */
export async function convertRectangleToFrame(params) {
  const { nodeId, elementsToPlace = [], deleteOriginal = true } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  // Get the rectangle node
  const rectangle = await figma.getNodeByIdAsync(nodeId);
  if (!rectangle) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  
  // Verify it's a rectangle
  if (rectangle.type !== "RECTANGLE") {
    throw new Error(`Node with ID ${nodeId} is not a rectangle (found type: ${rectangle.type})`);
  }
  
  // Get the parent to maintain hierarchy
  const parent = rectangle.parent;
  
  // Create a new frame
  const frame = figma.createFrame();
  
  // Copy properties from rectangle to frame
  frame.x = rectangle.x;
  frame.y = rectangle.y;
  frame.resize(rectangle.width, rectangle.height);
  frame.name = rectangle.name + " Frame"; // Append "Frame" to distinguish it
  
  // Copy visual properties
  if ("fills" in rectangle) frame.fills = rectangle.fills;
  if ("strokes" in rectangle) frame.strokes = rectangle.strokes;
  if ("strokeWeight" in rectangle) frame.strokeWeight = rectangle.strokeWeight;
  if ("strokeAlign" in rectangle) frame.strokeAlign = rectangle.strokeAlign;
  if ("strokeCap" in rectangle) frame.strokeCap = rectangle.strokeCap;
  if ("strokeJoin" in rectangle) frame.strokeJoin = rectangle.strokeJoin;
  if ("strokeMiterLimit" in rectangle) frame.strokeMiterLimit = rectangle.strokeMiterLimit;
  if ("dashPattern" in rectangle) frame.dashPattern = rectangle.dashPattern;
  
  // Copy corner radius
  if ("cornerRadius" in rectangle) {
    if (typeof rectangle.cornerRadius === 'number') {
      frame.cornerRadius = rectangle.cornerRadius;
    } else {
      // Handle individual corner radii
      frame.topLeftRadius = rectangle.topLeftRadius;
      frame.topRightRadius = rectangle.topRightRadius;
      frame.bottomLeftRadius = rectangle.bottomLeftRadius;
      frame.bottomRightRadius = rectangle.bottomRightRadius;
    }
  }
  
  // Copy effects
  if ("effects" in rectangle) frame.effects = rectangle.effects;
  
  // Copy blend mode and opacity
  if ("blendMode" in rectangle) frame.blendMode = rectangle.blendMode;
  if ("opacity" in rectangle) frame.opacity = rectangle.opacity;
  
  // Add to the same parent
  parent.appendChild(frame);
  
  // Place elements inside the frame if provided
  if (elementsToPlace.length > 0) {
    for (const elementId of elementsToPlace) {
      const element = await figma.getNodeByIdAsync(elementId);
      if (element) {
        // Calculate position relative to the frame
        const relativeX = element.x - frame.x;
        const relativeY = element.y - frame.y;
        
        // Move element to frame
        frame.appendChild(element);
        
        // Restore relative position
        element.x = relativeX;
        element.y = relativeY;
      }
    }
  }
  
  // Optionally delete the original rectangle
  if (deleteOriginal) {
    rectangle.remove();
  }
  
  return { 
    id: frame.id, 
    name: frame.name, 
    width: frame.width, 
    height: frame.height 
  };
}

/**
 * Sets custom corner radii for a single node
 * @async
 * @function setNodeCornerRadii
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to modify
 * @param {number} [params.all] - Uniform radius for all corners
 * @param {number} [params.top_left] - Radius for top-left corner
 * @param {number} [params.top_right] - Radius for top-right corner
 * @param {number} [params.bottom_left] - Radius for bottom-left corner
 * @param {number} [params.bottom_right] - Radius for bottom-right corner
 * @param {boolean} [params.maintain_aspect] - Whether to maintain aspect ratio
 * @returns {Promise<{success: boolean}>}
 */
export async function setNodeCornerRadii(params) {
  const { nodeId, all, top_left, top_right, bottom_left, bottom_right, maintain_aspect } = params;
  const node = await figma.getNodeByIdAsync(nodeId);

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (
    node.type !== 'RECTANGLE' &&
    node.type !== 'FRAME' &&
    node.type !== 'COMPONENT' &&
    node.type !== 'INSTANCE'
  ) {
    throw new Error('Corner radii can only be set on rectangle, frame, component, or instance nodes');
  }

  if (all !== undefined) {
    node.cornerRadius = all;
    if (
      node.cornerRadius !== all &&
      node.topLeftRadius !== undefined
    ) {
      node.topLeftRadius = all;
      node.topRightRadius = all;
      node.bottomLeftRadius = all;
      node.bottomRightRadius = all;
    }
  } else {
    if (top_left !== undefined) node.topLeftRadius = top_left;
    if (top_right !== undefined) node.topRightRadius = top_right;
    if (bottom_left !== undefined) node.bottomLeftRadius = bottom_left;
    if (bottom_right !== undefined) node.bottomRightRadius = bottom_right;
  }

  if (maintain_aspect) {
    const radii = [
      node.topLeftRadius,
      node.topRightRadius,
      node.bottomLeftRadius,
      node.bottomRightRadius
    ].filter(r => typeof r === 'number');
    if (radii.length > 0) {
      const minRadius = Math.min(...radii);
      node.topLeftRadius = minRadius;
      node.topRightRadius = minRadius;
      node.bottomLeftRadius = minRadius;
      node.bottomRightRadius = minRadius;
    }
  }

  return { success: true };
}

/**
 * Sets corner radii for multiple nodes with per-corner control
 * @async
 * @function setNodesCornerRadii
 * @param {object} params - Parameters
 * @param {Array<object>} params.radii - Array of node configurations
 * @param {string} params.radii[].node_id - ID of the node to modify
 * @param {number} [params.radii[].all] - Uniform radius for all corners
 * @param {number} [params.radii[].top_left] - Radius for top-left corner
 * @param {number} [params.radii[].top_right] - Radius for top-right corner
 * @param {number} [params.radii[].bottom_left] - Radius for bottom-left corner
 * @param {number} [params.radii[].bottom_right] - Radius for bottom-right corner
 * @param {object} [params.options] - Optional configuration
 * @param {boolean} [params.options.skip_errors] - Whether to continue on errors
 * @param {boolean} [params.options.maintain_aspect] - Whether to maintain aspect ratio
 * @returns {Promise<{success: boolean, modifiedNodes: string[], errors?: string[]}>}
 */
export async function setNodesCornerRadii(params) {
  const { radii = [], options = {} } = params;
  const modifiedNodes = [];
  const errors = [];

  for (const config of radii) {
    try {
      const node = await figma.getNodeByIdAsync(config.node_id);

      if (!node) {
        throw new Error(`Node not found: ${config.node_id}`);
      }

      if (
        node.type !== 'RECTANGLE' &&
        node.type !== 'FRAME' &&
        node.type !== 'COMPONENT' &&
        node.type !== 'INSTANCE'
      ) {
        throw new Error(`Node ${config.node_id} doesn't support corner radii`);
      }

      if (config.all !== undefined) {
        node.cornerRadius = config.all;
        if (
          node.cornerRadius !== config.all &&
          node.topLeftRadius !== undefined
        ) {
          node.topLeftRadius = config.all;
          node.topRightRadius = config.all;
          node.bottomLeftRadius = config.all;
          node.bottomRightRadius = config.all;
        }
      } else {
        if (config.top_left !== undefined) node.topLeftRadius = config.top_left;
        if (config.top_right !== undefined) node.topRightRadius = config.top_right;
        if (config.bottom_left !== undefined) node.bottomLeftRadius = config.bottom_left;
        if (config.bottom_right !== undefined) node.bottomRightRadius = config.bottom_right;
      }

      if (options.maintain_aspect) {
        const radii = [
          node.topLeftRadius,
          node.topRightRadius,
          node.bottomLeftRadius,
          node.bottomRightRadius
        ].filter(r => typeof r === 'number');
        if (radii.length > 0) {
          const minRadius = Math.min(...radii);
          node.topLeftRadius = minRadius;
          node.topRightRadius = minRadius;
          node.bottomLeftRadius = minRadius;
          node.bottomRightRadius = minRadius;
        }
      }

      modifiedNodes.push(config.node_id);
    } catch (error) {
      if (options.skip_errors) {
        errors.push(`Failed on node ${config.node_id}: ${error.message}`);
        continue;
      }
      throw error;
    }
  }

  // Select modified nodes
  if (modifiedNodes.length > 0) {
    const nodes = [];
    for (const id of modifiedNodes) {
      const node = await figma.getNodeByIdAsync(id);
      if (node) nodes.push(node);
    }
    figma.currentPage.selection = nodes;
  }

  return {
    success: true,
    modifiedNodes,
    errors: errors.length > 0 ? errors : undefined
  };
}

export const nodeOperations = {
  resizeNode,
  resizeNodes,
  moveNode,
  moveNodes,
  setNodeCornerRadii,
  setNodesCornerRadii,
  deleteNode,
  deleteNodes,
  convertRectangleToFrame,
  flattenNode,
  union_selection,
  subtract_selection,
  intersect_selection,
  exclude_selection,
  clone_node
};
