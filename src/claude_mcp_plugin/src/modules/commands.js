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
import { directGradientOperations } from './direct-gradient.js';
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
 * Creates a complete button with a frame container, background, and text.
 * 
 * This function creates a proper button structure where:
 * 1. A Frame is created as the container
 * 2. A Rectangle is added as a child of the frame for the background
 * 3. A Text element is added as a child of the frame (sibling to the rectangle)
 * 
 * @param {object} params - Configuration parameters
 * @param {number} [params.x=0] - X position of the button
 * @param {number} [params.y=0] - Y position of the button
 * @param {number} [params.width=100] - Width of the button
 * @param {number} [params.height=40] - Height of the button
 * @param {string} [params.text="Button"] - Text to display on the button
 * @param {object} [params.style] - Visual styling options
 * @param {object} [params.style.background] - Background color ({ r, g, b, a })
 * @param {object} [params.style.text] - Text color ({ r, g, b, a })
 * @param {number} [params.style.fontSize=14] - Font size for the button text
 * @param {number} [params.style.fontWeight=500] - Font weight for the button text
 * @param {number} [params.style.cornerRadius=4] - Corner radius for the button
 * @param {string} [params.name="Button"] - Name for the button components
 * @param {string} [params.parentId] - Optional parent ID to add the button to
 * 
 * @returns {Promise<{frameId: string, backgroundId: string, textId: string}>} IDs of created elements
 */
async function createButton(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 40,
    text = "Button",
    style = {
      background: { r: 0.19, g: 0.39, b: 0.85, a: 1 },
      text: { r: 1, g: 1, b: 1, a: 1 },
      fontSize: 14,
      fontWeight: 500,
      cornerRadius: 4
    },
    name = "Button",
    parentId
  } = params || {};

  // 1. Create the frame (container)
  const frame = await shapeOperations.createFrame({
    x, y, 
    width, 
    height,
    name,
    parentId
  });

  // 2. Create the background rectangle as a child of the frame
  const background = await shapeOperations.createRectangle({
    x: 0, y: 0, // Relative to the frame
    width, 
    height,
    name: `${name} Background`,
    parentId: frame.id,
    fillColor: style.background || { r: 0.19, g: 0.39, b: 0.85, a: 1 }
  });

  // Apply corner radius if specified
  if (style.cornerRadius !== undefined) {
    await shapeOperations.setCornerRadius({
      nodeId: background.id,
      radius: style.cornerRadius
    });
  }

  // 3. Create the text centered in the frame
  const fontSize = style.fontSize || 14;
  
  // Calculate approximate text width based on content length and font size
  // This is a rough estimation for positioning
  const estimatedTextWidth = text.length * fontSize * 0.6;
  const textX = (width - estimatedTextWidth) / 2;
  const textY = (height - fontSize) / 2;
  
  const textNode = await textOperations.createText({
    x: Math.max(0, textX),
    y: textY,
    text,
    fontSize,
    fontWeight: style.fontWeight || 500,
    fontColor: style.text || { r: 1, g: 1, b: 1, a: 1 },
    name: `${name} Text`,
    parentId: frame.id  // Text is a sibling to the rectangle, both children of the frame
  });

  return {
    frameId: frame.id,
    backgroundId: background.id,
    textId: textNode.id
  };
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
  
  // Direct Gradient Operations (Style-free alternatives)
  registerCommand('apply_direct_gradient', directGradientOperations.applyDirectGradient);

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
  
  // Auto Layout operations
  registerCommand('set_auto_layout', layoutOperations.setAutoLayout);
  registerCommand('set_auto_layout_resizing', layoutOperations.setAutoLayoutResizing);
  
  // UI Component operations
  registerCommand('create_button', createButton);
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
