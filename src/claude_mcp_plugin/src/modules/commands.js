/**
 * Command registry and handler module for the Claude MCP Figma plugin.
 * Centralizes registration and dispatch of all tool commands (read, create, modify, rename, styling).
 *
 * Exposed functions:
 * - registerCommand(name: string, fn: Function): void
 * - initializeCommands(): void
 * - handleCommand(commandName: string, params: any): Promise<any>
 * - commandOperations: { initializeCommands, handleCommand }
 *
 * @module modules/commands
 * @example
 * import { initializeCommands, handleCommand } from './modules/commands.js';
 * initializeCommands();
 * const info = await handleCommand('get_document_info', {});
 * console.log(info);
 */

import * as documentOperations from './document.js';
import * as shapeOperations from './shapes.js';
import * as imageOperations from './image.js';
import * as textOperations from './text.js';
import * as styleOperations from './styles.js';
import * as componentOperations from './components.js';
import * as layoutOperations from './layout.js';
import * as renameOperations from './rename.js';

// Internal registry to store command handlers
const commandRegistry = {};

/**
 * Registers a command function with the specified name in the command registry
 * 
 * @param {string} name - The command name to register (e.g., 'create_rectangle', 'set_text_content')
 * @param {Function} fn - The handler function to execute for this command
 * @throws {Error} If the command name is already registered
 */
/**
 * Registers a command handler function under a specific name.
 *
 * @param {string} name - The command identifier (e.g., 'create_rectangle').
 * @param {Function} fn - Handler function to execute when the command is called.
 * @throws {Error} If registration fails or if the command name is a duplicate.
 * @example
 * registerCommand('get_document_info', getDocumentInfo);
 */
function registerCommand(name, fn) {
  commandRegistry[name] = fn;
}

/**
 * Initializes and registers all available commands in the plugin
 * This function is called once during plugin initialization to set up the command system
 * Commands are organized by functional categories for better maintainability
 */
/**
 * Initializes and registers all available commands in the plugin.
 * This function is called once during plugin initialization to set up the command system.
 * @returns {void}
 * @example
 * // Initialize command handlers during plugin setup
 * initializeCommands();
 */
export function initializeCommands() {
  // Document Operations
  // Handles document-level operations like getting document info and selection state
  registerCommand('get_document_info', documentOperations.getDocumentInfo);
  registerCommand('get_selection', documentOperations.getSelection);
  registerCommand('get_node_info', documentOperations.getNodeInfo);
  registerCommand('get_nodes_info', documentOperations.getNodesInfo);
  
  // Image Operations
  // Handles image insertion commands only
  registerCommand('insert_image', imageOperations.insertImage);
  registerCommand('insert_images', imageOperations.insertImages);
  registerCommand('insert_local_image', imageOperations.insertLocalImage);
  registerCommand('insert_local_images', imageOperations.insertLocalImages);

  // Shape Operations
  registerCommand('create_rectangle', shapeOperations.createRectangle);
  registerCommand('create_rectangles', shapeOperations.createRectangles);
  registerCommand('create_frame', shapeOperations.createFrame);
  registerCommand('create_frames', shapeOperations.createFrames);
  registerCommand('create_ellipse', shapeOperations.createEllipse);
  registerCommand('create_ellipses', shapeOperations.createEllipses);
  registerCommand('create_polygon', shapeOperations.createPolygon);
  registerCommand('create_polygons', shapeOperations.createPolygons);
  registerCommand('create_star', shapeOperations.createStar);
  registerCommand('create_vector', shapeOperations.createVector);
  registerCommand('create_vectors', shapeOperations.createVectors);
  registerCommand('create_line', shapeOperations.createLine);
  registerCommand('create_lines', shapeOperations.createLines);

  // Corner radius
  registerCommand('set_corner_radius', shapeOperations.setCornerRadius);
  // Resize operations
  registerCommand('resize_node', shapeOperations.resizeNode);
  registerCommand('resize_nodes', shapeOperations.resizeNodes);
  // Delete operations
  registerCommand('delete_node', shapeOperations.deleteNode);
  registerCommand('delete_nodes', shapeOperations.deleteNodes);
  // Move operations
  registerCommand('move_node', shapeOperations.moveNode);
  registerCommand('move_nodes', shapeOperations.moveNodes);
  // Flatten
  registerCommand('flatten_node', shapeOperations.flattenNode);

  // Boolean operation commands
  registerCommand('union_selection', shapeOperations.union_selection);
  registerCommand('subtract_selection', shapeOperations.subtract_selection);
  registerCommand('intersect_selection', shapeOperations.intersect_selection);
  registerCommand('exclude_selection', shapeOperations.exclude_selection);

  // Flatten Selection Tool
  // Flattens multiple selected nodes in Figma in one batch
  registerCommand('flatten_selection', async ({ nodeIds }) => {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
      throw new Error('No nodes provided for flatten_selection');
    }
    // Select and flatten nodes
    const nodes = nodeIds
      .map(id => figma.getNodeById(id))
      .filter(node => node !== null);
    figma.currentPage.selection = nodes;
    figma.flatten();
    return { success: true, message: `Flattened ${nodes.length} nodes.` };
  });
  registerCommand('create_text', textOperations.createText);
  registerCommand('set_text_content', textOperations.setTextContent);
  registerCommand('create_bounded_text', textOperations.createBoundedText);
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
  registerCommand('set_bulk_font', textOperations.setBulkFont);
  
  // Style Operations
  // Controls visual styling like fills, strokes, and effects
  registerCommand('set_fill_color', styleOperations.setFillColor);
  registerCommand('set_stroke_color', styleOperations.setStrokeColor);
  registerCommand('get_styles', styleOperations.getStyles);
  registerCommand('set_effects', styleOperations.setEffects);
  registerCommand('set_effect_style_id', styleOperations.setEffectStyleId);
  registerCommand('set_style', styleOperations.setStyle);
  registerCommand('set_styles', styleOperations.setStyles);
  registerCommand('export_node_as_image', componentOperations.exportNodeAsImage);
  // Component Conversion
  registerCommand('create_component_from_node', componentOperations.createComponentFromNode);
  registerCommand('create_component_instance', componentOperations.createComponentInstance);
  
  // Gradient Operations
  registerCommand('create_gradient_variable', styleOperations.createGradientVariable);
  registerCommand('apply_gradient_style', styleOperations.applyGradientStyle);

  // Detach Instance Tool
  registerCommand('detach_instance', async (params) => {
    const { instanceId } = params;
    const node = figma.getNodeById(instanceId);
    if (!node) {
      throw new Error(`No node found with ID: ${instanceId}`);
    }
    if (node.type !== 'INSTANCE') {
      throw new Error('Node is not a component instance');
    }
    const detached = node.detachInstance();
    return { id: detached.id, name: detached.name };
  });

  registerCommand('rename_layer', renameOperations.rename_layer);
  registerCommand('rename_multiple', renameOperations.rename_multiples);

  // Group/Ungroup operations
  registerCommand('group_nodes', layoutOperations.groupNodes);
  registerCommand('ungroup_nodes', layoutOperations.ungroupNodes);
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
