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
  // Support flattening an array of sibling nodes, a single node, or selection
  let nodeIds = [];
  if (params && params.selection) {
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

  // If more than one node, try flattening as siblings
  if (nodeIds.length > 1) {
    const nodes = [];
    for (const id of nodeIds) {
      const node = await figma.getNodeByIdAsync(id);
      if (!node) throw new Error(`Node not found: ${id}`);
      nodes.push(node);
    }
    // Prepare nodes: detach instances, skip locked/removed, clone if possible
    // Detach instances, skip locked/removed nodes, clone if possible
    const prepared = [];
    for (let n of nodes) {
      if (n.locked || n.removed) {
        continue;
      }
      if (n.type === "INSTANCE" && typeof n.detachInstance === "function") {
        n = n.detachInstance();
      }
      if (n.clone) n = n.clone();
      prepared.push(n);
    }
    if (prepared.length < 2) throw new Error("Need at least 2 eligible nodes to flatten");
    // Ensure all are siblings (same parent)
    const parent = prepared[0].parent;
    if (!parent) throw new Error("Nodes must have a parent");
    if (!prepared.every(n => n.parent === parent)) throw new Error("All nodes to flatten must have the same parent");
    // Try flatten, catch and log errors
    try {
      const flattened = figma.flatten(prepared, parent);
      // Remove the original nodes (not the clones)
      for (const orig of nodes) {
        try {
          if (orig.remove) orig.remove();
        } catch (e) {}
      }
      return { success: true, nodeId: flattened.id, ids: [flattened.id] };
    } catch (error) {
      throw error;
    }
  }

  // Fallback: flatten a single node's children (legacy)
  const node = await figma.getNodeByIdAsync(nodeIds[0]);
  if (!node) throw new Error(`Node not found with ID: ${nodeIds[0]}`);
  if (!("children" in node) || typeof node.flatten !== "function") {
    throw new Error(`Node with ID ${nodeIds[0]} cannot be flattened`);
  }
  // Flatten the node's children
  const result = node.flatten(node.children);
  return { success: true, nodeId: result.id, ids: [result.id] };
}
