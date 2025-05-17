/**
 * Miscellaneous node operations for Figma nodes.
 * Exports: flattenNode, union_selection, subtract_selection, intersect_selection, exclude_selection
 */

/**
 * Flattens a node
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
 * Boolean operations on selected nodes
 */
export async function union_selection(params) {
  // Assumes figma.currentPage.selection is set
  figma.union(figma.currentPage.selection, figma.currentPage);
  return { success: true };
}
export async function subtract_selection(params) {
  figma.subtract(figma.currentPage.selection, figma.currentPage);
  return { success: true };
}
export async function intersect_selection(params) {
  figma.intersect(figma.currentPage.selection, figma.currentPage);
  return { success: true };
}
export async function exclude_selection(params) {
  figma.exclude(figma.currentPage.selection, figma.currentPage);
  return { success: true };
}
