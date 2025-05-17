/**
 * Type definitions for Figma commands and responses
 */

/**
 * Defines all available Figma command types that can be sent over WebSocket
 */
import { CommandParamsMap } from "./command-params.js";

export type FigmaCommand =
  // Get detailed information about the current Figma document (see commands/figma/read/document-tools.ts)
  | "get_document_info"
  // Get information about the current selection (see commands/figma/read/selection-tools.ts)
  | "get_selection"
  // Get detailed information about a specific node (see commands/figma/read/node-tools.ts)
  | "get_node_info"
  // Get information about multiple nodes (see commands/figma/read/node-tools.ts)
  | "get_nodes_info"
  // Create components from node(s) (see commands/figma/create/component-creation/node-tools.ts)
  | "create_components_from_nodes"
  // Create a new rectangle shape node (see commands/figma/create/shape-creation/rectangles.ts)
  | "create_rectangle"
  // Create a new frame node (see commands/figma/create/shape-creation/frames.ts)
  | "create_frame"
  // Create a new text element (see commands/figma/create/text-creation/text-tools.ts)
  | "create_text"
  // Create a bounded text box (see commands/figma/create/text-creation/text-tools.ts)
  | "create_bounded_text"
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
  // Resize a node (see commands/figma/modify/transform-tools.ts)
  | "resize_node"
  // Delete a node (see commands/figma/modify/layer-management/delete-tools.ts)
  | "delete_node"
  // Export a node as an image (see commands/figma/modify/property-manipulation/export-schema.ts)
  | "export_node_as_image"
  // Set the text content of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_text_content"
  // Get all styles from the document (see commands/figma/read/style-tools.ts)
  | "get_styles"
  // Get all local components (see commands/figma/read/component-tools.ts)
  | "get_local_components"
  // Get all team components (see commands/figma/read/component-tools.ts)
  | "get_team_components"
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
  // Set multiple text contents in parallel (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_multiple_text_contents"
  // Configure auto layout properties (see commands/figma/modify/property-manipulation/auto-layout-tools.ts)
  | "set_auto_layout"
  // Set hug/fill sizing mode on auto layout (see commands/figma/modify/property-manipulation/auto-layout-tools.ts)
  | "set_auto_layout_resizing"
  // Set the font family and style of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_font_name"
  // Set the font size of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_font_size"
  // Set the font weight of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_font_weight"
  // Set the letter spacing of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_letter_spacing"
  // Set the line height of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_line_height"
  // Set the paragraph spacing of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_paragraph_spacing"
  // Set the text case of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_text_case"
  // Set the text decoration of a text node (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_text_decoration"
  // Get styled text segments in a text node (see commands/figma/read/text-analysis-tools.ts)
  | "get_styled_text_segments"
  // Load a font asynchronously (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "load_font_async"
  // Get remote components from team libraries (see commands/figma/read/component-tools.ts)
  | "get_remote_components"
  // Set visual effects of a node (see commands/figma/modify/property-manipulation/effects-tools.ts)
  | "set_effects"
  // Apply an effect style to a node (see commands/figma/modify/property-manipulation/effects-tools.ts)
  | "set_effect_style_id"
  // Group nodes (see commands/figma/modify/layer-management/group-tools.ts)
  | "group_nodes"
  // Ungroup a group node (see commands/figma/modify/layer-management/group-tools.ts)
  | "ungroup_nodes"
  // Flatten a node (see commands/figma/modify/layer-management/boolean-tools.ts)
  | "flatten_node"
  // Flatten a selection of nodes (see commands/figma/modify/layer-management/boolean-tools.ts)
  | "flatten_selection"
  // Flatten multiple nodes (see commands/figma/modify/layer-management/flatten-nodes-tools.ts)
  | "flatten_nodes"
  // Insert a child node (see commands/figma/modify/layer-management/index.ts)
  | "insert_child"
  // Rename a single node (see commands/figma/modify/rename.ts)
  | "rename_layer"
  // Rename multiple layers with distinct names (see commands/figma/modify/rename.ts)
  | "rename_multiple" 
  // AI-powered rename of specified layers (see commands/figma/modify/rename.ts)
  | "ai_rename_layers"
  // Insert an SVG as a vector (see commands/figma/create/svg-creation-tools.ts)
  | "insert_svg_vector"
  // Set the font for multiple nodes (see commands/figma/modify/property-manipulation/batch-text-schema.ts)
  | "set_bulk_font"
  // Set both fill and stroke properties (see commands/figma/modify/styling)
  | "set_style"
  // Create a gradient paint style (see commands/figma/modify/styling)
  | "create_gradient_variable"
  // Apply a gradient style to a node (see commands/figma/modify/styling)
  | "apply_gradient_style"
  // Apply a gradient directly to a node (see commands/figma/modify/styling)
  | "apply_direct_gradient"
  // Detach a component instance from its master (see commands/figma/modify/property-manipulation/detach-instance-tools.ts)
  | "detach_instance"
  // Detach multiple component instances from their masters (see commands/figma/modify/property-manipulation/detach-instance-tools.ts)
  | "detach_instances"
  // Union selected shapes (see commands/figma/modify/layer-management/boolean-tools.ts)
  | "union_selection"
  // Subtract top shapes from bottom shape (see commands/figma/modify/layer-management/boolean-tools.ts)
  | "subtract_selection"
  // Intersect selected shapes (see commands/figma/modify/layer-management/boolean-tools.ts)
  | "intersect_selection"
  // Exclude overlapping areas of selected shapes (see commands/figma/modify/layer-management/boolean-tools.ts)
  | "exclude_selection"
  // Insert an image from a URL (see commands/figma/create/image-creation/from-url.ts)
  | "insert_image"
  // Create a complete button with background and text (see commands/figma/create/component-creation/button-tools.ts)
  | "create_button"
  // Convert a rectangle to a frame (see commands/figma/modify/layer-management/index.ts)
  | "convert_rectangle_to_frame"
  // Generate HTML structure from Figma nodes (see commands/html-tools.ts)
  | "generate_html"
  // Join a specific channel (see commands/channel.ts)
  | "join";

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
