/**
 * Command Registry and Handler Module
 * 
 * This module manages the registration and execution of all available commands in the Figma plugin.
 * It provides a centralized system for registering command handlers and routing incoming commands
 * to their appropriate implementations.
 */

import * as documentOperations from './document.js';
import * as shapeOperations from './shapes.js';
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
  registerCommand('create_frames', shapeOperations.createFrames);
  registerCommand('create_ellipse', shapeOperations.createEllipse);
  registerCommand('create_polygon', shapeOperations.createPolygon);
  registerCommand('create_star', shapeOperations.createStar);
  registerCommand('create_vector', shapeOperations.createVector);
  registerCommand('create_line', shapeOperations.createLine);
  registerCommand('create_lines', shapeOperations.createLines);
  registerCommand('insert_svg_vector', shapeOperations.createSvgVector);
  registerCommand('insert_svg_vectors', shapeOperations.createSvgVectors);

  // Batch vectors
  registerCommand('create_vectors', shapeOperations.createVectors);
  // Batch rectangles
  registerCommand('create_rectangles', shapeOperations.createRectangles);
  // Batch ellipses
  registerCommand('create_ellipses', shapeOperations.createEllipses);
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
  // Clone operations
  registerCommand('clone_node', shapeOperations.cloneNode);
  registerCommand('clone_nodes', shapeOperations.cloneNodes);
  
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
