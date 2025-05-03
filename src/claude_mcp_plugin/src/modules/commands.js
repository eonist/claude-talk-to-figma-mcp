// Command registry and handler

// Command registry
const commandRegistry = {};

/**
 * Registers a command function with the specified name
 * 
 * @param {string} name - The command name to register
 * @param {Function} fn - The function to execute for this command
 */
function registerCommand(name, fn) {
  commandRegistry[name] = fn;
}

/**
 * Initializes all commands by registering them in the command registry
 * This function is called once during plugin initialization
 */
export function initializeCommands() {
  // Document operations
  registerCommand('get_document_info', documentOperations.getDocumentInfo);
  registerCommand('get_selection', documentOperations.getSelection);
  registerCommand('get_node_info', documentOperations.getNodeInfo);
  registerCommand('get_nodes_info', documentOperations.getNodesInfo);
  
  // Shape operations
  registerCommand('create_rectangle', shapeOperations.createRectangle);
  registerCommand('create_frame', shapeOperations.createFrame);
  registerCommand('create_ellipse', shapeOperations.createEllipse);
  registerCommand('create_polygon', shapeOperations.createPolygon);
  registerCommand('create_star', shapeOperations.createStar);
  registerCommand('create_vector', shapeOperations.createVector);
  registerCommand('create_line', shapeOperations.createLine);
  registerCommand('set_corner_radius', shapeOperations.setCornerRadius);
  registerCommand('resize_node', shapeOperations.resizeNode);
  registerCommand('delete_node', shapeOperations.deleteNode);
  registerCommand('move_node', shapeOperations.moveNode);
  registerCommand('clone_node', shapeOperations.cloneNode);
  registerCommand('flatten_node', shapeOperations.flattenNode);
  
  // Text operations
  registerCommand('create_text', textOperations.createText);
  registerCommand('set_text_content', textOperations.setTextContent);
  registerCommand('scan_text_nodes', textOperations.scanTextNodes);
  registerCommand('set_multiple_text_contents', textOperations.setMultipleTextContents);
  registerCommand('set_font_name', textOperations.setFontName);
  registerCommand('set_font_size', textOperations.setFontSize);
  registerCommand('set_font_weight', textOperations.setFontWeight);
  registerCommand('set_letter_spacing', textOperations.setLetterSpacing);
  registerCommand('set_line_height', textOperations.setLineHeight);
  registerCommand('set_paragraph_spacing', textOperations.setParagraphSpacing);
  registerCommand('set_text_case', textOperations.setTextCase);
  registerCommand('set_text_decoration', textOperations.setTextDecoration);
  registerCommand('get_styled_text_segments', textOperations.getStyledTextSegments);
  registerCommand('load_font_async', textOperations.loadFontAsyncWrapper);
  
  // Style operations
  registerCommand('set_fill_color', styleOperations.setFillColor);
  registerCommand('set_stroke_color', styleOperations.setStrokeColor);
  registerCommand('get_styles', styleOperations.getStyles);
  registerCommand('set_effects', styleOperations.setEffects);
  registerCommand('set_effect_style_id', styleOperations.setEffectStyleId);
  
  // Component operations
  registerCommand('get_local_components', componentOperations.getLocalComponents);
  registerCommand('get_remote_components', componentOperations.getRemoteComponents);
  registerCommand('create_component_instance', componentOperations.createComponentInstance);
  registerCommand('export_node_as_image', componentOperations.exportNodeAsImage);
  
  // Layout operations
  registerCommand('set_auto_layout', layoutOperations.setAutoLayout);
  registerCommand('set_auto_layout_resizing', layoutOperations.setAutoLayoutResizing);
  registerCommand('group_nodes', layoutOperations.groupNodes);
  registerCommand('ungroup_nodes', layoutOperations.ungroupNodes);
  registerCommand('insert_child', layoutOperations.insertChild);
  
  // Rename operations
  registerCommand('rename_layers', renameOperations.rename_layers);
  registerCommand('ai_rename_layers', renameOperations.ai_rename_layers);
  registerCommand('rename_layer', renameOperations.rename_layer);
  registerCommand('rename_multiple', renameOperations.rename_multiples);
}

/**
 * Handles an incoming command by routing it to the appropriate handler function
 * 
 * @param {string} command - The command to execute
 * @param {object} params - Parameters for the command
 * @returns {Promise<any>} - The result of the command execution
 * @throws {Error} - If the command is unknown or execution fails
 */
export async function handleCommand(command, params) {
  console.log(`Received command: ${command}`);
  
  if (!commandRegistry[command]) {
    throw new Error(`Unknown command: ${command}`);
  }
  
  return await commandRegistry[command](params);
}

// Export for build compatibility
export const commandOperations = {
  initializeCommands,
  handleCommand
};
