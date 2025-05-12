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
 * Rename Multiple Figma Layers
 * @async
 * @function rename_layers
 * 
 * Renames multiple layers in a Figma document using either template-based naming or regex pattern replacement.
 * Template naming supports special placeholders:
 * - ${current}: The current name of the layer
 * - ${asc}: Ascending number (1, 2, 3...)
 * - ${desc}: Descending number (total, total-1...)
 *
 * @param {object} params - Parameters for renaming operation
 * @param {string[]} params.layer_ids - Array of Figma layer IDs to rename
 * @param {string} [params.new_name] - Template string for new names. Uses placeholders ${current}, ${asc}, ${desc}
 * @param {string} [params.match_pattern] - Regex pattern to find in existing names. Used with replace_with
 * @param {string} [params.replace_with] - Replacement string for regex matches. Used with match_pattern
 *
 * @returns {Promise<object>} Object containing:
 *   - success: boolean indicating if operation completed
 *   - renamed_count: number of layers successfully renamed
 *
 * @throws {Error} When:
 *   - Any target layer is locked or hidden
 *   - A layer ID cannot be found
 *   - A layer lacks the name property
 *
 * @example Template-based renaming:
 * await rename_layers({
 *   layer_ids: ['id1', 'id2', 'id3'],
 *   new_name: "Component ${asc} - ${current}"
 * });
 * // Results: "Component 1 - Original", "Component 2 - Original2"...
 *
 * @example Regex-based renaming:
 * await rename_layers({
 *   layer_ids: ['id1', 'id2'],
 *   match_pattern: "Button\\s*-\\s*",
 *   replace_with: "btn_"
 * });
 * // "Button - Save" becomes "btn_Save"
 */
export async function rename_layers(params) {
  const { layer_ids, new_name, match_pattern, replace_with } = params || {};
  
  const nodes = await Promise.all(
    layer_ids.map(id => figma.getNodeByIdAsync(id))
  );
  
  const total = nodes.length;
  
  nodes.forEach((node, i) => {
    // Skip nodes that are not valid or lack a name property
    if (!node || !('name' in node)) return;
    
    // Do not allow renaming of nodes that are hidden or locked
    if (!node.visible || node.locked) {
      throw new Error('Cannot rename locked or hidden layer: ' + node.id);
    }
    
    // Apply regex replacement mode if both parameters are provided
    if (match_pattern && replace_with) {
      node.name = node.name.replace(new RegExp(match_pattern), replace_with);
    } else {
      // Otherwise, generate a new name using the template and placeholders
      let base = new_name;
      base = base.replace(/\${current}/g, node.name);
      base = base.replace(/\${asc}/g, (i + 1).toString());
      base = base.replace(/\${desc}/g, (total - i).toString());
      node.name = base;
    }
  });
  
  return { success: true, renamed_count: total };
}

/**
 * Rename Multiple Figma Layers Using AI Assistance
 * @async
 * @function ai_rename_layers
 *
 * Leverages Figma's AI capabilities to intelligently rename layers based on their content
 * and context. Useful for batch renaming layers to follow naming conventions or improve clarity.
 *
 * @param {object} params - Parameters for AI-assisted renaming
 * @param {string[]} params.layer_ids - Array of Figma layer IDs to rename
 * @param {string} params.context_prompt - Instructions for AI renaming. Can include:
 *   - Naming conventions to follow
 *   - Style guidelines
 *   - Specific terminology preferences
 *
 * @returns {Promise<object>} Object containing:
 *   - success: boolean indicating if operation succeeded
 *   - names: array of new names (if successful)
 *   - error: error message (if failed)
 *
 * @example Using specific naming conventions:
 * await ai_rename_layers({
 *   layer_ids: ['nodeId1', 'nodeId2'],
 *   context_prompt: "Rename components using atomic design principles (atoms, molecules, organisms)"
 * });
 *
 * @example Improving descriptiveness:
 * await ai_rename_layers({
 *   layer_ids: ['nodeId1', 'nodeId2'],
 *   context_prompt: "Make layer names more descriptive based on their visual appearance and function"
 * });
 */
export async function ai_rename_layers(params) {
  const { layer_ids, context_prompt } = params || {};
  
  const nodes = await Promise.all(
    layer_ids.map(id => figma.getNodeByIdAsync(id))
  );
  
  const result = await figma.ai.renameLayersAsync(nodes, {
    context: context_prompt
  });
  
  if (result.status === 'SUCCESS') {
    return { success: true, names: result.names };
  } else {
    return { success: false, error: result.error };
  }
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
 * Rename Multiple Figma Layers with Individual Names
 * @async
 * @function rename_multiples
 *
 * Assigns specific names to multiple layers in a single operation.
 * Useful when each layer needs a unique, predetermined name.
 *
 * @param {object} params - Parameters for batch renaming
 * @param {string[]} params.layer_ids - Array of layer IDs to rename
 * @param {string[]} params.new_names - Array of new names to assign
 *   Must match layer_ids array in length and order
 *
 * @returns {Promise<object>} Object containing:
 *   - success: boolean indicating overall success
 *   - results: array of objects with:
 *     - nodeId: ID of the processed node
 *     - status: "renamed" or "error"
 *     - result: details of rename operation or error message
 *
 * @throws {Error} When:
 *   - layer_ids or new_names are not arrays
 *   - Arrays have different lengths
 *
 * @example Renaming multiple layers:
 * await rename_multiples({
 *   layer_ids: ['id1', 'id2'],
 *   new_names: ['Header Section', 'Navigation Menu']
 * });
 */
export async function rename_multiples(params) {
  const { layer_ids, new_names } = params || {};
  
  if (!Array.isArray(layer_ids) || !Array.isArray(new_names)) {
    throw new Error("layer_ids and new_names must be arrays");
  }
  
  if (layer_ids.length !== new_names.length) {
    throw new Error("layer_ids and new_names must be of equal length");
  }
  
  const results = [];
  
  for (let i = 0; i < layer_ids.length; i++) {
    const nodeId = layer_ids[i];
    const newName = new_names[i];
    try {
      const result = await rename_layer({ nodeId, newName });
      results.push({ nodeId, status: "renamed", result });
    } catch (error) {
      results.push({ nodeId, status: "error", error: error.message || String(error) });
    }
  }
  
  return { success: true, results };
}

/**
 * Collection of all rename operation functions for convenience.
 *
 * @namespace renameOperations
 * @property {Function} rename_layers - Rename multiple layers using a template or regex.
 * @property {Function} ai_rename_layers - AI-assisted batch renaming of layers.
 * @property {Function} rename_layer - Rename a single layer with optional auto-rename for text.
 * @property {Function} rename_multiples - Rename multiple layers to specific names.
 */
export const renameOperations = {
  rename_layers,
  ai_rename_layers,
  rename_layer,
  rename_multiples
};
