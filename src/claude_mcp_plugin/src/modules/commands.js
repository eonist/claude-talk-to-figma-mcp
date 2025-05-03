/**
 * Command Registry and Handler Module
 * 
 * This module manages the registration and execution of all available commands in the Figma plugin.
 * It provides a centralized system for registering command handlers and routing incoming commands
 * to their appropriate implementations.
 */

// Internal registry to store command handlers
const commandRegistry = {};

/**
 * Registers a command function with the specified name in the command registry
 * 
 * @param {string} name - The command name to register (e.g., 'create_rectangle', 'set_text_content')
 * @param {Function} fn - The handler function to execute for this command
 * @throws {Error} If the command name is already registered
 */
function registerCommand(name, fn) {
  commandRegistry[name] = fn;
}

/**
 * Initializes and registers all available commands in the plugin
 * This function is called once during plugin initialization to set up the command system
 * Commands are organized by functional categories for better maintainability
 */
export function initializeCommands() {
  // Document Operations
  // Handles document-level operations like getting document info and selection state
  registerCommand('get_document_info', documentOperations.getDocumentInfo);
  registerCommand('get_selection', documentOperations.getSelection);
  registerCommand('get_node_info', documentOperations.getNodeInfo);
  registerCommand('get_nodes_info', documentOperations.getNodesInfo);
  
  // Shape Operations
  // Manages creation and modification of basic geometric shapes and vectors
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
  
  // Text Operations
  // Handles text creation, styling, and manipulation operations
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
  
  // Style Operations
  // Controls visual styling like fills, strokes, and effects
  registerCommand('set_fill_color', styleOperations.setFillColor);
  registerCommand('set_stroke_color', styleOperations.setStrokeColor);
  registerCommand('get_styles', styleOperations.getStyles);
  registerCommand('set_effects', styleOperations.setEffects);
  registerCommand('set_effect_style_id', styleOperations.setEffectStyleId);
  
  // Component Operations
  // Manages Figma components and their instances
  registerCommand('get_local_components', componentOperations.getLocalComponents);
  registerCommand('get_remote_components', componentOperations.getRemoteComponents);
  registerCommand('create_component_instance', componentOperations.createComponentInstance);
  registerCommand('export_node_as_image', componentOperations.exportNodeAsImage);
  
  // Layout Operations
  // Controls layout properties, grouping, and hierarchy
  registerCommand('set_auto_layout', layoutOperations.setAutoLayout);
  registerCommand('set_auto_layout_resizing', layoutOperations.setAutoLayoutResizing);
  registerCommand('group_nodes', layoutOperations.groupNodes);
  registerCommand('ungroup_nodes', layoutOperations.ungroupNodes);
  registerCommand('insert_child', layoutOperations.insertChild);
  
  // Rename Operations
  // Handles layer naming and batch renaming functionality
  registerCommand('rename_layers', renameOperations.rename_layers);
  registerCommand('ai_rename_layers', renameOperations.ai_rename_layers);
  registerCommand('rename_layer', renameOperations.rename_layer);
  registerCommand('rename_multiple', renameOperations.rename_multiples);
}

/**
 * Handles an incoming command by routing it to the appropriate registered handler function
 * 
 * @param {string} command - The name of the command to execute
 * @param {object} params - Parameters object containing command-specific arguments
 * @returns {Promise<any>} Result of the command execution
 * @throws {Error} If the command is not registered or execution fails
 * 
 * @example
 * // Example usage:
 * await handleCommand('create_rectangle', { x: 0, y: 0, width: 100, height: 100 });
 */
export async function handleCommand(command, params) {
  console.log(`Received command: ${command}`);
  
  if (!commandRegistry[command]) {
    throw new Error(`Unknown command: ${command}`);
  }
  
  return await commandRegistry[command](params);
}

/**
 * @typedef {Object} CommandOperations
 * @property {Function} initializeCommands - Initializes all available commands
 * @property {Function} handleCommand - Handles execution of a specific command
 */

/** @type {CommandOperations} */
export const commandOperations = {
  initializeCommands,
  handleCommand
};
