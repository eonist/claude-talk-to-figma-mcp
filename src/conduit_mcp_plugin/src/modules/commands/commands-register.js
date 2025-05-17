import * as documentOperations from '../document.js';
import * as shapeOperations from '../shapes.js';
import * as imageOperations from '../image.js';
import * as textOperations from '../text.js';
import * as styleOperations from '../styles.js';
import * as componentOperations from '../components.js';
import * as layoutOperations from '../layout.js';
import * as renameOperations from '../rename.js';
import HTMLGenerator from '../html-generator.js';
import { insertSvgVector } from '../svg.js';
import { createButton } from './commands-button.js';

/**
 * Internal registry to store command handler functions by name.
 * @type {Object.<string, Function>}
 */
const commandRegistry = {};

/**
 * Registers a command handler function under a specific name.
 *
 * @param {string} name - The unique name for the command.
 * @param {Function} fn - The handler function to execute for this command.
 * @returns {void}
 */
export function registerCommand(name, fn) {
  commandRegistry[name] = fn;
}

/**
 * Initializes and registers all available commands in the plugin.
 * Should be called once during plugin initialization to set up the command system.
 *
 * @function
 * @returns {void}
 */
export function initializeCommands() {
  // Document Operations
  registerCommand('get_document_info', documentOperations.getDocumentInfo);
  registerCommand('get_selection', documentOperations.getSelection);
  registerCommand('get_node_info', documentOperations.getNodeInfo);
  registerCommand('get_nodes_info', documentOperations.getNodesInfo);
  registerCommand('get_css_async', documentOperations.getCssAsync);

  // Image Operations (Unified)
  registerCommand('insert_image', imageOperations.insertImage);
  registerCommand('insert_svg_vector', insertSvgVector);
  registerCommand('insert_local_image', imageOperations.insertLocalImage);

  // Shape Operations (Unified)
  registerCommand('create_rectangle', shapeOperations.createRectangle);
  registerCommand('create_frame', shapeOperations.createFrame);
  registerCommand('create_ellipse', shapeOperations.createEllipse);
  registerCommand('create_polygon', shapeOperations.createPolygon);
  registerCommand('create_star', shapeOperations.createStar);
  registerCommand('create_vector', shapeOperations.createVector);
  registerCommand('create_vectors', shapeOperations.createVectors);
  registerCommand('create_line', shapeOperations.createLine);

  // Resize operations
  registerCommand('resize_node', shapeOperations.resizeNode);
  registerCommand('resize_nodes', shapeOperations.resizeNodes);
  // Delete operations
  registerCommand('delete_node', shapeOperations.deleteNode);
  registerCommand('delete_nodes', shapeOperations.deleteNodes);
  // Move operations
  registerCommand('move_node', shapeOperations.moveNode);
  // Flatten
  registerCommand('flatten_node', shapeOperations.flattenNode);

  // Boolean operation commands
  registerCommand('union_selection', shapeOperations.union_selection);
  registerCommand('subtract_selection', shapeOperations.subtract_selection);
  registerCommand('intersect_selection', shapeOperations.intersect_selection);
  registerCommand('exclude_selection', shapeOperations.exclude_selection);

  // Rectangle to Frame conversion command
  registerCommand('convert_rectangle_to_frame', shapeOperations.convertRectangleToFrame);

  // Flatten Selection Tool
  registerCommand('flatten_selection', async ({ nodeIds }) => {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
      throw new Error('No nodes provided for flatten_selection');
    }
    const nodes = nodeIds
      .map(id => figma.getNodeById(id))
      .filter(node => node !== null);
    figma.currentPage.selection = nodes;
    figma.flatten();
    return { success: true, message: `Flattened ${nodes.length} nodes.` };
  });

  registerCommand('create_text', textOperations.createText);
  registerCommand('create_texts', textOperations.createTexts);
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
  registerCommand('set_fill_color', styleOperations.setFillColor);
  registerCommand('set_stroke_color', styleOperations.setStrokeColor);
  registerCommand('get_styles', styleOperations.getStyles);
  registerCommand('set_effects', styleOperations.setEffects);
  registerCommand('set_effect_style_id', styleOperations.setEffectStyleId);
  registerCommand('set_style', styleOperations.setStyle);
  registerCommand('export_node_as_image', componentOperations.exportNodeAsImage);

  // Component Conversion
  registerCommand('create_component_from_node', componentOperations.createComponentFromNode);
  registerCommand('create_component_instance', componentOperations.createComponentInstance);
  registerCommand('get_team_components', componentOperations.getTeamComponents);

  // Gradient Operations
  registerCommand('create_gradient_variable', styleOperations.createGradientVariable);
  registerCommand('apply_gradient_style', styleOperations.applyGradientStyle);

  // Direct Gradient Operations (Style-free alternatives)
  registerCommand('apply_direct_gradient', async (params) => {
    const { nodeId, gradientType = "LINEAR", stops, applyTo = "FILL" } = params || {};

    if (!nodeId) {
      throw new Error("Missing nodeId parameter");
    }

    if (!stops || !Array.isArray(stops) || stops.length < 2) {
      throw new Error("Gradient must have at least two stops");
    }

    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    const typeMap = {
      LINEAR: "GRADIENT_LINEAR",
      RADIAL: "GRADIENT_RADIAL",
      ANGULAR: "GRADIENT_ANGULAR",
      DIAMOND: "GRADIENT_DIAMOND"
    };

    const figmaType = typeMap[gradientType] || "GRADIENT_LINEAR";

    const gradientPaint = {
      type: figmaType,
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
      gradientStops: stops.map(stop => ({
        position: stop.position,
        color: Array.isArray(stop.color)
          ? { r: stop.color[0], g: stop.color[1], b: stop.color[2], a: stop.color[3] || 1 }
          : stop.color
      }))
    };

    if (applyTo === "FILL" || applyTo === "BOTH") {
      if (!("fills" in node)) {
        throw new Error("Node does not support fills");
      }
      node.fills = [gradientPaint];
    }

    if (applyTo === "STROKE" || applyTo === "BOTH") {
      if (!("strokes" in node)) {
        throw new Error("Node does not support strokes");
      }
      node.strokes = [gradientPaint];
    }

    return {
      id: node.id,
      name: node.name,
      success: true
    };
  });

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

  // Insert child node operation
  registerCommand('insert_child', layoutOperations.insertChild);
  registerCommand('insert_children', layoutOperations.insertChildren);

  // Clone node operations
  registerCommand('clone_node', layoutOperations.clone_node);
  registerCommand('clone_nodes', layoutOperations.clone_nodes);

  // Batch flatten nodes operation
  registerCommand('flatten_nodes', layoutOperations.flatten_nodes);

  // UI Component operations
  registerCommand('generate_html', async ({ nodeId, format, cssMode }) => {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    const generator = new HTMLGenerator({
      format,
      cssMode,
      cssExtractor: n => n.getCSSAsync()
    });
    return await generator.generate(node);
  });

  // Button creation
  registerCommand('create_button', createButton);
}

/**
 * Handles an incoming command by routing it to the appropriate registered handler function.
 *
 * @async
 * @param {string} command - The name of the command to execute.
 * @param {any} params - Parameters to pass to the command handler.
 * @returns {Promise<any>} The result of the command handler.
 * @throws {Error} If the command is not registered.
 */
export async function handleCommand(command, params) {
  if (!commandRegistry[command]) {
    throw new Error(`Unknown command: ${command}`);
  }
  return await commandRegistry[command](params);
}

export const commandOperations = {
  initializeCommands,
  handleCommand
};
