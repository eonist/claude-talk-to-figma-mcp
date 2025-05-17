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
 * Applies a union boolean operation to the specified Figma nodes.
 * All nodes in the array will be merged into a single shape.
 *
 * @async
 * @function union_selection
 * @param {object} params - Parameters for the union operation.
 * @param {string[]} params.nodeIds - Array of Figma node IDs to union. Each ID should reference a valid shape node.
 * @returns {Promise<{success: boolean}>} Resolves with success status if the operation completes.
 * @throws {Error} If fewer than 2 node IDs are provided.
 * @see {@link https://help.figma.com/hc/en-us/articles/360040451373-Boolean-operations-in-Figma}
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
 * Applies a subtract boolean operation to the specified Figma nodes.
 * The first node in the array is the base shape; all subsequent nodes are subtracted from it.
 *
 * @async
 * @function subtract_selection
 * @param {object} params - Parameters for the subtract operation.
 * @param {string[]} params.nodeIds - Array of Figma node IDs (first is the base shape, the rest are subtracted).
 * @returns {Promise<{success: boolean}>} Resolves with success status if the operation completes.
 * @throws {Error} If fewer than 2 node IDs are provided.
 * @see {@link https://help.figma.com/hc/en-us/articles/360040451373-Boolean-operations-in-Figma}
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
 * Applies an intersect boolean operation to the specified Figma nodes.
 * Only the overlapping area of all nodes will remain.
 *
 * @async
 * @function intersect_selection
 * @param {object} params - Parameters for the intersect operation.
 * @param {string[]} params.nodeIds - Array of Figma node IDs to intersect.
 * @returns {Promise<{success: boolean}>} Resolves with success status if the operation completes.
 * @throws {Error} If fewer than 2 node IDs are provided.
 * @see {@link https://help.figma.com/hc/en-us/articles/360040451373-Boolean-operations-in-Figma}
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
 * Applies an exclude boolean operation to the specified Figma nodes.
 * Only the non-overlapping areas of all nodes will remain.
 *
 * @async
 * @function exclude_selection
 * @param {object} params - Parameters for the exclude operation.
 * @param {string[]} params.nodeIds - Array of Figma node IDs to exclude.
 * @returns {Promise<{success: boolean}>} Resolves with success status if the operation completes.
 * @throws {Error} If fewer than 2 node IDs are provided.
 * @see {@link https://help.figma.com/hc/en-us/articles/360040451373-Boolean-operations-in-Figma}
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

/**
 * Collection of boolean operation functions for Figma nodes.
 * @namespace booleanOperations
 * @property {function} union_selection - Union operation
 * @property {function} subtract_selection - Subtract operation
 * @property {function} intersect_selection - Intersect operation
 * @property {function} exclude_selection - Exclude operation
 */
export const booleanOperations = {
  union_selection,
  subtract_selection,
  intersect_selection,
  exclude_selection
};
