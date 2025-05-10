/**
 * Centralized parameter interfaces for each Figma command.
 * Each interface extends BaseCommandParams to include a required commandId.
 */

export interface BaseCommandParams {
  /** Unique identifier for matching request/response */
  commandId: string;
}

/** Parameters for create_rectangle command */
export interface CreateRectangleParams extends BaseCommandParams {
  x: number;
  y: number;
  width: number;
  height: number;
  name?: string;
  parentId?: string;
}

/** Parameters for create_frame command */
export interface CreateFrameParams extends BaseCommandParams {
  x: number;
  y: number;
  width: number;
  height: number;
  name?: string;
  parentId?: string;
  fillColor?: { r: number; g: number; b: number; a?: number };
  strokeColor?: { r: number; g: number; b: number; a?: number };
  strokeWeight?: number;
}

/** Parameters for create_text command */
export interface CreateTextParams extends BaseCommandParams {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontWeight?: number;
  fontColor?: { r: number; g: number; b: number; a?: number };
  name?: string;
  parentId?: string;
}

/** Parameters for create_bounded_text command */
export interface CreateBoundedTextParams extends BaseCommandParams {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  fontWeight?: number;
  fontColor?: { r: number; g: number; b: number; a?: number };
  name?: string;
  parentId?: string;
}

/** Parameters for create_ellipse command */
export interface CreateEllipseParams extends BaseCommandParams {
  x: number;
  y: number;
  width: number;
  height: number;
  name?: string;
  parentId?: string;
  fillColor?: { r: number; g: number; b: number; a?: number };
  strokeColor?: { r: number; g: number; b: number; a?: number };
  strokeWeight?: number;
}

/** Parameters for create_polygon command */
export interface CreatePolygonParams extends BaseCommandParams {
  x: number;
  y: number;
  width: number;
  height: number;
  sides?: number;
  name?: string;
  parentId?: string;
  fillColor?: { r: number; g: number; b: number; a?: number };
  strokeColor?: { r: number; g: number; b: number; a?: number };
  strokeWeight?: number;
}

/** Parameters for create_star command */
export interface CreateStarParams extends BaseCommandParams {
  x: number;
  y: number;
  width: number;
  height: number;
  points?: number;
  innerRadius?: number;
  name?: string;
  parentId?: string;
  fillColor?: { r: number; g: number; b: number; a?: number };
  strokeColor?: { r: number; g: number; b: number; a?: number };
  strokeWeight?: number;
}

/** Parameters for move_node command */
export interface MoveNodeParams extends BaseCommandParams {
  nodeId: string;
  x: number;
  y: number;
}

/** Parameters for move_nodes command */
export interface MoveNodesParams extends BaseCommandParams {
  nodeIds: string[];
  x: number;
  y: number;
}

/** Parameters for resize_node command */
export interface ResizeNodeParams extends BaseCommandParams {
  nodeId: string;
  width: number;
  height: number;
}

/** Parameters for resize_nodes command */
export interface ResizeNodesParams extends BaseCommandParams {
  nodeIds: string[];
  dimensions?: Array<{ width: number; height: number }>;
  targetSize?: { width: number; height: number };
  scalePercent?: number;
  maintainAspectRatio?: boolean;
  resizeMode?: "exact" | "fit" | "longest";
}

/** Parameters for delete_node command */
export interface DeleteNodeParams extends BaseCommandParams {
  nodeId: string;
}

/** Parameters for delete_nodes command */
export interface DeleteNodesParams extends BaseCommandParams {
  nodeIds: string[];
}

/** Parameters for set_fill_color command */
export interface SetFillColorParams extends BaseCommandParams {
  nodeId: string;
  r: number;
  g: number;
  b: number;
  a?: number;
}

/** Parameters for set_stroke_color command */
export interface SetStrokeColorParams extends BaseCommandParams {
  nodeId: string;
  r: number;
  g: number;
  b: number;
  a?: number;
  weight?: number;
}

/** Parameters for set_text_content command */
export interface SetTextContentParams extends BaseCommandParams {
  nodeId: string;
  text: string;
}

/** Parameters for create_button command */
export interface CreateButtonParams extends BaseCommandParams {
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  style?: {
    background?: { r: number; g: number; b: number; a?: number };
    text?: { r: number; g: number; b: number; a?: number };
    fontSize?: number;
    fontWeight?: number;
    cornerRadius?: number;
  };
  name?: string;
  parentId?: string;
}

/** Parameters for convert_rectangle_to_frame command */
export interface ConvertRectangleToFrameParams extends BaseCommandParams {
  nodeId: string;
  elementsToPlace?: string[];
  deleteOriginal?: boolean;
}

/** Parameters for apply_direct_gradient command */
export interface ApplyDirectGradientParams extends BaseCommandParams {
  nodeId: string;
  gradientType: "LINEAR" | "RADIAL" | "ANGULAR" | "DIAMOND";
  stops: Array<{
    position: number;
    color: [number, number, number, number];
  }>;
  applyTo?: "FILL" | "STROKE" | "BOTH";
}

/** Parameters for get_css_async command */
export interface GetCssAsyncParams extends BaseCommandParams {
  /** Optional ID of the node to get CSS from – defaults to first selected node */
  nodeId?: string;
  /** Format for CSS output: 'object', 'string', or 'inline' */
  format?: "object" | "string" | "inline";
}

/**
 * Map each FigmaCommand to its parameter interface.
 */
export interface GenerateHtmlParams extends BaseCommandParams {
  /** Target node ID */
  nodeId: string;
  /** HTML output format: 'semantic', 'div-based', or 'webcomponent' */
  format?: "semantic" | "div-based" | "webcomponent";
  /** CSS handling mode: 'inline', 'classes', or 'external' */
  cssMode?: "inline" | "classes" | "external";
}

export interface CommandParamsMap {
  create_rectangle: CreateRectangleParams;
  create_frame: CreateFrameParams;
  create_text: CreateTextParams;
  create_bounded_text: CreateBoundedTextParams;
  create_ellipse: CreateEllipseParams;
  create_polygon: CreatePolygonParams;
  create_star: CreateStarParams;
  move_node: MoveNodeParams;
  move_nodes: MoveNodesParams;
  resize_node: ResizeNodeParams;
  resize_nodes: ResizeNodesParams;
  delete_node: DeleteNodeParams;
  delete_nodes: DeleteNodesParams;
  set_fill_color: SetFillColorParams;
  set_stroke_color: SetStrokeColorParams;
  set_text_content: SetTextContentParams;
  create_button: CreateButtonParams;
  convert_rectangle_to_frame: ConvertRectangleToFrameParams;
  apply_direct_gradient: ApplyDirectGradientParams;
  generate_html: GenerateHtmlParams;
  // TODO: add mappings for all remaining Figma commands
  [command: string]: BaseCommandParams;
}
