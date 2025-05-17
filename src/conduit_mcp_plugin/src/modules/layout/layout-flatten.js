/**
 * Flatten operations for Figma nodes.
 * Exports: flatten_nodes
 */

/**
 * Batch flatten nodes: flattens each node in the nodeIds array.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for flattening nodes.
 * @param {Array<string>} params.nodeIds - Array of node IDs to flatten.
 * @returns {Promise<{success: boolean, flattened: Array<string>}>} Object with success flag and array of flattened node IDs.
 * @throws {Error} If nodeIds is missing/invalid, or nodes cannot be found or flattened.
 */
export async function flatten_nodes(params) {
  let nodeIds = [];
  if (params && params.selection) {
    // Flatten all currently selected nodes
    nodeIds = (figma.currentPage.selection || []).map(node => node.id);
    if (nodeIds.length === 0) {
      throw new Error("No nodes selected to flatten");
    }
  } else if (params && Array.isArray(params.nodeIds)) {
    nodeIds = params.nodeIds;
  } else if (params && typeof params.nodeId === "string") {
    nodeIds = [params.nodeId];
  } else {
    throw new Error("Must provide 'nodeId', 'nodeIds', or 'selection: true'");
  }
  const flattened = [];
  for (const nodeId of nodeIds) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }
    if (!("children" in node) || typeof node.flatten !== "function") {
      throw new Error(`Node with ID ${nodeId} cannot be flattened`);
    }
    // Flatten the node's children
    const result = node.flatten(node.children);
    flattened.push(result.id);
  }
  return { success: true, flattened };
}
