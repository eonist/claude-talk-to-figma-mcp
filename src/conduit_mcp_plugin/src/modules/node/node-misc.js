/**
 * Miscellaneous node operations for Figma nodes.
 * Exports: flattenNode, union_selection, subtract_selection, intersect_selection, exclude_selection
 */

/**
 * Flattens a node.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for flattening.
 * @param {string} params.nodeId - The ID of the node to flatten.
 * @returns {Promise<{success: boolean, nodeId: string}>} Flatten result.
 * @throws {Error} If nodeId is missing or node cannot be found.
 */
export async function flattenNode(params) {
  const { nodeId } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  figma.currentPage.selection = [node];
  const flattened = figma.flatten();
  return { success: true, nodeId: flattened.id };
}

/**
 * Perform a boolean operation (union, subtract, intersect, exclude) on an explicit array of nodes.
 * 
 * @param {object} params
 * @param {"union"|"subtract"|"intersect"|"exclude"} params.operation - The boolean operation to perform.
 * @param {string[]} params.nodeIds - Array of node IDs (required, at least 2).
 * @returns {Promise<{success: boolean, resultNodeId?: string}>}
 */
export async function boolean_operation(params) {
  const { operation, nodeIds } = params;
  if (!Array.isArray(nodeIds) || nodeIds.length < 2) {
    throw new Error("Need at least 2 nodeIds for boolean operation");
  }

  // Gather nodes
  const nodes = [];
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  if (nodes.length < 2) {
    throw new Error("Could not find at least 2 valid nodes for boolean operation");
  }

  // Perform the operation with explicit array and parent
  let resultNode;
  switch (operation) {
    case "union":
      resultNode = figma.union(nodes, figma.currentPage);
      break;
    case "subtract":
      resultNode = figma.subtract(nodes, figma.currentPage);
      break;
    case "intersect":
      resultNode = figma.intersect(nodes, figma.currentPage);
      break;
    case "exclude":
      resultNode = figma.exclude(nodes, figma.currentPage);
      break;
    default:
      throw new Error("Invalid boolean operation: " + operation);
  }

  return { success: true, resultNodeId: resultNode ? resultNode.id : undefined };
}
