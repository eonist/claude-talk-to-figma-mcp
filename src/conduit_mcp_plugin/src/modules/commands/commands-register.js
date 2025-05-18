import * as documentOperations from '../document.js';
import * as shapeOperations from '../shapes.js';
import * as imageOperations from '../image.js';
import * as textOperations from '../text.js';
import { setParagraphSpacingUnified, setLineHeightUnified, setLetterSpacingUnified } from '../text/text-edit.js';
import * as styleOperations from '../styles.js';
import * as componentOperations from '../components.js';
import * as layoutOperations from '../layout.js';
import { setAutoLayoutUnified } from '../layout/layout-auto.js';
import { createGrid, updateGrid, removeGrid } from '../layout/layout-grid.js';
import { setGrid, getGrid } from '../layout/layout-grid-unified.js';
import { setGuide, getGuide } from '../layout/layout-guide.js';
import { setConstraints, getConstraints } from '../layout/layout-constraint.js';
import { setPage, getPage } from '../document/document-page.js';
import { setVariant, getVariant } from '../components/component-variant.js';
import * as renameOperations from '../rename.js';
import { setNodeLocked, setNodeVisible, reorderNode, reorderNodes } from '../node/node-modify.js';
import HTMLGenerator from '../html-generator.js';
import { insertSvgVector } from '../svg.js';
import { createButton } from './commands-button.js';
import { duplicatePage } from '../document/document-duplicate.js';
import { getNodeStyles, getImage, getTextStyle } from '../node/node-edit.js';

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
  registerCommand('set_selection', documentOperations.setSelection);
  registerCommand('get_node_info', documentOperations.getNodeInfo);
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

  // Grid commands (layoutGrids on frames)
  registerCommand('createGrid', createGrid);
  registerCommand('updateGrid', updateGrid);
  registerCommand('removeGrid', removeGrid);

  // Unified grid commands (setGrid, getGrid)
  registerCommand('setGrid', setGrid);
  registerCommand('getGrid', getGrid);

  // Unified guide commands (setGuide, getGuide)
  registerCommand('setGuide', setGuide);
  registerCommand('getGuide', getGuide);

  // Unified constraint commands (setConstraints, getConstraints)
  registerCommand('setConstraints', setConstraints);
  registerCommand('getConstraints', getConstraints);

  // Unified page commands (setPage, getPage)
  registerCommand('setPage', setPage);
  registerCommand('getPage', getPage);

  // Unified variant commands (setVariant, getVariant)
  registerCommand('setVariant', setVariant);
  registerCommand('getVariant', getVariant);

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

  // Annotation commands
  registerCommand('get_annotation', async (params) => {
    // Single node
    if (params.nodeId) {
      const node = figma.getNodeById(params.nodeId);
      return {
        nodeId: params.nodeId,
        annotations: node && node.annotations ? node.annotations : []
      };
    }
    // Batch
    if (Array.isArray(params.nodeIds)) {
      return params.nodeIds.map(nodeId => {
        const node = figma.getNodeById(nodeId);
        return {
          nodeId,
          annotations: node && node.annotations ? node.annotations : []
        };
      });
    }
    throw new Error("Must provide nodeId or nodeIds");
  });

  registerCommand('set_annotation', async (params) => {
    // Helper to set or delete annotation for a node
    async function setOrDelete(entry) {
      const node = figma.getNodeById(entry.nodeId);
      if (!node) return { nodeId: entry.nodeId, success: false, error: "Node not found" };
      if (entry.delete) {
        node.annotations = [];
        return { nodeId: entry.nodeId, deleted: true };
      }
      if (entry.annotation) {
        node.annotations = [entry.annotation];
        return { nodeId: entry.nodeId, updated: true, annotation: entry.annotation };
      }
      return { nodeId: entry.nodeId, success: false, error: "No annotation or delete flag provided" };
    }

    // Single
    if (params.entry) {
      return await setOrDelete(params.entry);
    }
    // Batch
    if (Array.isArray(params.entries)) {
      const results = [];
      for (const entry of params.entries) {
        results.push(await setOrDelete(entry));
      }
      return results;
    }
    throw new Error("Must provide entry or entries");
  });

  registerCommand('create_text', textOperations.createText);
  registerCommand('set_text_content', textOperations.setTextContent);
  registerCommand('set_text_style', textOperations.setTextStyle);
  registerCommand('scan_text_nodes', textOperations.scanTextNodes);
  registerCommand('set_font_name', textOperations.setFontName);
  registerCommand('set_font_size', textOperations.setFontSize);
  registerCommand('set_font_weight', textOperations.setFontWeight);
  registerCommand('set_letter_spacing', textOperations.setLetterSpacing);
  registerCommand('set_line_height', textOperations.setLineHeight);
  registerCommand('set_paragraph_spacing', setParagraphSpacingUnified);
  registerCommand('set_line_height', setLineHeightUnified);
  registerCommand('set_letter_spacing', setLetterSpacingUnified);
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
  registerCommand('get_components', componentOperations.getComponents);
  // Gradient Operations (Unified)
  registerCommand('create_gradient_style', styleOperations.createGradientStyle);
  registerCommand('set_gradient', styleOperations.setGradient);

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
  registerCommand('set_auto_layout', setAutoLayoutUnified);
  registerCommand('set_auto_layout_resizing', layoutOperations.setAutoLayoutResizing);

  // Insert child node operation
  registerCommand('insert_child', layoutOperations.insertChild);
  registerCommand('insert_children', layoutOperations.insertChildren);

  // Clone node operations
  registerCommand('clone_node', layoutOperations.clone_node);
  registerCommand('clone_nodes', layoutOperations.clone_nodes);

  // Node style inspection
  registerCommand('get_node_styles', getNodeStyles);
  registerCommand('get_svg_vector', getSvgVector);
  registerCommand('get_image', getImage);
  registerCommand('get_text_style', getTextStyle);

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
  const result = await commandRegistry[command](params);
  if (typeof figma.commitUndo === "function") {
    figma.commitUndo();
  }
  return result;
}

export const commandOperations = {
  initializeCommands,
  handleCommand
};
