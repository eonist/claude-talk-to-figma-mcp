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
/**
 * Parameters for setting, updating, or deleting a layout grid on a node.
 */
export interface SetGridEntry {
  nodeId: string;
  gridIndex?: number;
  properties?: GridProperties;
  delete?: boolean;
}
/**
 * Parameters for the set_grid command, supporting single or batch grid operations.
 */
export interface SetGridParams {
  entry?: SetGridEntry;
  entries?: SetGridEntry[];
}
/**
 * Parameters for the get_grid command, specifying one or more node IDs to query.
 */
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

/**
 * Parameters for the set_guide command, supporting single or batch guide operations.
 */
export interface SetGuideParams {
  guide?: GuideEntry;
  guides?: GuideEntry[];
}
/**
 * Parameters for the get_guide command. No parameters required.
 */
export interface GetGuideParams {} // No params

/**
 * Unified constraint command parameter types
 */
export interface ConstraintEntry {
  nodeId: string;
  horizontal: "left" | "right" | "center" | "scale" | "stretch";
  vertical: "top" | "bottom" | "center" | "scale" | "stretch";
}
/**
 * Parameters for the set_constraint command, supporting single or batch constraint operations.
 */
export interface SetConstraintsParams {
  constraint?: ConstraintEntry;
  constraints?: ConstraintEntry[];
  applyToChildren?: boolean;
  maintainAspectRatio?: boolean;
}
/**
 * Parameters for the get_constraint command, specifying node IDs and whether to include children.
 */
export interface GetConstraintsParams {
  nodeId?: string;
  nodeIds?: string[];
  includeChildren?: boolean;
}

/**
 * Unified event subscription command parameter types
 */
export interface EventSubscriptionParams {
  eventType: string;
  filter?: any;
  subscribe: boolean;
  subscriptionId?: string; // Required for unsubscribe
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
/**
 * Parameters for the set_variant command, supporting single or batch variant operations.
 */
export interface SetVariantParams {
  variant?: VariantOp;
  variants?: VariantOp[];
}
/**
 * Parameters for the get_variant command, specifying one or more component set IDs.
 */
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
  GET_DOC_PAGES: "get_doc_pages", // Get all pages in the current Figma document
  SET_PAGE: "setPage", // Set the current page
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
  SET_TEXT: "set_text", // Set or create one or more text elements
  SET_TEXT_CONTENT: "set_text_content", // Set text content of an existing node
  GET_STYLED_TEXT_SEGMENTS: "get_styled_text_segments", // Get text segments with specific styling
  GET_TEXT_STYLE: "get_text_style", // Get text style properties for one or more nodes (single or batch)
  SCAN_TEXT_NODES: "scan_text_nodes", // Scan all text nodes in the selected node
  SET_TEXT_STYLE: "set_text_style", // Set one or more text style properties (font, size, weight, spacing, case, decoration, etc.) on one or more nodes (unified)
  LOAD_FONT_ASYNC: "load_font_async", // Load a font asynchronously

  // --- Components ---
  GET_COMPONENTS: "get_components", // Get components from the current document, a team library, or remote team libraries (unified)
  CREATE_COMPONENTS_FROM_NODE: "create_components_from_node", // Convert node(s) to components
  CREATE_COMPONENT_INSTANCE: "create_component_instance", // Create component instances
  CREATE_BUTTON: "create_button", // Create a complete button
  DETACH_INSTANCES: "detach_instances", // Detach one or more component instances from their masters (single or batch)

  // --- Images and SVG ---
  GET_IMAGE: "get_image", // Extract image fills or export nodes as images (single or batch)
  SET_IMAGE: "set_image", // Set or insert images from URLs, local files, or base64 data (single or batch)
  SET_SVG_VECTOR: "set_svg_vector", // Set or insert SVG vectors
  GET_SVG_VECTOR: "get_svg_vector", // Get SVG markup for one or more vector nodes

  // --- Styling ---
  GET_DOC_STYLE: "get_doc_style", // Get all styles from the document
  GET_NODE_STYLE: "get_node_style", // Get all style properties for one or more nodes
  GET_FILL_AND_STROKE: "get_fill_and_stroke", // Get fill and stroke properties for one or more nodes
  SET_FILL_AND_STROKE: "set_fill_and_stroke", // Set fill and/or stroke color(s) for one or more nodes
  SET_STYLE: "set_style", // Set style or styles
  CREATE_GRADIENT_STYLE: "create_gradient_style", // Create one or more gradient styles
  SET_GRADIENT: "set_gradient", // Set gradient(s) directly or by style variable

