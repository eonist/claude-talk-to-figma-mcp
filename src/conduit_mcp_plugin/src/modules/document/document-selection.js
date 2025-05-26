/**
 * Document selection operations for Figma.
 * Exports: getSelection
 */

/**
 * Retrieves information about the currently selected nodes on the active Figma page.
 *
 * @async
 * @function
 * @returns {Promise<{selectionCount: number, selection: Array<{id: string, name: string, type: string, visible: boolean}>}>}
 *   An object with the count of selected nodes and an array of selection details.
 */
export async function getSelection() {
  const selection = figma.currentPage.selection || [];
  return {
    selectionCount: selection.length,
    selection: selection.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type || "UNKNOWN",
      visible: node.visible,
    })),
  };
}

/**
 * Sets the selection on the current page to the specified node(s) by ID.
 * Accepts a single nodeId (string) or an array of nodeIds (string[]).
 * Returns a summary of the new selection.
 *
 * @async
 * @function
 * @param {Object} params
 * @param {string|string[]} params.nodeId - A single node ID or array of node IDs.
 * @returns {Promise<{selected: Array<{id: string, name: string, type: string}>, notFound: Array<string>}>}
 */
export async function setSelection(params) {
  let nodeIds = [];
  if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
    nodeIds = params.nodeIds;
  } else if (typeof params.nodeId === "string") {
    nodeIds = [params.nodeId];
  } else {
    throw new Error("You must provide 'nodeId' or 'nodeIds'");
  }

  // Retrieve nodes asynchronously (always use async API)
  const nodes = await Promise.all(nodeIds.map(id => figma.getNodeByIdAsync(id)));
  const validNodes = nodes.filter(node => node && node.type !== "DOCUMENT" && node.type !== "PAGE" && node.parent && node.parent.type === "PAGE");
  const notFound = nodeIds.filter((_, i) => !validNodes.includes(nodes[i]));

  // Set the selection
  figma.currentPage.selection = validNodes;

  return {
    selected: validNodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type
    })),
    notFound
  };
}
