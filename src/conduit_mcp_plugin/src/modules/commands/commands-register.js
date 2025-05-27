// All imports moved to the top to prevent temporal dead zone issues
import * as documentOperations from '../document.js';
import { setNodePropUnified } from '../node/node-modify.js';
import { setMatrixTransform } from '../node/node-modify.js';
import * as shapeOperations from '../shapes.js';
import { moveNode, resizeNode, moveNodes, resizeNodes } from '../node/node-modify.js';
import * as imageOperations from '../image.js';
import * as textOperations from '../text.js';
import { setParagraphSpacingUnified, setLineHeightUnified, setLetterSpacingUnified, setTextCaseUnified, setTextDecorationUnified } from '../text/text-edit.js';
import { styleOperations } from '../styles.js';
import { getFillAndStroke } from '../styles/styles-get.js';
import * as componentOperations from '../components.js';
import * as layoutOperations from '../layout.js';
import { setAutoLayoutUnified } from '../layout/layout-auto.js';
import { setGrid, getGrid } from '../layout/layout-grid-unified.js';
import { setGuide, getGuide } from '../layout/layout-guide.js';
import { setConstraints, getConstraints } from '../layout/layout-constraint.js';
import { setPage, getPage } from '../document/document-page.js';
import { setVariant, getVariant } from '../components/component-variant.js';
import * as renameOperations from '../rename.js';
import { setNodeLocked, setNodeVisible, reorderNodes } from '../node/node-modify.js';
import { generateHtmlUnified } from '../html-generator.js';
import { insertSvgVector } from '../svg.js';
import { createButton } from './commands-button.js';
import { duplicatePageUnified } from '../document/document-duplicate.js';
import { getNodeStyles, getFillAndStroke, getImage, getTextStyle, deleteNode, deleteNodeUnified, getSvgVector, getAnnotationUnified, setAnnotationUnified } from '../node/node-edit.js';
import { utilsOperations } from '../utils.js';
import * as variableOperations from '../variables.js';

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

  // --- Pages ---
  GET_PAGE: "get_page",
  GET_DOC_PAGES: "get_doc_pages",
  SET_PAGE: "set_page",
  DUPLICATE_PAGE: "duplicate_page",

  // --- Shapes ---
  CREATE_RECTANGLE: "create_rectangle",
  CREATE_FRAME: "create_frame",
  CREATE_LINE: "create_line",
  CREATE_ELLIPSE: "create_ellipse",
  CREATE_POLYGON: "create_polygon",
  CREATE_STAR: "create_star",
  CREATE_VECTOR: "create_vector",
  GET_VECTOR: "get_vector",

  // --- Text ---
  SET_TEXT: "set_text",
  SET_TEXT_CONTENT: "set_text_content",
  GET_STYLED_TEXT_SEGMENTS: "get_styled_text_segments",
  GET_TEXT_STYLE: "get_text_style",
  SCAN_TEXT_NODES: "scan_text_nodes",
  SET_TEXT_STYLE: "set_text_style",
  LOAD_FONT_ASYNC: "load_font_async",
  
  // --- Components ---
  GET_COMPONENTS: "get_components",
  CREATE_COMPONENTS_FROM_NODE: "create_components_from_node",
  CREATE_COMPONENT_INSTANCE: "create_component_instance",
  CREATE_BUTTON: "create_button",
  DETACH_INSTANCES: "detach_instances",

  // --- Images and SVG ---
  GET_IMAGE: "get_image",
  SET_IMAGE: "set_image",
  SET_SVG_VECTOR: "set_svg_vector",
  GET_SVG_VECTOR: "get_svg_vector",

  // --- Styling ---
  GET_DOC_STYLE: "get_doc_style",
  GET_NODE_STYLE: "get_node_style",
  GET_FILL_AND_STROKE: "get_fill_and_stroke",
  SET_FILL_AND_STROKE: "set_fill_and_stroke",
  SET_STYLE: "set_style",
  CREATE_GRADIENT_STYLE: "create_gradient_style",
  SET_GRADIENT: "set_gradient",

  // --- Effects and Layout ---
  CREATE_EFFECT_STYLE_VARIABLE: "create_effect_style_variable",
  SET_EFFECT: "set_effect",
  APPLY_EFFECT_STYLE: "apply_effect_style",
  SET_AUTO_LAYOUT: "set_auto_layout",
  SET_AUTO_LAYOUT_RESIZING: "set_auto_layout_resizing",
  SET_CORNER_RADIUS: "set_corner_radius",

  // --- Positioning & Sizing & Boolean Operations ---
  MOVE_NODE: "move_node",
  REORDER_NODE: "reorder_node",
  RESIZE_NODE: "resize_node",
  FLATTEN_NODE: "flatten_node",
  ROTATE_NODE: "rotate_node",
  // we call these from boolean in server, we will fix that later
  BOOLEAN: "boolean", // not in use yet

  // --- Node Management ---
  GROUP_NODE: "group_node",
  CONVERT_RECTANGLE_TO_FRAME: "convert_rectangle_to_frame",
  DELETE_NODE: "delete_node",
  DUPLICATE_NODE: "duplicate_node",
  SET_NODE: "set_node",
  SET_NODE_PROP: "set_node_prop",
  SET_MATRIX_TRANSFORM: "set_matrix_transform",

  // --- Grids, Guides, and Constraints ---
  SET_GRID: "set_grid",
  GET_GRID: "get_grid",
  SET_GUIDE: "set_guide",
  GET_GUIDE: "get_guide",
  SET_CONSTRAINT: "set_constraint",
  GET_CONSTRAINT: "get_constraint",

  // --- Figma Variables (Design Tokens) ---
  SET_VARIABLE: "set_variable",
  GET_VARIABLE: "get_variable",
  APPLY_VARIABLE_TO_NODE: "apply_variable_to_node",
  SWITCH_VARIABLE_MODE: "switch_variable_mode",

  // --- Export ---
  EXPORT_NODE_AS_IMAGE: "export_node_as_image",
  GET_HTML: "get_html",
  GET_CSS_ASYNC: "get_css_async",

  // --- Misc ---
  RENAME_LAYER: "rename_layer",
  SET_VARIANT: "set_variant",
  GET_VARIANT: "get_variant",
  GET_ANNOTATION: "get_annotation",
  SET_ANNOTATION: "set_annotation",
  SUBSCRIBE_EVENT: "subscribe_event"
};

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
  // --- Document and Information ---
  registerCommand(PLUGIN_COMMANDS.GET_DOCUMENT_INFO, documentOperations.getDocumentInfo);
  registerCommand(PLUGIN_COMMANDS.GET_SELECTION, documentOperations.getSelection);
  registerCommand(PLUGIN_COMMANDS.SET_SELECTION, documentOperations.setSelection);
  registerCommand(PLUGIN_COMMANDS.GET_NODE_INFO, documentOperations.getNodeInfo);

  // --- Pages ---
  registerCommand(PLUGIN_COMMANDS.GET_PAGE, getPage);
  registerCommand(PLUGIN_COMMANDS.GET_DOC_PAGES, documentOperations.getPages);
  registerCommand(PLUGIN_COMMANDS.SET_PAGE, setPage);
  registerCommand(PLUGIN_COMMANDS.DUPLICATE_PAGE, duplicatePageUnified);

  // --- Shapes ---
  registerCommand(PLUGIN_COMMANDS.CREATE_RECTANGLE, shapeOperations.createRectangleUnified);
  registerCommand(PLUGIN_COMMANDS.CREATE_FRAME, shapeOperations.createFrameUnified);
  registerCommand(PLUGIN_COMMANDS.CREATE_LINE, shapeOperations.createLine);
  registerCommand(PLUGIN_COMMANDS.CREATE_ELLIPSE, shapeOperations.createEllipse);
  registerCommand(PLUGIN_COMMANDS.CREATE_POLYGON, shapeOperations.createPolygon);
  registerCommand(PLUGIN_COMMANDS.CREATE_STAR, shapeOperations.createStar);
  registerCommand(PLUGIN_COMMANDS.CREATE_VECTOR, shapeOperations.createVectorUnified);
  registerCommand(PLUGIN_COMMANDS.GET_VECTOR, shapeOperations.getVector);

  // --- Text ---
  registerCommand(PLUGIN_COMMANDS.SET_TEXT, textOperations.createTextUnified);
  registerCommand(PLUGIN_COMMANDS.SET_TEXT_CONTENT, textOperations.setTextContent);
  registerCommand(PLUGIN_COMMANDS.GET_STYLED_TEXT_SEGMENTS, textOperations.getStyledTextSegments);
  registerCommand(PLUGIN_COMMANDS.GET_TEXT_STYLE, getTextStyle);
  registerCommand(PLUGIN_COMMANDS.SCAN_TEXT_NODES, textOperations.scanTextNodes);
  registerCommand(PLUGIN_COMMANDS.SET_TEXT_STYLE, textOperations.setTextStyle);
  registerCommand(PLUGIN_COMMANDS.LOAD_FONT_ASYNC, textOperations.loadFontAsyncWrapper);

  // --- Components ---
  registerCommand(PLUGIN_COMMANDS.GET_COMPONENTS, componentOperations.getComponents);
  registerCommand(PLUGIN_COMMANDS.CREATE_COMPONENTS_FROM_NODE, componentOperations.createComponentsFromNodes);
  registerCommand(PLUGIN_COMMANDS.CREATE_COMPONENT_INSTANCE, componentOperations.createComponentInstance);
  registerCommand(PLUGIN_COMMANDS.CREATE_BUTTON, createButton);
  registerCommand(PLUGIN_COMMANDS.DETACH_INSTANCES, componentOperations.detachInstances);

  // --- Images and SVG ---
  registerCommand(PLUGIN_COMMANDS.GET_IMAGE, getImage);
  console.log('💥 typeof imageOperations.insertImage:', typeof imageOperations.insertImage);
  registerCommand(PLUGIN_COMMANDS.SET_IMAGE, imageOperations.insertImage);
  registerCommand(PLUGIN_COMMANDS.SET_SVG_VECTOR, insertSvgVector);
  registerCommand(PLUGIN_COMMANDS.GET_SVG_VECTOR, getSvgVector);

  // --- Styling ---
  registerCommand(PLUGIN_COMMANDS.GET_DOC_STYLE, styleOperations.getStyles);
  registerCommand(PLUGIN_COMMANDS.GET_NODE_STYLE, getNodeStyles);
  registerCommand(PLUGIN_COMMANDS.GET_FILL_AND_STROKE, getFillAndStroke);
  registerCommand(PLUGIN_COMMANDS.SET_FILL_AND_STROKE, styleOperations.setFillAndStrokeUnified);
  registerCommand(PLUGIN_COMMANDS.SET_STYLE, styleOperations.setStyle);
  registerCommand(PLUGIN_COMMANDS.CREATE_GRADIENT_STYLE, styleOperations.createGradientStyle);
  registerCommand(PLUGIN_COMMANDS.SET_GRADIENT, styleOperations.setGradient);

  // --- Effects and Layout ---
  registerCommand(PLUGIN_COMMANDS.CREATE_EFFECT_STYLE_VARIABLE, styleOperations.createEffectStyleVariable);
  registerCommand(PLUGIN_COMMANDS.SET_EFFECT, styleOperations.setEffectUnified);
  registerCommand(PLUGIN_COMMANDS.APPLY_EFFECT_STYLE, styleOperations.setEffectStyleId);
  registerCommand(PLUGIN_COMMANDS.SET_AUTO_LAYOUT, setAutoLayoutUnified);
  registerCommand(PLUGIN_COMMANDS.SET_AUTO_LAYOUT_RESIZING, layoutOperations.setAutoLayoutResizing);
  registerCommand(PLUGIN_COMMANDS.SET_CORNER_RADIUS, shapeOperations.setCornerRadiusUnified);

  // --- Positioning & Sizing & Boolean Operations ---
  registerCommand(PLUGIN_COMMANDS.MOVE_NODE, moveNode);
  registerCommand(PLUGIN_COMMANDS.REORDER_NODE, reorderNodes);
  registerCommand(PLUGIN_COMMANDS.RESIZE_NODE, resizeNode);
  // TODO: Fix rotate_node and flatten_node if they are also miswired
  registerCommand(PLUGIN_COMMANDS.ROTATE_NODE, shapeOperations.rotateNodeUnified);
  registerCommand(PLUGIN_COMMANDS.FLATTEN_NODE, layoutOperations.flatten_nodes);
  registerCommand(PLUGIN_COMMANDS.ROTATE_NODE, shapeOperations.rotateNodeUnified);
  registerCommand(PLUGIN_COMMANDS.BOOLEAN, shapeOperations.boolean);

  // --- Node Management ---
  registerCommand(PLUGIN_COMMANDS.GROUP_NODE, layoutOperations.groupOrUngroupNodes);
  registerCommand(PLUGIN_COMMANDS.CONVERT_RECTANGLE_TO_FRAME, shapeOperations.convertRectangleToFrame);
  registerCommand(PLUGIN_COMMANDS.DELETE_NODE, deleteNodeUnified);
  registerCommand(PLUGIN_COMMANDS.DUPLICATE_NODE, layoutOperations.cloneNodeUnified);
  registerCommand(PLUGIN_COMMANDS.SET_NODE, layoutOperations.setNodeUnified);
  registerCommand(PLUGIN_COMMANDS.SET_NODE_PROP, setNodePropUnified);
  registerCommand(PLUGIN_COMMANDS.SET_MATRIX_TRANSFORM, setMatrixTransform);

  // --- Grids, Guides, and Constraints ---
  registerCommand(PLUGIN_COMMANDS.SET_GRID, setGrid);
  registerCommand(PLUGIN_COMMANDS.GET_GRID, getGrid);
  registerCommand(PLUGIN_COMMANDS.SET_GUIDE, setGuide);
  registerCommand(PLUGIN_COMMANDS.GET_GUIDE, getGuide);
  registerCommand(PLUGIN_COMMANDS.SET_CONSTRAINT, setConstraints);
  registerCommand(PLUGIN_COMMANDS.GET_CONSTRAINT, getConstraints);

  // --- Figma Variables (Design Tokens) ---
  registerCommand(PLUGIN_COMMANDS.SET_VARIABLE, variableOperations.setVariable);
  registerCommand(PLUGIN_COMMANDS.GET_VARIABLE, variableOperations.getVariables);
  registerCommand(PLUGIN_COMMANDS.APPLY_VARIABLE_TO_NODE, variableOperations.applyVariableToNode);
  registerCommand(PLUGIN_COMMANDS.SWITCH_VARIABLE_MODE, variableOperations.switchVariableMode);

  // --- Export ---
  registerCommand(PLUGIN_COMMANDS.EXPORT_NODE_AS_IMAGE, componentOperations.exportNodeAsImage);
  registerCommand(PLUGIN_COMMANDS.GET_HTML, generateHtmlUnified);
  registerCommand(PLUGIN_COMMANDS.GET_CSS_ASYNC, documentOperations.getCssAsync);

  // --- Misc ---
  registerCommand(PLUGIN_COMMANDS.RENAME_LAYER, renameOperations.rename_layer);
  registerCommand(PLUGIN_COMMANDS.SET_VARIANT, setVariant);
  registerCommand(PLUGIN_COMMANDS.GET_VARIANT, getVariant);
  registerCommand(PLUGIN_COMMANDS.GET_ANNOTATION, getAnnotationUnified);
  registerCommand(PLUGIN_COMMANDS.SET_ANNOTATION, setAnnotationUnified);
  registerCommand(PLUGIN_COMMANDS.SUBSCRIBE_EVENT, utilsOperations.subscribeEventUnified);
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
