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
 * Boolean operations on selected nodes.
 *
 * @async
 * @function
 * @param {Object} params - (Unused) Parameters for the operation.
 * @returns {Promise<{success: boolean}>} Operation result.
 * @throws {Error} If figma.currentPage.selection is not set or operation fails.
 */
export async function union_selection(params) {
  // Assumes figma.currentPage.selection is set
  figma.union(figma.currentPage.selection, figma.currentPage);
  return { success: true };
}
/**
 * @async
 * @function
 * @param {Object} params - (Unused) Parameters for the operation.
 * @returns {Promise<{success: boolean}>} Operation result.
 * @throws {Error} If figma.currentPage.selection is not set or operation fails.
 */
export async function subtract_selection(params) {
  figma.subtract(figma.currentPage.selection, figma.currentPage);
  return { success: true };
}
/**
 * @async
 * @function
 * @param {Object} params - (Unused) Parameters for the operation.
 * @returns {Promise<{success: boolean}>} Operation result.
 * @throws {Error} If figma.currentPage.selection is not set or operation fails.
 */
export async function intersect_selection(params) {
  figma.intersect(figma.currentPage.selection, figma.currentPage);
  return { success: true };
}
/**
 * @async
 * @function
 * @param {Object} params - (Unused) Parameters for the operation.
 * @returns {Promise<{success: boolean}>} Operation result.
 * @throws {Error} If figma.currentPage.selection is not set or operation fails.
 */
export async function exclude_selection(params) {
  figma.exclude(figma.currentPage.selection, figma.currentPage);
  return { success: true };
}
