import * as documentOperations from '../document.js';

/**
 * Centralized list of all plugin command names.
 * Mirrors the MCP_COMMANDS pattern for consistency and maintainability.
 */
export const PLUGIN_COMMANDS = {
  // --- Communication ---
  // (none for plugin)

  // --- Document and Information ---
  GET_DOCUMENT_INFO: "get_document_info",
  GET_SELECTION: "get_selection",
  SET_SELECTION: "set_selection",
  GET_NODE_INFO: "get_node_info",
  GET_CSS_ASYNC: "get_css_async",

  // --- Pages ---
  GET_PAGE: "get_page",
  SET_PAGE: "set_page",
  DUPLICATE_PAGE: "duplicate_page",
  SET_CURRENT_PAGE: "set_current_page",
  GET_PAGES: "get_pages",

  // --- Shapes ---
  CREATE_RECTANGLE: "create_rectangle",
  CREATE_FRAME: "create_frame",
  CREATE_LINE: "create_line",
  CREATE_ELLIPSE: "create_ellipse",
  CREATE_POLYGON: "create_polygon",
  CREATE_STAR: "create_star",
  CREATE_VECTOR: "create_vector",

  // --- Text ---
  CREATE_TEXT: "create_text",
  SET_TEXT_CONTENT: "set_text_content",
  GET_STYLED_TEXT_SEGMENTS: "get_styled_text_segments",
  GET_TEXT_STYLE: "get_text_style",
  SCAN_TEXT_NODES: "scan_text_nodes",
  SET_TEXT_STYLE: "set_text_style",
  SET_PARAGRAPH_SPACING: "set_paragraph_spacing",
  SET_LINE_HEIGHT: "set_line_height",
  SET_LETTER_SPACING: "set_letter_spacing",
  SET_TEXT_CASE: "set_text_case",
  SET_TEXT_DECORATION: "set_text_decoration",
  LOAD_FONT_ASYNC: "load_font_async",
  // SET_FONT_NAME: "set_font_name", // commented out
  // SET_FONT_SIZE: "set_font_size", // commented out
  // SET_FONT_WEIGHT: "set_font_weight", // commented out
  // SET_BULK_FONT: "set_bulk_font", // commented out

  // --- Components ---
  GET_COMPONENTS: "get_components",
  CREATE_COMPONENTS_FROM_NODES: "create_components_from_nodes",
  CREATE_COMPONENT_INSTANCE: "create_component_instance",
  CREATE_BUTTON: "create_button",
  DETACH_INSTANCES: "detach_instances",

  // --- Images and SVG ---
  GET_IMAGE: "get_image",
  INSERT_IMAGE: "insert_image",
  INSERT_SVG_VECTOR: "insert_svg_vector",
  GET_SVG_VECTOR: "get_svg_vector",

  // --- Styling ---
  GET_STYLES: "get_styles",
  GET_NODE_STYLES: "get_node_styles",
  SET_FILL_COLOR: "set_fill_color",
  SET_STROKE_COLOR: "set_stroke_color",
  SET_STYLE: "set_style",
  CREATE_GRADIENT_STYLE: "create_gradient_style",
  SET_GRADIENT: "set_gradient",

  // --- Effects and Layout ---
  CREATE_EFFECT_STYLE_VARIABLE: "create_effect_style_variable",
  SET_EFFECT: "set_effect",
  SET_EFFECT_STYLE_ID: "set_effect_style_id",
  SET_AUTO_LAYOUT: "set_auto_layout",
  SET_AUTO_LAYOUT_RESIZING: "set_auto_layout_resizing",
  SET_CORNER_RADIUS: "set_corner_radius",

  // --- Positioning & Sizing & Boolean Operations ---
  MOVE_NODE: "move_node",
  REORDER_NODES: "reorder_nodes",
  RESIZE_NODE: "resize_node",
  FLATTEN_NODE: "flatten_node",
  UNION_SELECTION: "union_selection",
  SUBTRACT_SELECTION: "subtract_selection",
  INTERSECT_SELECTION: "intersect_selection",
  EXCLUDE_SELECTION: "exclude_selection",
  RESIZE_NODES: "resize_nodes",
  BOOLEAN: "boolean",

  // --- Node Management ---
  GROUP_OR_UNGROUP_NODES: "group_or_ungroup_nodes",
  CONVERT_RECTANGLE_TO_FRAME: "convert_rectangle_to_frame",
  DELETE_NODE: "delete_node",
  CLONE_NODE: "clone_node",
  INSERT_CHILD: "insert_child",
  INSERT_CHILDREN: "insert_children",
  SET_NODE_LOCKED: "set_node_locked",
  SET_NODE_VISIBLE: "set_node_visible",

  // --- Grids, Guides, and Constraints ---
  SET_GRID: "set_grid",
  GET_GRID: "get_grid",
  SET_GUIDE: "set_guide",
  GET_GUIDE: "get_guide",
  SET_CONSTRAINTS: "set_constraints",
  GET_CONSTRAINTS: "get_constraints",

  // --- Figma Variables (Design Tokens) ---
  CREATE_VARIABLE: "create_variable",
  UPDATE_VARIABLE: "update_variable",
  DELETE_VARIABLE: "delete_variable",
  GET_VARIABLES: "get_variables",
  APPLY_VARIABLE_TO_NODE: "apply_variable_to_node",
  SWITCH_VARIABLE_MODE: "switch_variable_mode",

  // --- Export ---
  EXPORT_NODE_AS_IMAGE: "export_node_as_image",
  GENERATE_HTML: "generate_html",

  // --- Misc ---
  RENAME_LAYER: "rename_layer",
  AI_RENAME_LAYERS: "ai_rename_layers",
  SET_VARIANT: "set_variant",
  GET_VARIANT: "get_variant",
  GET_ANNOTATION: "get_annotation",
  SET_ANNOTATION: "set_annotation",
  SUBSCRIBE_EVENT: "subscribe_event",
  UNSUBSCRIBE_EVENT: "unsubscribe_event"
};
import * as shapeOperations from '../shapes.js';
import * as imageOperations from '../image.js';
import * as textOperations from '../text.js';
import { setParagraphSpacingUnified, setLineHeightUnified, setLetterSpacingUnified, setTextCaseUnified, setTextDecorationUnified } from '../text/text-edit.js';
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
  registerCommand(PLUGIN_COMMANDS.GET_DOCUMENT_INFO, documentOperations.getDocumentInfo);
  registerCommand(PLUGIN_COMMANDS.GET_SELECTION, documentOperations.getSelection);
  registerCommand(PLUGIN_COMMANDS.SET_SELECTION, documentOperations.setSelection);
  registerCommand(PLUGIN_COMMANDS.GET_NODE_INFO, documentOperations.getNodeInfo);
  registerCommand(PLUGIN_COMMANDS.GET_CSS_ASYNC, documentOperations.getCssAsync);

  // Image Operations (Unified)
  registerCommand(PLUGIN_COMMANDS.INSERT_IMAGE, imageOperations.insertImage);
  registerCommand(PLUGIN_COMMANDS.INSERT_SVG_VECTOR, insertSvgVector);
  // Shape Operations (Unified)
  registerCommand(PLUGIN_COMMANDS.CREATE_RECTANGLE, (params) => {
    // Accept both { rectangle }, { rectangles }, or flat { x, y, ... }
    if (params && (params.rectangle || params.rectangles)) {
      return shapeOperations.createRectangle(params);
    } else {
      return shapeOperations.createRectangle({ rectangle: params });
    }
  });
  registerCommand(PLUGIN_COMMANDS.CREATE_FRAME, (params) => {
    // Accept both { frame }, { frames }, or flat { x, y, ... }
    if (params && (params.frame || params.frames)) {
      return shapeOperations.createFrame(params);
    } else {
      return shapeOperations.createFrame({ frame: params });
    }
  });
  registerCommand(PLUGIN_COMMANDS.CREATE_ELLIPSE, shapeOperations.createEllipse);
  registerCommand(PLUGIN_COMMANDS.CREATE_POLYGON, shapeOperations.createPolygon);
  registerCommand(PLUGIN_COMMANDS.CREATE_STAR, shapeOperations.createStar);
  // Corner radius operation (merged, create_rectangle style)
  registerCommand(PLUGIN_COMMANDS.SET_CORNER_RADIUS, (params) => {
    // Accept both { radii }, { options }, or flat { nodeId, ... }
    if (params && (params.radii || params.options)) {
      return shapeOperations.setNodeCornerRadii(params);
    } else {
      return shapeOperations.setNodesCornerRadii(params);
    }
  });
  // Vector creation (merged, create_rectangle style)
  registerCommand(PLUGIN_COMMANDS.CREATE_VECTOR, (params) => {
    // Accept both { vector }, { vectors }, or flat { x, y, ... }
    if (params && (params.vector || params.vectors)) {
      return shapeOperations.createVector(params);
    } else {
      return shapeOperations.createVectors({ vectors: [params] });
    }
  });
  registerCommand(PLUGIN_COMMANDS.CREATE_LINE, shapeOperations.createLine);

  // Unified grid commands (setGrid, getGrid)
  registerCommand(PLUGIN_COMMANDS.SET_GRID, setGrid);
  registerCommand(PLUGIN_COMMANDS.GET_GRID, getGrid);

  // Unified guide commands (setGuide, getGuide)
  registerCommand(PLUGIN_COMMANDS.SET_GUIDE, setGuide);
  registerCommand(PLUGIN_COMMANDS.GET_GUIDE, getGuide);

  // Unified constraint commands (setConstraints, getConstraints)
  registerCommand(PLUGIN_COMMANDS.SET_CONSTRAINTS, setConstraints);
  registerCommand(PLUGIN_COMMANDS.GET_CONSTRAINTS, getConstraints);

  // Unified page commands (setPage, getPage)
  registerCommand(PLUGIN_COMMANDS.SET_PAGE, setPage);
  registerCommand(PLUGIN_COMMANDS.GET_PAGE, getPage);

  // Unified variant commands (setVariant, getVariant)
  registerCommand(PLUGIN_COMMANDS.SET_VARIANT, setVariant);
  registerCommand(PLUGIN_COMMANDS.GET_VARIANT, getVariant);

  // Resize operation (merged, create_rectangle style)
  registerCommand(PLUGIN_COMMANDS.RESIZE_NODE, (params) => {
    // Accept both { resize }, { resizes }, or flat { nodeId, width, height }
    if (params && (params.resize || params.resizes)) {
      return shapeOperations.resizeNode(params);
    } else {
      return shapeOperations.resizeNodes({ resizes: [params] });
    }
  });

  // Delete operation (supports single or array)
  registerCommand(PLUGIN_COMMANDS.DELETE_NODE, (params) => {
    let nodeIds = [];
    if (params && (Array.isArray(params.nodeIds) && params.nodeIds.length > 0)) {
      nodeIds = params.nodeIds;
    } else if (params && typeof params.nodeId === "string") {
      nodeIds = [params.nodeId];
    } else if (params && typeof params === "string") {
      nodeIds = [params];
    } else {
      nodeIds = [params];
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
  registerCommand(PLUGIN_COMMANDS.MOVE_NODE, shapeOperations.moveNode);
  // Flatten

  // Node lock/visibility operations
  registerCommand(PLUGIN_COMMANDS.SET_NODE_LOCKED, setNodeLocked);
  registerCommand(PLUGIN_COMMANDS.SET_NODE_VISIBLE, setNodeVisible);

  // Layer reorder operations
  registerCommand(PLUGIN_COMMANDS.REORDER_NODES, reorderNodes);

  // Boolean operation commands
  registerCommand(PLUGIN_COMMANDS.UNION_SELECTION, shapeOperations.union_selection);
  registerCommand(PLUGIN_COMMANDS.SUBTRACT_SELECTION, shapeOperations.subtract_selection);
  registerCommand(PLUGIN_COMMANDS.INTERSECT_SELECTION, shapeOperations.intersect_selection);
  registerCommand(PLUGIN_COMMANDS.EXCLUDE_SELECTION, shapeOperations.exclude_selection);

  // Rectangle to Frame conversion command
  registerCommand(PLUGIN_COMMANDS.CONVERT_RECTANGLE_TO_FRAME, shapeOperations.convertRectangleToFrame);

  // Annotation commands
  registerCommand(PLUGIN_COMMANDS.GET_ANNOTATION, async (params) => {
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

  registerCommand(PLUGIN_COMMANDS.SET_ANNOTATION, async (params) => {
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

  registerCommand(PLUGIN_COMMANDS.CREATE_TEXT, (params) => {
    if (params && Array.isArray(params.texts)) {
      return textOperations.createTexts(params);
    } else {
      return textOperations.createText(params);
    }
  });
  registerCommand(PLUGIN_COMMANDS.SET_TEXT_CONTENT, textOperations.setTextContent);
  registerCommand(PLUGIN_COMMANDS.SET_TEXT_STYLE, textOperations.setTextStyle);
  registerCommand(PLUGIN_COMMANDS.SCAN_TEXT_NODES, textOperations.scanTextNodes);
  // registerCommand(PLUGIN_COMMANDS.SET_FONT_NAME, textOperations.setFontName);
  // registerCommand(PLUGIN_COMMANDS.SET_FONT_SIZE, textOperations.setFontSize);
  // registerCommand(PLUGIN_COMMANDS.SET_FONT_WEIGHT, textOperations.setFontWeight);
  registerCommand(PLUGIN_COMMANDS.SET_LETTER_SPACING, textOperations.setLetterSpacing);
  registerCommand(PLUGIN_COMMANDS.SET_LINE_HEIGHT, textOperations.setLineHeight);
  registerCommand(PLUGIN_COMMANDS.SET_PARAGRAPH_SPACING, setParagraphSpacingUnified);
  registerCommand(PLUGIN_COMMANDS.SET_LINE_HEIGHT, setLineHeightUnified);
  registerCommand(PLUGIN_COMMANDS.SET_LETTER_SPACING, setLetterSpacingUnified);
  registerCommand(PLUGIN_COMMANDS.SET_TEXT_CASE, setTextCaseUnified);
  registerCommand(PLUGIN_COMMANDS.SET_TEXT_DECORATION, setTextDecorationUnified);
  registerCommand(PLUGIN_COMMANDS.GET_STYLED_TEXT_SEGMENTS, textOperations.getStyledTextSegments);
  registerCommand(PLUGIN_COMMANDS.LOAD_FONT_ASYNC, textOperations.loadFontAsyncWrapper);
  // registerCommand(PLUGIN_COMMANDS.SET_BULK_FONT, textOperations.setBulkFont);

  /*
  // variableOperations is now defined globally by variables.js in the build output.
  */

  // Style Operations
  registerCommand(PLUGIN_COMMANDS.SET_FILL_COLOR, styleOperations.setFillColor);
  registerCommand(PLUGIN_COMMANDS.SET_STROKE_COLOR, styleOperations.setStrokeColor);
  registerCommand(PLUGIN_COMMANDS.GET_STYLES, styleOperations.getStyles);
  registerCommand(PLUGIN_COMMANDS.SET_EFFECT, (params) => {
    // Accept both { entries } or flat single entry
    if (params && params.entries) {
      return styleOperations.setEffects(params);
    } else {
      return styleOperations.setEffects({ entries: [params] });
    }
  });
  registerCommand(PLUGIN_COMMANDS.SET_EFFECT_STYLE_ID, styleOperations.setEffectStyleId);
  registerCommand(PLUGIN_COMMANDS.CREATE_EFFECT_STYLE_VARIABLE, styleOperations.createEffectStyleVariable);
  registerCommand(PLUGIN_COMMANDS.SET_STYLE, styleOperations.setStyle);
  registerCommand(PLUGIN_COMMANDS.EXPORT_NODE_AS_IMAGE, componentOperations.exportNodeAsImage);

  // Figma Variable (Design Token) Operations
  registerCommand(PLUGIN_COMMANDS.CREATE_VARIABLE, variableOperations.createVariable);
  registerCommand(PLUGIN_COMMANDS.UPDATE_VARIABLE, variableOperations.updateVariable);
  registerCommand(PLUGIN_COMMANDS.DELETE_VARIABLE, variableOperations.deleteVariable);
  registerCommand(PLUGIN_COMMANDS.GET_VARIABLES, variableOperations.getVariables);
  registerCommand(PLUGIN_COMMANDS.APPLY_VARIABLE_TO_NODE, variableOperations.applyVariableToNode);
  registerCommand(PLUGIN_COMMANDS.SWITCH_VARIABLE_MODE, variableOperations.switchVariableMode);

  // Component Conversion
  registerCommand(PLUGIN_COMMANDS.CREATE_COMPONENTS_FROM_NODES, componentOperations.createComponentsFromNodes);
  registerCommand(PLUGIN_COMMANDS.CREATE_COMPONENT_INSTANCE, componentOperations.createComponentInstance);
  registerCommand(PLUGIN_COMMANDS.GET_COMPONENTS, componentOperations.getComponents);
  // Gradient Operations (Unified)
  registerCommand(PLUGIN_COMMANDS.CREATE_GRADIENT_STYLE, styleOperations.createGradientStyle);
  registerCommand(PLUGIN_COMMANDS.SET_GRADIENT, styleOperations.setGradient);

  // Detach Instance Tool (calls batch logic for DRYness)
  // Detach Instances Tool (Batch)
  registerCommand(PLUGIN_COMMANDS.DETACH_INSTANCES, async (params) => {
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

  registerCommand(PLUGIN_COMMANDS.RENAME_LAYER, renameOperations.rename_layer);

  // AI-powered rename of specified layers
  registerCommand(PLUGIN_COMMANDS.AI_RENAME_LAYERS, async (params) => {
    if (typeof sendCommand !== "function") throw new Error("sendCommand is not defined in this context.");
    return await sendCommand(PLUGIN_COMMANDS.AI_RENAME_LAYERS, params);
  });

  // Group/Ungroup operations
  registerCommand(PLUGIN_COMMANDS.GROUP_OR_UNGROUP_NODES, layoutOperations.groupOrUngroupNodes);

  // Auto Layout operations
  registerCommand(PLUGIN_COMMANDS.SET_AUTO_LAYOUT, setAutoLayoutUnified);
  registerCommand(PLUGIN_COMMANDS.SET_AUTO_LAYOUT_RESIZING, layoutOperations.setAutoLayoutResizing);

  // Event subscription commands
  registerCommand(PLUGIN_COMMANDS.SUBSCRIBE_EVENT, async (params) => {
    if (typeof sendCommand !== "function") throw new Error("sendCommand is not defined in this context.");
    return await sendCommand(PLUGIN_COMMANDS.SUBSCRIBE_EVENT, params);
  });
  registerCommand(PLUGIN_COMMANDS.UNSUBSCRIBE_EVENT, async (params) => {
    if (typeof sendCommand !== "function") throw new Error("sendCommand is not defined in this context.");
    return await sendCommand(PLUGIN_COMMANDS.UNSUBSCRIBE_EVENT, params);
  });

  // Insert child node operation (merged, create_rectangle style)
  registerCommand(PLUGIN_COMMANDS.INSERT_CHILD, (params) => {
    // Accept both { child }, { children }, or flat object
    if (params && (params.child || params.children)) {
      return layoutOperations.insertChildren(params);
    } else {
      return layoutOperations.insertChildren({ children: [params] });
    }
  });

  // Clone node operation (merged, create_rectangle style)
  registerCommand(PLUGIN_COMMANDS.CLONE_NODE, (params) => {
    // Accept both { node }, { nodes }, or flat object
    if (params && (params.node || params.nodes)) {
      return layoutOperations.clone_nodes(params);
    } else {
      return layoutOperations.clone_nodes({ nodes: [params] });
    }
  });

  // Node style inspection
  registerCommand(PLUGIN_COMMANDS.GET_NODE_STYLES, getNodeStyles);
  registerCommand(PLUGIN_COMMANDS.GET_SVG_VECTOR, getSvgVector);
  registerCommand(PLUGIN_COMMANDS.GET_IMAGE, getImage);
  registerCommand(PLUGIN_COMMANDS.GET_TEXT_STYLE, getTextStyle);

  // Batch flatten nodes operation
  registerCommand(PLUGIN_COMMANDS.FLATTEN_NODE, layoutOperations.flatten_nodes);

  // UI Component operations
  registerCommand(PLUGIN_COMMANDS.GENERATE_HTML, async ({ nodeId, format, cssMode }) => {
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
  registerCommand(PLUGIN_COMMANDS.CREATE_BUTTON, createButton);

  // Duplicate Page (MCP-only, no UI)
  registerCommand(PLUGIN_COMMANDS.DUPLICATE_PAGE, async ({ pageId, newPageName }) => {
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
