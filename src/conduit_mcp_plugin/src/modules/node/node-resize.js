/**
 * Node resizing operations for Figma nodes.
 * Exports: resizeNode, resizeNodes
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
  if (!node) throw new Error(`Node not found: ${nodeId}`);
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
