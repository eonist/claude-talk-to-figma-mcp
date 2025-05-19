/**
 * Type definitions for Figma commands and responses
 */

/**
 * Defines all available Figma command types that can be sent over WebSocket
 */
import { CommandParamsMap } from "./command-params.js";

/**
 * Unified grid command parameter types
 */
export interface GridProperties {
  pattern: "GRID" | "COLUMNS" | "ROWS";
  visible?: boolean;
  color?: { r: number; g: number; b: number; a?: number };
  alignment?: "MIN" | "MAX" | "STRETCH" | "CENTER";
  gutterSize?: number;
  count?: number;
  sectionSize?: number;
  offset?: number;
}
export interface SetGridEntry {
  nodeId: string;
  gridIndex?: number;
  properties?: GridProperties;
  delete?: boolean;
}
export interface SetGridParams {
  entry?: SetGridEntry;
  entries?: SetGridEntry[];
}
export interface GetGridParams {
  nodeId?: string;
  nodeIds?: string[];
}

/**
 * Unified guide command parameter types
 */
export interface GuideEntry {
  axis: "X" | "Y";
  offset: number;
  delete?: boolean;
}
export interface SetGuideParams {
  guide?: GuideEntry;
  guides?: GuideEntry[];
}
export interface GetGuideParams {} // No params

/**
 * Unified constraint command parameter types
 */
export interface ConstraintEntry {
  nodeId: string;
  horizontal: "left" | "right" | "center" | "scale" | "stretch";
  vertical: "top" | "bottom" | "center" | "scale" | "stretch";
}
export interface SetConstraintsParams {
  constraint?: ConstraintEntry;
  constraints?: ConstraintEntry[];
  applyToChildren?: boolean;
  maintainAspectRatio?: boolean;
}
export interface GetConstraintsParams {
  nodeId?: string;
  nodeIds?: string[];
  includeChildren?: boolean;
}

/**
 * Unified event subscription command parameter types
 */
export interface SubscribeEventParams {
  eventType: string;
  filter?: any;
}
export interface UnsubscribeEventParams {
  subscriptionId: string;
}

/**
 * Unified variant command parameter types
 */
export interface VariantOp {
  componentSetId: string;
  action: "create" | "add" | "rename" | "delete" | "organize" | "batch_create";
  properties?: { [key: string]: string };
  variantId?: string;
  propertyName?: string;
  newPropertyName?: string;
  propertyValue?: string;
  newPropertyValue?: string;
  templateComponentId?: string;
  propertiesList?: { [key: string]: string }[];
  organizeBy?: string[];
}
export interface SetVariantParams {
  variant?: VariantOp;
  variants?: VariantOp[];
}
export interface GetVariantParams {
  componentSetId?: string;
  componentSetIds?: string[];
}

