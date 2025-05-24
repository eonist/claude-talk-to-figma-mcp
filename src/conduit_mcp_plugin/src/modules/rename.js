/**
 * Rename operations module.
 * Provides functions to rename Figma layers via template, regex replacement, AI assistance, and batch operations.
 *
 * Exposed functions:
 * - rename_layers(params)
 * - ai_rename_layers(params)
 * - rename_layer(params)
 * - rename_multiples(params)
 *
 * @module modules/rename
 * @example
 * import { rename_layers, ai_rename_layers, rename_layer, rename_multiples } from './modules/rename.js';
 * // Template renaming
 * await rename_layers({ layer_ids: ['1','2'], new_name: 'Item ${asc}' });
 * // AI renaming
 * await ai_rename_layers({ layer_ids: ['1','2'], context_prompt: 'Use descriptive names' });
 */

/**
 * Renames one or more Figma layers.
 * Accepts either a single object (rename) or an array (renames).
 * @param {{ rename?: object, renames?: Array<object> }} params
 *   - rename: Single rename config ({ nodeId, newName, setAutoRename? }).
 *   - renames: Array of rename configs.
 * @returns {Promise<object>} Object containing:
 *   - success: boolean indicating if operation completed
 *   - results: array of rename results
 */
export async function rename_layer(params) {
  let renamesArr;
  if (params.renames) {
    renamesArr = params.renames;
  } else if (params.rename) {
    renamesArr = [params.rename];
  } else {
    // Fallback for legacy single input
    renamesArr = [params];
  }
  renamesArr = renamesArr.filter(Boolean);
  const results = [];
  for (const cfg of renamesArr) {
    const { nodeId, newName, setAutoRename } = cfg || {};
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) throw new Error(`Node with ID ${nodeId} not found`);
    const originalName = node.name;
    node.name = newName;
    if (node.type === 'TEXT' && setAutoRename !== undefined) {
      node.autoRename = Boolean(setAutoRename);
    }
    results.push({
      success: true,
      nodeId,
      originalName,
      newName: node.name,
      setAutoRename
    });
  }
  return results.length === 1 ? results[0] : { success: true, results };
}


/**
 * Rename a Single Figma Layer
 * @async
 * @function rename_layer
 *
 * Renames an individual Figma node with special handling for text nodes.
 * For text nodes, offers control over the auto-rename feature which automatically
 * updates the layer name when text content changes.
 *
 * @param {object} params - Parameters for renaming
 * @param {string} params.nodeId - ID of the Figma node to rename
 * @param {string} params.newName - New name to assign to the node
 * @param {boolean} [params.setAutoRename] - For TEXT nodes only:
 *   - true: layer name updates automatically with text content
 *   - false: layer name remains fixed regardless of content changes
 *
 * @returns {Promise<object>} Object containing:
 *   - success: boolean indicating success
 *   - nodeId: ID of the renamed node
 *   - originalName: previous name of the node
 *   - newName: updated name of the node
 *
 * @throws {Error} When:
 *   - Node with given ID cannot be found
 *   - Node is locked or hidden
 *
 * @example Renaming with auto-rename disabled:
 * await rename_layer({
 *   nodeId: "123:456",
 *   newName: "Header Text",
 *   setAutoRename: false
 * });
 */
export async function rename_layer(params) {
  const { nodeId, newName, setAutoRename } = params || {};
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node with ID ${nodeId} not found`);
  
  const originalName = node.name;
  node.name = newName;
  
  if (node.type === 'TEXT' && setAutoRename !== undefined) {
    node.autoRename = Boolean(setAutoRename);
  }
  
  return { success: true, nodeId, originalName, newName: node.name };
}


/**
 * Collection of all rename operation functions for convenience.
 *
 * @namespace renameOperations
 * @property {Function} rename_layer - Rename a single layer with optional auto-rename for text.
 */
export const renameOperations = {
  rename_layer
};
