/**
 * Type definitions for Figma commands and responses
 */

/**
 * Defines all available Figma command types that can be sent over WebSocket
 */
import {
  SetTextStyleParams,
  GetNodeStylesParams,
  GetSvgVectorParams,
  GetImageParams,
  GetTextStyleParams,
  SetAutoLayoutParams,
  SetParagraphSpacingParams,
  SetLineHeightParams,
  SetLetterSpacingParams,
  SetTextCaseParams,
  SetVariableParams,
  SetNodePropParams,
} from "./command-params.js";

// Example: add more param types as needed from command-params.js

// Tuple of command definitions: name and paramType (for type safety)

// These must match the MCP_COMMANDS names. So MCP_COMMANDS.GET_PAGE -> "get_page", getPage wont work. and will return undifned and cause client not to work
export const COMMAND_DEFS = [
  { name: "join", paramType: {} as any },
  { name: "get_document_info", paramType: {} as any },
  { name: "get_selection", paramType: {} as any },
  { name: "set_selection", paramType: {} as any },
  { name: "get_node_info", paramType: {} as any },
  { name: "get_page", paramType: {} as any },
  { name: "set_page", paramType: {} as any },
  { name: "get_doc_pages", paramType: {} as any },
  { name: "duplicate_page", paramType: {} as any },
  { name: "create_rectangle", paramType: {} as any },
  { name: "create_frame", paramType: {} as any },
  { name: "create_line", paramType: {} as any },
  { name: "create_ellipse", paramType: {} as any },
  { name: "create_polygon", paramType: {} as any },
  { name: "create_star", paramType: {} as any },
  { name: "create_vector", paramType: {} as any },
  { name: "get_vector", paramType: {} as any },
  { name: "set_text", paramType: {} as any },
  { name: "set_text_content", paramType: {} as any },
  { name: "get_styled_text_segments", paramType: {} as any },
  { name: "get_text_style", paramType: {} as GetTextStyleParams },
  { name: "set_text_style", paramType: {} as SetTextStyleParams },
  { name: "scan_text_nodes", paramType: {} as any },
  { name: "load_font_async", paramType: {} as any },
  { name: "get_components", paramType: {} as any },
  { name: "create_components_from_node", paramType: {} as any },
  { name: "create_component_instance", paramType: {} as any },
  { name: "create_button", paramType: {} as any },
  { name: "detach_instances", paramType: {} as any },
  { name: "get_image", paramType: {} as GetImageParams },
  { name: "set_image", paramType: {} as any },
  { name: "set_svg_vector", paramType: {} as any },
  { name: "get_svg_vector", paramType: {} as GetSvgVectorParams },
  { name: "get_doc_style", paramType: {} as any },
  { name: "get_node_style", paramType: {} as GetNodeStylesParams },
  { name: "get_fill_and_stroke", paramType: {} as GetNodeStylesParams },
  { name: "set_fill_and_stroke", paramType: {} as any },
  { name: "set_style", paramType: {} as any },
  { name: "create_gradient_style", paramType: {} as any },
  { name: "set_gradient", paramType: {} as any },
  { name: "create_effect_style_variable", paramType: {} as any },
  { name: "set_effect", paramType: {} as any },
  { name: "apply_effect_style", paramType: {} as any },
  { name: "set_auto_layout", paramType: {} as SetAutoLayoutParams },
  { name: "set_auto_layout_resizing", paramType: {} as any },
  { name: "set_corner_radius", paramType: {} as any },
  { name: "move_node", paramType: {} as any },
  { name: "reorder_node", paramType: {} as any },
  { name: "resize_node", paramType: {} as any },
  { name: "rotate_node", paramType: {} as any },
  { name: "flatten_node", paramType: {} as any },
  { name: "boolean", paramType: {} as any },
  { name: "group_node", paramType: {} as any },
  { name: "convert_rectangle_to_frame", paramType: {} as any },
  { name: "delete_node", paramType: {} as any },
  { name: "duplicate_node", paramType: {} as any },
  { name: "set_node", paramType: {} as any },
  { name: "set_node_prop", paramType: {} as SetNodePropParams },
  { name: "set_matrix_transform", paramType: {} as import("./command-params.js").SetMatrixTransformParams },
  { name: "set_grid", paramType: {} as any },
  { name: "get_grid", paramType: {} as any },
  { name: "set_guide", paramType: {} as any },
  { name: "get_guide", paramType: {} as any },
  { name: "set_constraint", paramType: {} as any },
  { name: "get_constraint", paramType: {} as any },
  { name: "set_variable", paramType: {} as SetVariableParams },
  { name: "get_variable", paramType: {} as any },
  { name: "apply_variable_to_node", paramType: {} as any },
  { name: "switch_variable_mode", paramType: {} as any },
  { name: "export_node_as_image", paramType: {} as any },
  { name: "get_html", paramType: {} as any },
  { name: "get_css_async", paramType: {} as any },
  { name: "rename_layer", paramType: {} as any },
  { name: "set_variant", paramType: {} as any },
  { name: "get_variant", paramType: {} as any },
  { name: "subscribe_event", paramType: {} as any },
  { name: "get_annotation", paramType: {} as any },
  { name: "set_annotation", paramType: {} as any },
] as const;

// Generate MCP_COMMANDS: UPPERCASE keys mapping to string command names
export const MCP_COMMANDS = Object.fromEntries(
  COMMAND_DEFS.map(def => [def.name.toUpperCase(), def.name])
) as Record<string, typeof COMMAND_DEFS[number]["name"]>;

// Types
export type McpCommand = typeof COMMAND_DEFS[number]["name"];
export type FigmaCommand = typeof COMMAND_DEFS[number]["name"];

// Optional: type mapping for param types
export type CommandParamsMap = {
  [K in typeof COMMAND_DEFS[number] as K["name"]]: K["paramType"];
};
export type CommandParams = CommandParamsMap[FigmaCommand];

// Command request structure sent to Figma WebSocket
export interface CommandRequest {
  id: string;
  command: FigmaCommand;
  params: CommandParams;
}

// WebSocket message envelope for commands
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

// Pending request tracking map entry type
export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
  lastActivity: number;
}