export const MCP_COMMANDS = {
  GET_DOCUMENT_INFO: "get_document_info", // Get detailed information about the current Figma document
  CLONE_NODES: "clone_nodes", // Clone multiple nodes in Figma
  DELETE_NODES: "delete_nodes", // Delete multiple nodes in Figma
  CREATE_PAGE: "create_page", // Create a new page in the Figma document
  GET_SELECTION: "get_selection", // Get information about the current selection
  GET_NODE_INFO: "get_node_info", // Get detailed information about a specific node
  CREATE_COMPONENTS_FROM_NODES: "create_components_from_nodes", // Create components from node(s)
  CREATE_RECTANGLE: "create_rectangle", // Create a new rectangle shape node
  CREATE_FRAME: "create_frame", // Create a new frame node
  CREATE_TEXT: "create_text", // Create a new text element
  CREATE_ELLIPSE: "create_ellipse", // Create a new ellipse shape node
  CREATE_POLYGON: "create_polygon", // Create a new polygon shape node
  CREATE_STAR: "create_star", // Create a new star shape node
  CREATE_VECTOR: "create_vector", // Create a new vector node
  CREATE_LINE: "create_line", // Create a new line node
  SET_FILL_COLOR: "set_fill_color", // Set the fill color of a node
  SET_STROKE_COLOR: "set_stroke_color", // Set the stroke color of a node
  MOVE_NODE: "move_node", // Move a node to a new position
  REORDER_NODES: "reorder_nodes", // Batch reorder multiple nodes
  RESIZE_NODE: "resize_node", // Resize a node
  DELETE_NODE: "delete_node", // Delete a node
  EXPORT_NODE_AS_IMAGE: "export_node_as_image", // Export a node as an image
  SET_TEXT_CONTENT: "set_text_content", // Set the text content of a text node
  SET_TEXT_STYLE: "set_text_style", // Set one or more text style properties (font, size, weight, spacing, case, decoration, etc.)
  GET_TEXT_STYLE: "get_text_style", // Get text style properties from one or more nodes
  GET_STYLES: "get_styles", // Get all styles from the document
  GET_NODE_STYLES: "get_node_styles", // Get all styles applied to a node
  GET_COMPONENTS: "get_components", // Get all local components
  CREATE_COMPONENT_INSTANCE: "create_component_instance", // Create an instance of a component
  SET_CORNER_RADIUS: "set_corner_radius", // Set the corner radius of a node
  CLONE_NODE: "clone_node", // Clone a node
  GET_CSS_ASYNC: "get_css_async", // Get CSS properties from a node
  SCAN_TEXT_NODES: "scan_text_nodes", // Scan all text nodes in a node
  SET_AUTO_LAYOUT: "set_auto_layout", // Configure auto layout properties
  SET_AUTO_LAYOUT_RESIZING: "set_auto_layout_resizing", // Set hug/fill sizing mode on auto layout
  GET_STYLED_TEXT_SEGMENTS: "get_styled_text_segments", // Get styled text segments in a text node
  LOAD_FONT_ASYNC: "load_font_async", // Load a font asynchronously
  SET_EFFECT_STYLE_ID: "set_effect_style_id", // Apply an effect style to a node
  GROUP_OR_UNGROUP_NODES: "group_or_ungroup_nodes", // Group or ungroup nodes
  FLATTEN_NODE: "flatten_node", // Flatten a node (merge vector layers/shapes)
  INSERT_CHILD: "insert_child", // Insert a child node into a parent
  RENAME_LAYER: "rename_layer", // Rename a single node
  AI_RENAME_LAYERS: "ai_rename_layers", // AI-powered rename of specified layers
  INSERT_SVG_VECTOR: "insert_svg_vector", // Insert an SVG as a vector
  GET_SVG_VECTOR: "get_svg_vector", // Get an SVG vector from a node
  GET_IMAGE: "get_image", // Get image fills or export nodes as images
  SET_STYLE: "set_style", // Set both fill and stroke properties
  CREATE_GRADIENT_STYLE: "create_gradient_style", // Create a gradient style variable
  SET_GRADIENT: "set_gradient", // Set a gradient on a node
  SET_EFFECT: "set_effect", // Set effect(s) directly or by style variable on a node
  CREATE_EFFECT_STYLE_VARIABLE: "create_effect_style_variable", // Create an effect style variable
  DETACH_INSTANCES: "detach_instances", // Detach multiple component instances from their masters
  BOOLEAN: "boolean", // Boolean operations: union, subtract, intersect, exclude
  INSERT_IMAGE: "insert_image", // Insert an image from a URL
  CREATE_BUTTON: "create_button", // Create a complete button with background and text
  CONVERT_RECTANGLE_TO_FRAME: "convert_rectangle_to_frame", // Convert a rectangle to a frame
  GENERATE_HTML: "generate_html", // Generate HTML structure from Figma nodes
  GET_ANNOTATION: "get_annotation", // Get annotation(s) for one or more nodes
  SET_ANNOTATION: "set_annotation", // Set, update, or delete annotation(s) for one or more nodes
  JOIN: "join", // Join a specific channel
  SET_GRID: "set_grid", // Set a layout grid on a frame
  GET_GRID: "get_grid", // Get all layout grids for one or more nodes
  SET_GUIDE: "set_guide", // Set a guide on the current page
  GET_GUIDE: "get_guide", // Get all guides on the current page
  SET_CONSTRAINTS: "set_constraints", // Set constraints for one or more nodes
  GET_CONSTRAINTS: "get_constraints", // Get constraints for one or more nodes
  SUBSCRIBE_EVENT: "subscribe_event", // Subscribe to a Figma event
  UNSUBSCRIBE_EVENT: "unsubscribe_event", // Unsubscribe from a Figma event
  SET_SELECTION: "set_selection", // Set the current selection
  GET_PAGE: "getPage", // Get info for a page
  SET_PAGE: "setPage", // Set the current page
  DUPLICATE_PAGE: "duplicate_page", // Duplicate a page and all its children
  SET_NODE_LOCKED: "set_node_locked", // Lock or unlock a node
  SET_NODE_VISIBLE: "set_node_visible", // Show or hide a node
  CREATE_VARIABLE: "create_variable", // Create one or more Figma Variables (design tokens)
  UPDATE_VARIABLE: "update_variable", // Update one or more Figma Variables
  DELETE_VARIABLE: "delete_variable", // Delete one or more Figma Variables
  GET_VARIABLES: "get_variables", // Query Figma Variables
  APPLY_VARIABLE_TO_NODE: "apply_variable_to_node", // Apply a Figma Variable to a node property
  SWITCH_VARIABLE_MODE: "switch_variable_mode", // Switch the mode for a Figma Variable collection
  SET_LETTER_SPACING: "set_letter_spacing", // Set the letter spacing for one or more text nodes
  SET_LINE_HEIGHT: "set_line_height", // Set the line height for one or more text nodes
  SET_PARAGRAPH_SPACING: "set_paragraph_spacing", // Set the paragraph spacing for one or more text nodes
  SET_TEXT_CASE: "set_text_case", // Set the text case for one or more text nodes
  SET_TEXT_DECORATION: "set_text_decoration", // Set the text decoration for one or more text nodes
  SET_VARIANT: "set_variant", // Set, update, or delete variants/properties in a component set
  GET_VARIANT: "get_variant" // Get info about variants/properties for one or more component sets
} as const;

export type McpCommand = typeof MCP_COMMANDS[keyof typeof MCP_COMMANDS];

export type FigmaCommand = typeof MCP_COMMANDS[keyof typeof MCP_COMMANDS];

/**
 * Map each command to its specific params
 */
export type CommandParams = CommandParamsMap[FigmaCommand];

/**
 * Command request structure sent to Figma WebSocket
 */
export interface CommandRequest {
  id: string;
  command: FigmaCommand;
  params: CommandParams;
}

/**
 * WebSocket message envelope for commands
 */
export interface WebSocketMessage {
  id: string;
  type: "join" | "message";
  channel?: string;
  message?: {
    id: string;
    command: FigmaCommand;
    params: CommandParams;
  };
}

/**
 * Pending request tracking map entry type
 */
export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
  lastActivity: number;
}
