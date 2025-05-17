/**
 * Node modification operations for Figma nodes.
 * Exports: resizeNode, resizeNodes, moveNode, moveNodes, setNodeCornerRadii, setNodesCornerRadii
 */

/**
 * Resizes a node to the specified dimensions.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for resizing.
 * @param {string} params.nodeId - The ID of the node to resize.
 * @param {number} params.width - The new width.
 * @param {number} params.height - The new height.
 * @returns {Promise<{success: boolean}>} Resize result.
 * @throws {Error} If nodeId is missing or node cannot be found.
 */
export async function resizeNode(params) {
  const { nodeId, width, height } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  node.resize(width, height);
  return { success: true };
}

/**
 * Resizes multiple nodes to the same dimensions.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for resizing.
 * @param {Array<string>} params.nodeIds - Array of node IDs to resize.
 * @param {Object} params.targetSize - Target size {width, height}.
 * @returns {Promise<{success: boolean, resized: number}>} Resize result.
 * @throws {Error} If nodeIds or targetSize is missing.
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
 * Moves a node to a new position.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for moving.
 * @param {string} params.nodeId - The ID of the node to move.
 * @param {number} params.x - The new X position.
 * @param {number} params.y - The new Y position.
 * @returns {Promise<{success: boolean}>} Move result.
 * @throws {Error} If nodeId is missing or node cannot be found.
 */
export async function moveNode(params) {
  const { nodeId, x, y } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  node.x = x;
  node.y = y;
  return { success: true };
}

/**
 * Moves multiple nodes to a new position.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for moving.
 * @param {Array<string>} params.nodeIds - Array of node IDs to move.
 * @param {number} params.x - The new X position.
 * @param {number} params.y - The new Y position.
 * @returns {Promise<{success: boolean, moved: number}>} Move result.
 * @throws {Error} If nodeIds is missing.
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
 * Sets custom corner radii for a single node.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for corner radii.
 * @param {string} params.nodeId - The ID of the node.
 * @param {number} [params.all] - Uniform radius for all corners.
 * @param {number} [params.top_left] - Top-left corner radius.
 * @param {number} [params.top_right] - Top-right corner radius.
 * @param {number} [params.bottom_left] - Bottom-left corner radius.
 * @param {number} [params.bottom_right] - Bottom-right corner radius.
 * @param {boolean} [params.maintain_aspect] - If true, sets all corners to the minimum radius.
 * @returns {Promise<{success: boolean}>} Operation result.
 * @throws {Error} If nodeId is missing, node cannot be found, or node type is unsupported.
 */
export async function setNodeCornerRadii(params) {
  const { nodeId, all, top_left, top_right, bottom_left, bottom_right, maintain_aspect } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
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
 * Sets corner radii for multiple nodes with per-corner control.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for batch corner radii.
 * @param {Array<Object>} params.radii - Array of radii configs ({node_id, all, top_left, top_right, bottom_left, bottom_right}).
 * @param {Object} [params.options] - Optional options ({maintain_aspect, skip_errors}).
 * @returns {Promise<{success: boolean, modifiedNodes: Array<string>, errors?: Array<string>}>} Operation result.
 * @throws {Error} If a node cannot be found or is unsupported, unless skip_errors is set.
 */
export async function setNodesCornerRadii(params) {
  const { radii = [], options = {} } = params;
  const modifiedNodes = [];
  const errors = [];
  for (const config of radii) {
    try {
      const node = await figma.getNodeByIdAsync(config.node_id);
      if (!node) throw new Error(`Node not found: ${config.node_id}`);
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
