import * as documentOperations from '../document.js';
import * as shapeOperations from '../shapes.js';
import * as imageOperations from '../image.js';
import * as textOperations from '../text.js';
import * as styleOperations from '../styles.js';
import * as componentOperations from '../components.js';
import * as layoutOperations from '../layout.js';
import * as renameOperations from '../rename.js';
import { setNodeLocked, setNodeVisible, reorderNode, reorderNodes } from '../node/node-modify.js';
import HTMLGenerator from '../html-generator.js';
import { insertSvgVector } from '../svg.js';
import { createButton } from './commands-button.js';
import { duplicatePage } from '../document/document-duplicate.js';

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
  registerCommand('delete_nodes', async (params) => {
    let nodeIds = [];
    if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
      nodeIds = params.nodeIds;
    } else if (typeof params.nodeId === "string") {
      nodeIds = [params.nodeId];
    } else {
      throw new Error("You must provide 'nodeId' or 'nodeIds'");
    }
    const deleted = [];
    for (const nodeId of nodeIds) {
      const node = figma.getNodeById(nodeId);
      if (node) {
        node.remove();
        deleted.push(nodeId);
      }
    }
    return { success: true, deleted };
  });
  // Move operations
  registerCommand('move_node', shapeOperations.moveNode);
  // Flatten

  // Node lock/visibility operations
  registerCommand('set_node_locked', setNodeLocked);
  registerCommand('set_node_visible', setNodeVisible);

  // Layer reorder operations
  registerCommand('reorder_nodes', reorderNodes);

  // Boolean operation commands
  registerCommand('union_selection', shapeOperations.union_selection);
  registerCommand('subtract_selection', shapeOperations.subtract_selection);
  registerCommand('intersect_selection', shapeOperations.intersect_selection);
  registerCommand('exclude_selection', shapeOperations.exclude_selection);

  // Rectangle to Frame conversion command
  registerCommand('convert_rectangle_to_frame', shapeOperations.convertRectangleToFrame);


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
  registerCommand('create_components_from_nodes', componentOperations.createComponentsFromNodes);
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

  // Detach Instance Tool (calls batch logic for DRYness)
  // Detach Instances Tool (Batch)
  registerCommand('detach_instances', async (params) => {
    let instanceIds = [];
    const options = params && params.options ? params.options : {};
    if (Array.isArray(params.instanceIds) && params.instanceIds.length > 0) {
      instanceIds = params.instanceIds;
    } else if (typeof params.instanceId === "string") {
      instanceIds = [params.instanceId];
    } else {
      throw new Error("You must provide 'instanceId' or 'instanceIds'");
    }
    const maintainPosition = options.maintain_position;
    const skipErrors = options.skip_errors;
    const results = [];

    for (const instanceId of instanceIds) {
      try {
        const node = figma.getNodeById(instanceId);
        if (!node) {
          throw new Error(`No node found with ID: ${instanceId}`);
        }
        if (node.type !== 'INSTANCE') {
          throw new Error('Node is not a component instance');
        }
        // Store original position and parent if needed
        const originalX = node.x;
        const originalY = node.y;
        const originalParent = node.parent;

        // Detach instance
        const detached = node.detachInstance();

        // Maintain position if requested
        if (maintainPosition) {
          detached.x = originalX;
          detached.y = originalY;
          if (originalParent && 'appendChild' in originalParent) {
            try {
              originalParent.appendChild(detached);
            } catch (e) {
              // If already parented, ignore
            }
          }
        }

        results.push({ id: detached.id, name: detached.name, instanceId });
      } catch (error) {
        if (skipErrors) {
          results.push({
            error: error && error.message ? error.message : String(error),
            instanceId
          });
          continue;
        } else {
          // Stop on first error if not skipping errors
          throw error;
        }
      }
    }

    // Optionally, select and zoom to detached nodes if any
    const detachedNodes = results.filter(r => r.id).map(r => figma.getNodeById(r.id)).filter(Boolean);
    if (detachedNodes.length > 0) {
      figma.currentPage.selection = detachedNodes;
      figma.viewport.scrollAndZoomIntoView(detachedNodes);
    }

    return results;
  });

  registerCommand('rename_layer', renameOperations.rename_layer);

  // Group/Ungroup operations
  registerCommand('group_or_ungroup_nodes', layoutOperations.groupOrUngroupNodes);

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

  // Duplicate Page (MCP-only, no UI)
  registerCommand('duplicate_page', async ({ pageId, newPageName }) => {
    return await duplicatePage({ pageId, newPageName });
  });
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