  // --- Effects and Layout ---
  CREATE_EFFECT_STYLE_VARIABLE: "create_effect_style_variable", // Create one or more effect style variables
  SET_EFFECT: "set_effect", // Set effect(s) directly or by style variable
  APPLY_EFFECT_STYLE: "apply_effect_style", // Apply an effect style
  SET_AUTO_LAYOUT: "set_auto_layout", // Configure auto layout (single or batch)
  SET_AUTO_LAYOUT_RESIZING: "set_auto_layout_resizing", // Set hug or fill sizing mode
  SET_CORNER_RADIUS: "set_corner_radius", // Set corner radius

  // --- Positioning & Sizing & Boolean Operations ---
  MOVE_NODE: "move_node", // Move one or more nodes to new coordinates, supports single or batch operations
  REORDER_NODE: "reorder_node", // Change the order of one or more nodes within their parent's children array, supports single or batch operations
  RESIZE_NODE: "resize_node", // Resize one or more nodes to specified width and height, supports single or batch operations
  FLATTEN_NODE: "flatten_node", // Merge all child vector layers and shapes of a node into a single vector layer, supports single node, batch, or current selection
  BOOLEAN: "boolean", // Perform boolean operations (union, subtract, intersect, exclude) on one or more nodes or the current selection

  // --- Node Management ---
  GROUP_NODE: "group_node", // Group or ungroup nodes; supports grouping multiple nodes or ungrouping a group node
  CONVERT_RECTANGLE_TO_FRAME: "convert_rectangle_to_frame", // Convert a rectangle node into a frame node
  DELETE_NODE: "delete_node", // Delete one or more nodes from the document
  DUPLICATE_NODE: "duplicate_node", // Clone one or more nodes; supports single or batch duplication
  SET_NODE: "set_node", // Insert or set a child node into a parent node at an optional index position
  SET_NODE_PROP: "set_node_prop", // Set properties (e.g., locked, visible) on one or more nodes

  // --- Grids, Guides, and Constraints ---
  SET_GRID: "set_grid", // Create, update, or delete layout grids on one or more nodes
  GET_GRID: "get_grid", // Retrieve all layout grids for one or more nodes
  SET_GUIDE: "set_guide", // Add or delete guides on the current page
  GET_GUIDE: "get_guide", // Retrieve all guides on the current page
  SET_CONSTRAINT: "set_constraint", // Set layout constraints (horizontal and vertical) for one or more nodes
  GET_CONSTRAINT: "get_constraint", // Get layout constraints for one or more nodes

  // --- Figma Variables (Design Tokens) ---
  SET_VARIABLE: "set_variable", // Create, update, or delete one or more Figma design tokens (variables)
  GET_VARIABLE: "get_variable", // Query Figma variables by type, collection, mode, or specific IDs
  APPLY_VARIABLE_TO_NODE: "apply_variable_to_node", // Apply a Figma variable to a specific node property (e.g., fill, stroke)
  SWITCH_VARIABLE_MODE: "switch_variable_mode", // Switch the mode (e.g., light/dark) for a Figma variable collection

  // --- Export ---
  EXPORT_NODE_AS_IMAGE: "export_node_as_image", // Export a node as an image in various formats
  GET_HTML: "get_html", // Generate HTML structure from Figma nodes
  GET_CSS_ASYNC: "get_css_async", // Retrieve CSS properties from a node asynchronously

  // --- Misc ---
  RENAME_LAYER: "rename_layer", // Rename one or more nodes, each with its own new name
  SET_VARIANT: "set_variant", // Create, add, rename, delete, organize, or batch create variants/properties in a component set
  GET_VARIANT: "get_variant", // Retrieve information about variants/properties for one or more component sets
  SUBSCRIBE_EVENT: "subscribe_event", // Subscribe or unsubscribe to Figma events (e.g., selection_change, document_change)
  GET_ANNOTATION: "get_annotation", // Retrieve annotations for one or more nodes
  SET_ANNOTATION: "set_annotation" // Set, update, or delete annotations for one or more nodes
} as const;

/**
 * Union type of all available MCP command string literals.
 */
export type McpCommand = typeof MCP_COMMANDS[keyof typeof MCP_COMMANDS];
/**
 * Union type of all available Figma command string literals.
 */
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
