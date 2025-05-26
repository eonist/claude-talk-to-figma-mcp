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
   console.log("🚨 flattenNode")
  // Support flattening by nodeIds array, nodeId, or selection
  if (Array.isArray(params.nodeIds)) {
    // Flatten multiple nodes by nodeIds
    const nodes = [];
    for (const id of params.nodeIds) {
      const node = await figma.getNodeByIdAsync(id);
      if (!node) throw new Error(`Node not found: ${id}`);
      nodes.push(node);
    }
    if (nodes.length < 2) throw new Error("Need at least 2 nodes to flatten");
    // Debug: log node info before flattening
    // eslint-disable-next-line no-console
    const parentIds = nodes.map(n => n.parent && n.parent.id);
    const parentTypes = nodes.map(n => n.parent && n.parent.type);
    const pageId = figma.currentPage.id;
    console.log("[flattenNode] nodeIds:", params.nodeIds,
      "types:", nodes.map(n => n.type),
      "parents:", parentIds,
      "parentTypes:", parentTypes,
      "locked:", nodes.map(n => n.locked),
      "removed:", nodes.map(n => n.removed),
      "names:", nodes.map(n => n.name),
      "currentPageId:", pageId
    );
    // Detach instances, skip locked/removed nodes, clone if possible
    const prepared = [];
    for (let n of nodes) {
      if (n.locked || n.removed) {
        // eslint-disable-next-line no-console
        console.warn("[flattenNode] Skipping locked or removed node:", n.id, n.name, n.type);
        continue;
      }
      if (n.type === "INSTANCE" && typeof n.detachInstance === "function") {
        // eslint-disable-next-line no-console
        console.log("[flattenNode] Detaching instance:", n.id, n.name);
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
      return { success: true, nodeId: flattened.id, ids: [flattened.id] };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[flattenNode] Flatten failed:", error && error.message, error);
      throw error;
    }
  } else if (params.nodeId) {
    // Flatten a single node (legacy)
    const node = await figma.getNodeByIdAsync(params.nodeId);
    if (!node) throw new Error(`Node not found: ${params.nodeId}`);
    figma.currentPage.selection = [node];
    const flattened = figma.flatten();
    return { success: true, nodeId: flattened.id, ids: [flattened.id] };
  } else if (params.selection) {
    // Flatten current selection
    const sel = figma.currentPage.selection;
    if (!sel || sel.length < 2) throw new Error("No nodes selected to flatten");
    const parent = sel[0].parent;
    if (!parent) throw new Error("Selected nodes must have a parent");
    if (!sel.every(n => n.parent === parent)) throw new Error("All selected nodes must have the same parent");
    const flattened = figma.flatten(sel, parent);
    return { success: true, nodeId: flattened.id, ids: [flattened.id] };
  } else {
    throw new Error("Must provide nodeIds, nodeId, or selection for flattenNode");
  }
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
