/**
 * Clone operations for Figma nodes.
 * Exports: clone_node
 */

/**
 * Clones one or more nodes by ID, with optional positions, offsets, and parent.
 * @async
 * @function clone_node
 */
export async function clone_node(params) {
  let nodesArr;
  if (params.nodes) {
    nodesArr = params.nodes;
  } else if (params.node) {
    nodesArr = [params.node];
  } else {
    nodesArr = [params];
  }
  nodesArr = nodesArr.filter(Boolean);
  const newNodeIds = [];
  for (const cfg of nodesArr) {
    const { nodeId, position, offsetX = 0, offsetY = 0, parentId } = cfg || {};
    if (!nodeId) throw new Error("Missing nodeId parameter");
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
    if (typeof node.clone !== "function") throw new Error(`Node with ID ${nodeId} cannot be cloned`);
    const newNode = node.clone();
    let pos = null;
    if (position) {
      pos = position;
    } else if (offsetX || offsetY) {
      pos = {
        x: (node.x || 0) + offsetX,
        y: (node.y || 0) + offsetY
      };
    }
    if (pos && "x" in newNode && "y" in newNode) {
      newNode.x = pos.x;
      newNode.y = pos.y;
    }
    let parent = null;
    if (parentId) {
      parent = await figma.getNodeByIdAsync(parentId);
      if (!parent || typeof parent.appendChild !== "function") {
        throw new Error(`Parent node not found or cannot accept children: ${parentId}`);
      }
      parent.appendChild(newNode);
    } else if (node.parent && typeof node.parent.appendChild === "function") {
      node.parent.appendChild(newNode);
    }
    newNodeIds.push(newNode.id);
  }
  return { newNodeIds };
}
