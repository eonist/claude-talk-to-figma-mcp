/**
 * Parameters for the unified set_text_style command.
 * - nodeId: (string, optional) Single node to update.
 * - styles: (object, optional) Key-value pairs of style properties to set.
 * - entries: (array, optional) Array of { nodeId, styles } for batch updates.
 * At least one of (nodeId + styles) or entries is required.
 * Supported style keys: fontName, fontSize, fontWeight, letterSpacing, lineHeight, paragraphSpacing, textCase, textDecoration, etc.
 */
export interface SetTextStyleParams {
  nodeId?: string;
  styles?: {
    fontName?: string | { family: string; style?: string };
    fontSize?: number;
    fontWeight?: number;
    letterSpacing?: number;
    lineHeight?: number;
    paragraphSpacing?: number;
    textCase?: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
    textDecoration?: "NONE" | "UNDERLINE" | "STRIKETHROUGH";
    // Extendable for future text style properties
    [key: string]: any;
  };
  entries?: Array<{
    nodeId: string;
    styles: SetTextStyleParams["styles"];
  }>;
}

/**
 * CommandParamsMap: Maps FigmaCommand strings to their parameter interfaces.
 * Only set_text_style is included here for now.
 */
/**
 * Parameters for get_node_styles (single or batch).
 * - nodeId: (string, optional) Single node to inspect.
 * - nodeIds: (array of string, optional) Array of node IDs for batch.
 * At least one of nodeId or nodeIds is required.
 */
export interface GetNodeStylesParams {
  nodeId?: string;
  nodeIds?: string[];
}

/**
 * Parameters for get_svg_vector (single or batch).
 * - nodeId: (string, optional) Single vector node to extract SVG from.
 * - nodeIds: (array of string, optional) Array of vector node IDs for batch.
 * At least one of nodeId or nodeIds is required.
 */
export interface GetSvgVectorParams {
  nodeId?: string;
  nodeIds?: string[];
}

/**
 * Parameters for get_image (single or batch).
 * - nodeId: (string, optional) Single node to extract image from.
 * - nodeIds: (array of string, optional) Array of node IDs for batch.
 * - fillIndex: (number, optional) For nodes with multiple fills, which fill to extract (default: 0).
 * At least one of nodeId or nodeIds is required.
 */
export interface GetImageParams {
  nodeId?: string;
  nodeIds?: string[];
  fillIndex?: number;
}

/**
 * Parameters for get_text_style (single or batch).
 * - nodeId: (string, optional) Single node to extract text style from.
 * - nodeIds: (array of string, optional) Array of node IDs for batch.
 * At least one of nodeId or nodeIds is required.
 */
export interface GetTextStyleParams {
  nodeId?: string;
  nodeIds?: string[];
}

/**
 * Parameters for set_auto_layout (single or batch).
 * - layout: (object, optional) Single auto-layout config.
 * - layouts: (array of objects, optional) Batch of auto-layout configs.
 * - options: (object, optional) { skipErrors?: boolean, maintainPosition?: boolean }
 * At least one of layout or layouts is required.
 */
export interface SetAutoLayoutParams {
  layout?: {
    nodeId: string;
    mode: "HORIZONTAL" | "VERTICAL" | "NONE";
    primaryAxisSizing?: "FIXED" | "AUTO";
    counterAxisSizing?: "FIXED" | "AUTO";
    itemSpacing?: number;
    padding?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    alignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  };
  layouts?: Array<{
    nodeId: string;
    mode: "HORIZONTAL" | "VERTICAL" | "NONE";
    primaryAxisSizing?: "FIXED" | "AUTO";
    counterAxisSizing?: "FIXED" | "AUTO";
    itemSpacing?: number;
    padding?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    alignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  }>;
  options?: {
    skipErrors?: boolean;
    maintainPosition?: boolean;
  };
}

/**
 * Parameters for set_paragraph_spacing (single or batch).
 * - entry: (object, optional) Single paragraph spacing config.
 * - entries: (array of objects, optional) Batch of configs.
 * At least one of entry or entries is required.
 */
export interface SetParagraphSpacingParams {
  entry?: {
    nodeId: string;
    paragraphSpacing: number;
  };
  entries?: Array<{
    nodeId: string;
    paragraphSpacing: number;
  }>;
}

/**
 * Parameters for set_line_height (single or batch).
 * - operation: (object, optional) Single line height config.
 * - operations: (array of objects, optional) Batch of configs.
 * - options: (object, optional) { skipErrors?: boolean, loadMissingFonts?: boolean }
 * At least one of operation or operations is required.
 */
export interface SetLineHeightParams {
  operation?: {
    nodeId: string;
    ranges: Array<{
      start: number;
      end: number;
      value?: number;
      unit: "PIXELS" | "PERCENT" | "AUTO";
    }>;
  };
  operations?: Array<{
    nodeId: string;
    ranges: Array<{
      start: number;
      end: number;
      value?: number;
      unit: "PIXELS" | "PERCENT" | "AUTO";
    }>;
  }>;
  options?: {
    skipErrors?: boolean;
    loadMissingFonts?: boolean;
  };
}

/**
 * Parameters for set_letter_spacing (single or batch).
 * - operation: (object, optional) Single letter spacing config.
 * - operations: (array of objects, optional) Batch of configs.
 * - options: (object, optional) { skipErrors?: boolean, loadMissingFonts?: boolean }
 * At least one of operation or operations is required.
 */
