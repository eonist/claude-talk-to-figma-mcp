/**
 * Grouping operations for Figma nodes.
 * Exports: groupNodes, ungroupNodes
 */

/**
 * Groups multiple Figma nodes into a single group.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for grouping nodes.
 * @param {Array<string>} params.nodeIds - Array of node IDs to group (must be at least two).
 * @param {string} [params.name] - Optional name for the group.
 * @returns {Promise<{id: string, name: string, type: string, children: Array<{id: string, name: string, type: string}>}>} Group info.
 * @throws {Error} If nodeIds is missing/invalid, nodes cannot be found, or do not share the same parent.
 */
export async function groupNodes(params) {
  const { nodeIds, name } = params || {};
  if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length < 2) {
    throw new Error("Must provide at least two nodeIds to group");
  }
  try {
    const nodesToGroup = [];
    for (const nodeId of nodeIds) {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
      nodesToGroup.push(node);
    }
    const parent = nodesToGroup[0].parent;
    for (const node of nodesToGroup) {
      if (node.parent !== parent) throw new Error("All nodes must have the same parent to be grouped");
    }
    const group = figma.group(nodesToGroup, parent);
    if (name) group.name = name;
    return {
      id: group.id,
      name: group.name,
      type: group.type,
      children: group.children.map(child => ({ id: child.id, name: child.name, type: child.type }))
    };
  } catch (error) {
    throw new Error(`Error grouping nodes: ${error.message}`);
  }
}

/**
 * Ungroups a Figma group or frame, promoting its children to the parent level.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for ungrouping.
 * @param {string} params.nodeId - The ID of the group or frame to ungroup.
 * @returns {Promise<{success: boolean, ungroupedCount: number, items: Array<{id: string, name: string, type: string}>}>} Ungroup result.
 * @throws {Error} If nodeId is missing, node cannot be found, or is not a group/frame.
 */
export async function ungroupNodes(params) {
  const { nodeId } = params || {};
  if (!nodeId) throw new Error("Missing nodeId parameter");
  try {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
    if (node.type !== "GROUP" && node.type !== "FRAME") {
      throw new Error(`Node with ID ${nodeId} is not a GROUP or FRAME`);
    }
    const parent = node.parent;
    const children = [...node.children];
    const ungroupedItems = figma.ungroup(node);
    return {
      success: true,
      ungroupedCount: ungroupedItems.length,
      items: ungroupedItems.map(item => ({ id: item.id, name: item.name, type: item.type }))
    };
  } catch (error) {
    throw new Error(`Error ungrouping node: ${error.message}`);
  }
}
