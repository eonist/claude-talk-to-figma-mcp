// Rename module

/**
 * Rename Multiple Figma Layers
 *
 * Renames multiple layers in a Figma document. Supports regex replacement or template-based renaming.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string[]} params.layer_ids - Array of Figma layer IDs to rename.
 * @param {string} [params.new_name] - New name template (ignored if regex parameters are provided).
 * @param {string} [params.match_pattern] - Regex pattern to match in existing names.
 * @param {string} [params.replace_with] - Replacement string for matched pattern.
 *
 * @returns {Promise<object>} Object indicating success and count of renamed layers.
 *
 * @throws Will throw an error if any layer is locked or hidden, or if a required layer cannot be found.
 *
 * @example
 * rename_layers({
 *   layer_ids: ['id1', 'id2', 'id3'],
 *   new_name: "Layer ${asc} - ${current}"
 * });
 *
 * @example
 * rename_layers({
 *   layer_ids: ['id1', 'id2'],
 *   match_pattern: "^Old",
 *   replace_with: ""
 * });
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
 *
 * Uses Figma's AI to automatically generate new names for layers based on a context prompt.
 *
 * @param {object} params - Parameters for AI rename.
 * @param {string[]} params.layer_ids - Array of Figma layer IDs to rename.
 * @param {string} params.context_prompt - Context prompt for AI renaming.
 *
 * @returns {Promise<object>} Object with success status and new names or error.
 *
 * @example
 * ai_rename_layers({
 *   layer_ids: ['nodeId1', 'nodeId2'],
 *   context_prompt: "Rename these layers to align with our modern branding guidelines."
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
 * Rename a Single Figma Layer with Optional Auto-Rename for Text Nodes
 *
 * Renames a single Figma node by ID. For TEXT nodes, can toggle auto-renaming.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string} params.nodeId - The ID of the node to rename.
 * @param {string} params.newName - The new name to assign.
 * @param {boolean} [params.setAutoRename] - Optional flag to enable/disable auto-renaming (TEXT nodes).
 *
 * @returns {Promise<object>} Object with success status, nodeId, originalName, and newName.
 *
 * @throws Will throw an error if the node is not found.
 *
 * @example
 * await rename_layer({
 *   nodeId: "12345",
 *   newName: "Updated Layer Name",
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
 * Rename Multiple Figma Layers with Distinct Names
 *
 * Renames multiple layers by assigning unique new names to each.
 *
 * @param {object} params - Parameters for renaming.
 * @param {string[]} params.layer_ids - Array of Figma layer IDs.
 * @param {string[]} params.new_names - Array of new names corresponding to each layer ID.
 *
 * @returns {Promise<object>} Object indicating success and array of results.
 *
 * @throws Will throw an error if layer_ids or new_names are not arrays or lengths differ.
 *
 * @example
 * const result = await rename_multiples({
 *   layer_ids: ['id1', 'id2'],
 *   new_names: ['New Name for id1', 'New Name for id2']
 * });
 * console.log(result);
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

// Export the operations as a group
export const renameOperations = {
  rename_layers,
  ai_rename_layers,
  rename_layer,
  rename_multiples
};
