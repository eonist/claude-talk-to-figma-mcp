/**
 * Boolean operations module.
 * Provides functions to perform boolean operations (union, subtract, intersect, exclude) on Figma nodes via MCP.
 *
 * Exposed functions:
 * - union_selection(params): Promise<{ success: boolean }>
 * - subtract_selection(params): Promise<{ success: boolean }>
 * - intersect_selection(params): Promise<{ success: boolean }>
 * - exclude_selection(params): Promise<{ success: boolean }>
 *
 * @example
 * import { booleanOperations } from './modules/boolean.js';
 * const result = await booleanOperations.union_selection({ nodeIds: [...] });
 * console.log('Union result', result);
 */

/**
 * Applies union boolean operation to selected nodes
 * @async
 * @function union_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to union
 * @returns {Promise<{success: boolean}>}
 */
export async function union_selection(params) {
  const { nodeIds } = params;
  const nodes = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.union();
  return { success: true };
}

/**
 * Applies subtract boolean operation to selected nodes
 * @async
 * @function subtract_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs (first is bottom shape, rest are subtracted)
 * @returns {Promise<{success: boolean}>}
 */
export async function subtract_selection(params) {
  const { nodeIds } = params;
  const nodes = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.subtract();
  return { success: true };
}

/**
 * Applies intersect boolean operation to selected nodes
 * @async
 * @function intersect_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to intersect
 * @returns {Promise<{success: boolean}>}
 */
export async function intersect_selection(params) {
  const { nodeIds } = params;
  const nodes = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.intersect();
  return { success: true };
}

/**
 * Applies exclude boolean operation to selected nodes
 * @async
 * @function exclude_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to exclude
 * @returns {Promise<{success: boolean}>}
 */
export async function exclude_selection(params) {
  const { nodeIds } = params;
  const nodes = [];
  
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) nodes.push(node);
  }
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.exclude();
  return { success: true };
}

export const booleanOperations = {
  union_selection,
  subtract_selection,
  intersect_selection,
  exclude_selection
};
