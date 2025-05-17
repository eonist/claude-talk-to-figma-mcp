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
 * Perform a boolean operation (union, subtract, intersect, exclude) on nodes or selection.
 * 
 * @param {object} params
 * @param {"union"|"subtract"|"intersect"|"exclude"} params.operation - The boolean operation to perform.
 * @param {boolean} [params.selection] - If true, use the current selection.
 * @param {string} [params.nodeId] - Single node ID.
 * @param {string[]} [params.nodeIds] - Array of node IDs.
 * @returns {Promise<{success: boolean, resultNodeId?: string}>}
 */
export async function boolean_operation(params) {
  const { operation, selection, nodeId, nodeIds } = params;
  let nodes = [];

  // 1. Gather nodes
  if (selection) {
    nodes = figma.currentPage.selection;
  } else {
    if (nodeIds && nodeIds.length) {
      for (const id of nodeIds) {
        const node = await figma.getNodeByIdAsync(id);
        if (node) nodes.push(node);
      }
    }
    if (nodeId) {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (node) nodes.push(node);
    }
  }

  if (nodes.length < 2) {
    throw new Error("Need at least 2 nodes for boolean operation");
  }

  // 2. Set selection
  figma.currentPage.selection = nodes;

  // 3. Perform the operation
  let resultNode;
  switch (operation) {
    case "union":
      resultNode = figma.union();
      break;
    case "subtract":
      resultNode = figma.subtract();
      break;
    case "intersect":
      resultNode = figma.intersect();
      break;
    case "exclude":
      resultNode = figma.exclude();
      break;
    default:
      throw new Error("Invalid boolean operation: " + operation);
  }

  return { success: true, resultNodeId: resultNode ? resultNode.id : undefined };
}
