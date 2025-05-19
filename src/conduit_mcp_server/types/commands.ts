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

export type FigmaCommand =
  // Get detailed information about the current Figma document (see commands/figma/read/document-tools.ts)
  | "get_document_info"
  // Get information about the current selection (see commands/figma/read/selection-tools.ts)
  | "get_selection"
  // Get detailed information about a specific node (see commands/figma/read/node-tools.ts)
  | "get_node_info"
  // Create components from node(s) (see commands/figma/create/component-creation/node-tools.ts)
  | "create_components_from_nodes"
  // Create a new rectangle shape node (see commands/figma/create/shape-creation/rectangles.ts)
  | "create_rectangle"
  // Create a new frame node (see commands/figma/create/shape-creation/frames.ts)
  | "create_frame"
  // Create a new text element (see commands/figma/create/text-creation/text-tools.ts)
  | "create_text"
  // Create a new ellipse shape node (see commands/figma/create/shape-creation/ellipses.ts)
  | "create_ellipse"
  // Create a new polygon shape node (see commands/figma/create/shape-creation/polygons.ts)
  | "create_polygon"
  // Create a new star shape node (see commands/figma/create/shape-creation/index.ts)
  | "create_star"
  // Create a new vector node (see commands/figma/create/vector-creation-tools.ts)
  | "create_vector"
  // Create a new line node (see commands/figma/create/shape-creation/lines.ts)
  | "create_line"
  // Set the fill color of a node (see commands/figma/modify/styling)
  | "set_fill_color"
  // Set the stroke color of a node (see commands/figma/modify/styling)
  | "set_stroke_color"
  // Move a node to a new position (see commands/figma/modify/positioning-tools.ts)
  | "move_node"
  // Batch reorder multiple nodes (see commands/figma/modify/layer-management/reorder-layer-tools.ts)
  | "reorder_nodes"
  // Resize a node (see commands/figma/modify/transform-tools.ts)
  | "resize_node"
  // Delete a node (see commands/figma/modify/layer-management/delete-tools.ts)
  | "delete_node"
  // Export a node as an image (see commands/figma/modify/property-manipulation/export-schema.ts)
  | "export_node_as_image"
  // Set the text content of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_text_content"
  // Set one or more text style properties (font, size, weight, spacing, case, decoration, etc.) on one or more nodes (unified)
  | "set_text_style"
  // Get all styles from the document (see commands/figma/read/style-tools.ts)
  | "get_styles"
  // Get all local components (see commands/figma/read/component-tools.ts)
  | "get_components"
  // Create an instance of a component (see commands/figma/create/component-creation/instance-tools.ts)
  | "create_component_instance"
  // Set the corner radius of a node (see commands/figma/modify/property-manipulation/corner-radius-tools.ts)
  | "set_corner_radius"
  // Clone a node (see commands/figma/modify/layer-management/index.ts)
  | "clone_node"
  // Get CSS properties from a node (see commands/figma/read/css-tools.ts)
  | "get_css_async"
  // Scan all text nodes in a node (see commands/figma/read/text-analysis-tools.ts)
  | "scan_text_nodes"
  // Configure auto layout properties (see commands/figma/modify/property-manipulation/auto-layout-tools.ts)
  | "set_auto_layout"
  // Set hug/fill sizing mode on auto layout (see commands/figma/modify/property-manipulation/auto-layout-tools.ts)
  | "set_auto_layout_resizing"
  // Get styled text segments in a text node (see commands/figma/read/text-analysis-tools.ts)
  | "get_styled_text_segments"
  // Load a font asynchronously (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "load_font_async"
  // Apply an effect style to a node (see commands/figma/modify/property-manipulation/effects-tools.ts)
  | "set_effect_style_id"
  // Group or ungroup nodes (see commands/figma/modify/layer-management/group-tools.ts)
  | "group_or_ungroup_nodes"
  // Flatten a node (see commands/figma/modify/layer-management/boolean-tools.ts)
  | "flatten_node"
  // Insert a child node (see commands/figma/modify/layer-management/index.ts)
  | "insert_child"
  // Rename a single node (see commands/figma/modify/rename.ts)
  | "rename_layer"
  // AI-powered rename of specified layers (see commands/figma/modify/rename.ts)
  | "ai_rename_layers"
  // Insert an SVG as a vector (see commands/figma/create/svg-creation-tools.ts)
  | "insert_svg_vector"
  // Set both fill and stroke properties (see commands/figma/modify/styling)
  | "set_style"
  // Create a gradient style variable (see commands/figma/modify/styling)
  | "create_gradient_style"
  // Set a gradient on a node (see commands/figma/modify/styling)
  | "set_gradient"
  // Set effect(s) directly or by style variable on a node (see commands/figma/modify/styling/effect-tools.ts)
  | "set_effect"
  // Create an effect style variable (see commands/figma/modify/styling/effect-tools.ts)
  | "create_effect_style_variable"
  // Detach multiple component instances from their masters (see commands/figma/modify/property-manipulation/detach-instance-tools.ts)
  | "detach_instances"
  // Boolean operations: union, subtract, intersect, exclude (see commands/figma/modify/layer-management/boolean-tools.ts)
  | "boolean"
  // Insert an image from a URL (see commands/figma/create/image-creation/from-url.ts)
  | "insert_image"
  // Create a complete button with background and text (see commands/figma/create/component-creation/button-tools.ts)
  | "create_button"
  // Convert a rectangle to a frame (see commands/figma/modify/layer-management/index.ts)
  | "convert_rectangle_to_frame"
  // Generate HTML structure from Figma nodes (see commands/html-tools.ts)
  | "generate_html"
  // Annotation commands (see commands/figma/annotation-tools.ts)
  | "get_annotation"
  // set annotation
  | "set_annotation"
  // Join a specific channel (see commands/channel.ts)
  | "join"
  // Grid commands (layoutGrids on frames)
  | "set_grid"
  // set grid
  | "get_grid"
  // Guide commands (canvas guides)
  | "set_guide"
  // get guide
  | "get_guide"
  // Constraint commands (set/get constraints)
  | "set_constraints"
  // get constraints
  | "get_constraints"
  // Event subscription commands
  | "subscribe_event"
  // unsubscribe event
  | "unsubscribe_event"
  // set sleection 
   | "set_selection"
  // Variant commands (component variants)
  | "set_variant"
  // get variant
  | "get_variant";

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
