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
  // --- Communication ---
  JOIN: "join", // Join a specific communication channel

  // --- Document and Information ---
  GET_DOCUMENT_INFO: "get_document_info", // Get detailed information about the current Figma document
  GET_SELECTION: "get_selection", // Get information about the current selection in Figma
  SET_SELECTION: "set_selection", // Set the current selection in Figma to one or more node IDs
  GET_NODE_INFO: "get_node_info", // Get detailed information about one or more nodes (single or batch)

  // --- Pages ---
  GET_PAGE: "getPage", // Get info for a page
  GET_PAGES: "get_pages", // Get all pages in the current Figma document
  SET_PAGE: "setPage", // Set the current page
  SET_CURRENT_PAGE: "set_current_page", // Set the current active page in Figma
  CREATE_PAGE: "create_page", // Create a new page
  DUPLICATE_PAGE: "duplicate_page", // Duplicate a Figma page and all its children as a new page

  // --- Shapes ---
  CREATE_RECTANGLE: "create_rectangle", // Create one or more rectangles
  CREATE_FRAME: "create_frame", // Create one or more frames
  CREATE_LINE: "create_line", // Create one or more lines
  CREATE_ELLIPSE: "create_ellipse", // Create one or more ellipses
  CREATE_POLYGON: "create_polygon", // Create one or more polygons
  CREATE_STAR: "create_star", // Create one or more star shapes
  CREATE_VECTOR: "create_vector", // Create one or more vectors

  // --- Text ---
  CREATE_TEXT: "create_text", // Create one or more text elements
  SET_TEXT_CONTENT: "set_text_content", // Set text content of an existing node
  GET_STYLED_TEXT_SEGMENTS: "get_styled_text_segments", // Get text segments with specific styling
  GET_TEXT_STYLE: "get_text_style", // Get text style properties for one or more nodes (single or batch)
  SCAN_TEXT_NODES: "scan_text_nodes", // Scan all text nodes in the selected node
  SET_TEXT_STYLE: "set_text_style", // Set one or more text style properties (font, size, weight, spacing, case, decoration, etc.) on one or more nodes (unified)
  SET_PARAGRAPH_SPACING: "set_paragraph_spacing", // Set the paragraph spacing of one or more text nodes (single or batch)
  SET_LINE_HEIGHT: "set_line_height", // Set the line height of one or more text nodes (single or batch, range-based)
  SET_LETTER_SPACING: "set_letter_spacing", // Set the letter spacing of one or more text nodes (single or batch, range-based)
  SET_TEXT_CASE: "set_text_case", // Set the text case of one or more text nodes (single or batch, range-based)
  SET_TEXT_DECORATION: "set_text_decoration", // Set the text decoration of one or more text nodes (single or batch, range-based)
  LOAD_FONT_ASYNC: "load_font_async", // Load a font asynchronously

  // --- Components ---
  GET_COMPONENTS: "get_components", // Get components from the current document, a team library, or remote team libraries (unified)
  CREATE_COMPONENTS_FROM_NODES: "create_components_from_nodes", // Convert nodes to components
  CREATE_COMPONENT_INSTANCE: "create_component_instance", // Create component instances
  CREATE_BUTTON: "create_button", // Create a complete button
  DETACH_INSTANCES: "detach_instances", // Detach one or more component instances from their masters (single or batch)

  // --- Images and SVG ---
  GET_IMAGE: "get_image", // Extract image fills or export nodes as images (single or batch)
  INSERT_IMAGE: "insert_image", // Insert images from URLs, local files, or base64 data (single or batch)
  INSERT_SVG_VECTOR: "insert_svg_vector", // Insert SVG vectors
  GET_SVG_VECTOR: "get_svg_vector", // Get SVG markup for one or more vector nodes

  // --- Styling ---
  GET_STYLES: "get_styles", // Get all styles from the document
  SET_FILL_COLOR: "set_fill_color", // Set fill color
  SET_STROKE_COLOR: "set_stroke_color", // Set stroke color
  SET_STYLE: "set_style", // Set both fill and stroke
  CREATE_GRADIENT_STYLE: "create_gradient_style", // Create one or more gradient styles
  SET_GRADIENT: "set_gradient", // Set gradient(s) directly or by style variable

  // --- Effects and Layout ---
  CREATE_EFFECT_STYLE_VARIABLE: "create_effect_style_variable", // Create one or more effect style variables
  SET_EFFECT: "set_effect", // Set effect(s) directly or by style variable
  SET_EFFECT_STYLE_ID: "set_effect_style_id", // Apply an effect style
  SET_AUTO_LAYOUT: "set_auto_layout", // Configure auto layout (single or batch)
  SET_AUTO_LAYOUT_RESIZING: "set_auto_layout_resizing", // Set hug or fill sizing mode
  SET_CORNER_RADIUS: "set_corner_radius", // Set corner radius

  // --- Positioning & Sizing & Boolean Operations ---
  MOVE_NODE: "move_node", // Move one or more nodes (single or batch)
  REORDER_NODES: "reorder_nodes", // Reorder one or more nodes in their parents' children arrays (single or batch)
  RESIZE_NODE: "resize_node", // Resize a node (single or batch)
  FLATTEN_NODE: "flatten_node", // Flatten a single node (or batch) or selection
  BOOLEAN: "boolean", // Perform union, subtract, intersect, or exclude on nodes or selection

  // --- Node Management ---
  GROUP_OR_UNGROUP_NODES: "group_or_ungroup_nodes", // Group or ungroup nodes
  CONVERT_RECTANGLE_TO_FRAME: "convert_rectangle_to_frame", // Convert a rectangle to a frame
  DELETE_NODE: "delete_node", // Delete one or more nodes
  CLONE_NODE: "clone_node", // Clone a node (single or batch)
  INSERT_CHILD: "insert_child", // Insert a child node into a parent (single or batch)
  SET_NODE_LOCKED: "set_node_locked", // Lock or unlock nodes
  SET_NODE_VISIBLE: "set_node_visible", // Show or hide nodes

  // --- Grids, Guides, and Constraints ---
  SET_GRID: "set_grid", // Create, update, or delete one or more layout grids on nodes
  GET_GRID: "get_grid", // Get all layout grids for one or more nodes
  SET_GUIDE: "set_guide", // Add or delete one or more guides on the current page
  GET_GUIDE: "get_guide", // Get all guides on the current page
  SET_CONSTRAINTS: "set_constraints", // Set constraints for one or more nodes
  GET_CONSTRAINTS: "get_constraints", // Get constraints for one or more nodes

  // --- Figma Variables (Design Tokens) ---
  CREATE_VARIABLE: "create_variable", // Create one or more Figma Variables (design tokens)
  UPDATE_VARIABLE: "update_variable", // Update one or more Figma Variables
  DELETE_VARIABLE: "delete_variable", // Delete one or more Figma Variables
  GET_VARIABLES: "get_variables", // Query Figma Variables by type, collection, mode, or IDs
  APPLY_VARIABLE_TO_NODE: "apply_variable_to_node", // Apply a Figma Variable to a node property
  SWITCH_VARIABLE_MODE: "switch_variable_mode", // Switch the mode for a Figma Variable collection

  // --- Export ---
  EXPORT_NODE_AS_IMAGE: "export_node_as_image", // Export a node as an image
  GENERATE_HTML: "generate_html", // Generate HTML structure from Figma nodes
  GET_CSS_ASYNC: "get_css_async", // Get CSS properties from a node

  // --- Misc ---
  RENAME_LAYER: "rename_layer", // Rename nodes (single or batch, each with its own name)
  AI_RENAME_LAYERS: "ai_rename_layers", // AI-powered renaming 
  SET_VARIANT: "set_variant", // Create, add, rename, delete, organize, or batch create variants/properties in a component set
  GET_VARIANT: "get_variant", // Get info about variants/properties for one or more component sets
  SUBSCRIBE_EVENT: "subscribe_event", // Subscribe to a Figma event (e.g., selection_change, document_change)
  UNSUBSCRIBE_EVENT: "unsubscribe_event", // Unsubscribe from a previously subscribed event
  GET_ANNOTATION: "get_annotation", // Get annotation(s) for one or more nodes
  SET_ANNOTATION: "set_annotation" // Set, update, or delete annotation(s) for one or more nodes
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