export interface SetLetterSpacingParams {
  operation?: {
    nodeId: string;
    spacings: Array<{
      start: number;
      end: number;
      value: number;
      unit: "PIXELS" | "PERCENT";
    }>;
  };
  operations?: Array<{
    nodeId: string;
    spacings: Array<{
      start: number;
      end: number;
      value: number;
      unit: "PIXELS" | "PERCENT";
    }>;
  }>;
  options?: {
    skipErrors?: boolean;
    loadMissingFonts?: boolean;
  };
}

/**
 * Parameters for set_text_case (single or batch).
 * - operation: (object, optional) Single text case config.
 * - operations: (array of objects, optional) Batch of configs.
 * - options: (object, optional) { skipErrors?: boolean, loadMissingFonts?: boolean }
 * At least one of operation or operations is required.
 */
export interface SetTextCaseParams {
  operation?: {
    nodeId: string;
    ranges: Array<{
      start: number;
      end: number;
      value: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE" | "SMALL_CAPS" | "SMALL_CAPS_FORCED";
    }>;
  };
  operations?: Array<{
    nodeId: string;
    ranges: Array<{
      start: number;
      end: number;
      value: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE" | "SMALL_CAPS" | "SMALL_CAPS_FORCED";
    }>;
  }>;
  options?: {
    skipErrors?: boolean;
    loadMissingFonts?: boolean;
  };
}

/**
 * Parameters for set_variable (create, update, delete Figma Variables).
 * - entry: (object, optional) Single variable operation.
 * - entries: (array, optional) Batch of variable operations.
 * Each entry can be create (no id), update (id present), or delete (id + delete: true).
 */
export interface VariableEntry {
  id?: string; // If present, update or delete; if absent, create
  name?: string; // Required for create/update
  type?: string; // e.g., "FLOAT", "COLOR", etc.
  value?: any;   // The value to set (type depends on variable type)
  collection?: string; // Collection ID or name
  mode?: string; // Optional: for multi-mode variables
  delete?: boolean; // If true, delete the variable with this id
  // ...other fields as needed
}
export interface SetVariableParams {
  entry?: VariableEntry;
  entries?: VariableEntry[];
}

/**
 * Parameters for set_node_prop (set node properties like locked, visible, etc.).
 * - nodeId: (string, optional) Single node to update.
 * - nodeIds: (array, optional) Array of node IDs for batch.
 * - properties: (object, required) Properties to set (locked, visible, etc.).
 */
export interface SetNodePropParams {
  nodeId?: string;
  nodeIds?: string[];
  properties: {
    locked?: boolean;
    visible?: boolean;
    // Extendable for more node properties
    [key: string]: any;
  };
}
// fixme: figure out the significance of these:
export interface CommandParamsMap {
  // --- Communication ---
  join: any;

  // --- Document and Information ---
  get_document_info: any;
  get_selection: any;
  set_selection: any;
  get_node_info: any;

  // --- Pages ---
  getPage: any;
  get_doc_pages: any;
  setPage: any;
  duplicate_page: any;

  // --- Shapes ---
  create_rectangle: any;
  create_frame: any;
  create_line: any;
  create_ellipse: any;
  create_polygon: any;
  create_star: any;
  create_vector: any;

  // --- Text ---
  set_text: any;
  set_text_content: any;
  get_styled_text_segments: any;
  get_text_style: GetTextStyleParams;
  set_text_style: SetTextStyleParams;
  scan_text_nodes: any;
  load_font_async: any;

  // --- Components ---
  get_components: any;
  create_components_from_node: any;
  create_component_instance: any;
  create_button: any;
  detach_instances: any;

  // --- Images and SVG ---
  get_image: GetImageParams;
  set_image: any;
  set_svg_vector: any;
  get_svg_vector: GetSvgVectorParams;

  // --- Styling ---
  get_doc_style: any;
  get_node_style: GetNodeStylesParams;
  get_fill_and_stroke: GetNodeStylesParams;
  set_fill_and_stroke: any;
  set_style: any;
  create_gradient_style: any;
  set_gradient: any;

  // --- Effects and Layout ---
  create_effect_style_variable: any;
  set_effect: any;
  apply_effect_style: any;
  set_auto_layout: SetAutoLayoutParams;
  set_auto_layout_resizing: any;
  set_corner_radius: any;

  // --- Positioning & Sizing & Boolean Operations ---
  move_node: any;
  reorder_node: any;
  resize_node: any;
  flatten_node: any;
  boolean: any;

  // --- Node Management ---
  group_node: any;
  convert_rectangle_to_frame: any;
  delete_node: any;
  duplicate_node: any;
  set_node: any;
  set_node_prop: SetNodePropParams;

  // --- Grids, Guides, and Constraints ---
  set_grid: any;
  get_grid: any;
  set_guide: any;
  get_guide: any;
  set_constraint: any;
  get_constraint: any;

  // --- Figma Variables (Design Tokens) ---
  set_variable: SetVariableParams;
  get_variable: any;
  apply_variable_to_node: any;
  switch_variable_mode: any;

  // --- Export ---
  export_node_as_image: any;
  get_html: any;
  get_css_async: any;

  // --- Misc ---
  rename_layer: any;
  ai_rename_layer: any;
  set_variant: any;
  get_variant: any;
  subscribe_event: any;
  get_annotation: any;
  set_annotation: any;
}
