/**
 * Type definitions for Figma commands and responses
 */

/**
 * Defines all available Figma command types that can be sent over WebSocket
 */
export type FigmaCommand =
  | "get_document_info"
  | "get_selection"
  | "get_node_info"
  | "get_nodes_info"
  | "create_rectangle"
  | "create_frame"
  | "create_text"
  | "create_ellipse"
  | "create_polygon"
  | "create_star"
  | "create_vector"
  | "create_line"
  | "set_fill_color"
  | "set_stroke_color"
  | "move_node"
  | "resize_node"
  | "delete_node"
  | "export_node_as_image"
  | "set_text_content"
  | "get_styles"
  | "get_local_components"
  | "get_team_components"
  | "create_component_instance"
  | "set_corner_radius"
  | "clone_node"
  | "scan_text_nodes"
  | "set_multiple_text_contents"
  | "set_auto_layout"
  | "set_auto_layout_resizing"
  | "set_font_name"
  | "set_font_size"
  | "set_font_weight"
  | "set_letter_spacing"
  | "set_line_height"
  | "set_paragraph_spacing"
  | "set_text_case"
  | "set_text_decoration"
  | "get_styled_text_segments"
  | "load_font_async"
  | "get_remote_components"
  | "set_effects"
  | "set_effect_style_id"
  | "group_nodes"
  | "ungroup_nodes"
  | "flatten_node"
  | "insert_child"
  | "rename_layer"
  | "rename_layers"
  | "rename_multiple" 
  | "ai_rename_layers"
  | "insert_svg_vector"
  | "set_bulk_font"
  | "join";

/**
 * Generic interface for command parameters
 */
export interface CommandParams {
  [key: string]: any;
}

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
    params: CommandParams & { commandId: string };
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
