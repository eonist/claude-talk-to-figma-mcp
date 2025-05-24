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
/**
 * Represents a single Figma Variable operation (create, update, or delete).
 */
export interface VariableEntry {
  /** The unique ID of the variable. If present, this entry will update or delete the variable; if absent, a new variable will be created. */
  id?: string;
  /** The name of the variable. Required for create and update operations. */
  name?: string;
  /** The type of the variable (e.g., "FLOAT", "COLOR", "STRING", "BOOLEAN"). */
  type?: string;
  /** The value to set for the variable. The type depends on the variable type. */
  value?: any;
  /** The collection ID or name this variable belongs to. */
  collection?: string;
  /** The mode for multi-mode variables (e.g., "light", "dark"). Optional. */
  mode?: string;
  /** If true, this entry will delete the variable with the given ID. */
  delete?: boolean;
  // ...other fields as needed
}

/**
 * Parameters for the set_variable command (create, update, or delete Figma Variables).
 */
export interface SetVariableParams {
  /** A single variable operation to perform (create, update, or delete). */
  entry?: VariableEntry;
  /** An array of variable operations to perform in batch. */
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

/**
 * Parameters for the get_variable command (query Figma Variables).
 */
export interface GetVariableParams {
  /** The type of variable to query (e.g., "COLOR", "NUMBER", "STRING", "BOOLEAN"). Optional. */
  type?: string;
  /** The collection ID or name to filter variables by. Optional. */
  collection?: string;
  /** The mode to filter variables by (e.g., "light", "dark"). Optional. */
  mode?: string;
  /** An array of variable IDs to query. Optional. */
  ids?: string[];
}

/**
 * Parameters for the apply_variable_to_node command (apply a Figma Variable to a node property).
 */
export interface ApplyVariableToNodeParams {
  /** The ID of the node to which the variable will be applied. */
  nodeId: string;
  /** The ID of the variable to apply. */
  variableId: string;
  /** The property of the node to set (e.g., "fill", "stroke", "opacity"). */
  property: string;
}

/**
 * Parameters for the switch_variable_mode command (switch the mode for a Figma Variable collection).
 */
export interface SwitchVariableModeParams {
  /** The collection ID or name whose mode should be switched. */
  collection: string;
  /** The mode to switch to (e.g., "light", "dark"). */
  mode: string;
}

/**
 * Parameters for the get_annotation command (get annotation(s) for one or more Figma nodes).
 */
export interface GetAnnotationParams {
  /** The ID of a single node to get annotations for. Optional. */
  nodeId?: string;
  /** An array of node IDs to get annotations for in batch. Optional. */
  nodeIds?: string[];
}

/**
 * Parameters for the set_annotation command (set, update, or delete annotation(s) for one or more Figma nodes).
 */
export interface SetAnnotationParams {
  /** A single annotation operation to perform. Optional. */
  entry?: {
    /** The ID of the node to annotate. */
    nodeId: string;
    /** The annotation data to set or update. Optional. */
    annotation?: {
      /** The annotation label (plain text). Optional. */
      label?: string;
      /** The annotation label in Markdown format. Optional. */
      labelMarkdown?: string;
    };
    /** If true, delete the annotation for this node. Optional. */
    delete?: boolean;
  };
  /** An array of annotation operations to perform in batch. Optional. */
  entries?: Array<{
    /** The ID of the node to annotate. */
    nodeId: string;
    /** The annotation data to set or update. Optional. */
    annotation?: {
      /** The annotation label (plain text). Optional. */
      label?: string;
      /** The annotation label in Markdown format. Optional. */
      labelMarkdown?: string;
    };
    /** If true, delete the annotation for this node. Optional. */
    delete?: boolean;
  }>;
}

/**
 * Parameters for the boolean command (perform boolean operations on Figma nodes).
 */
export interface BooleanParams {
  /** The boolean operation to perform: "union", "subtract", "intersect", or "exclude". */
  operation: "union" | "subtract" | "intersect" | "exclude";
  /** If true, perform the operation on the current selection. Optional. */
  selection?: boolean;
  /** The ID of a single node to include in the operation. Optional. */
  nodeId?: string;
  /** An array of node IDs to include in the operation. Must contain at least 1 and at most 100 items. Optional. */
  nodeIds?: string[];
}

/**
 * Parameters for the set_node command (set or insert one or more child nodes into parent nodes).
 */
export interface SetNodeParams {
  /** The ID of the parent node. Required if not using 'operations'. */
  parentId?: string;
  /** The ID of the child node to insert. Required if not using 'operations'. */
  childId?: string;
  /** The index at which to insert the child node (0-based). Optional. */
  index?: number;
  /** An array of set/insert operations to perform in batch. Optional. */
  operations?: Array<{
    /** The ID of the parent node. */
    parentId: string;
    /** The ID of the child node to insert. */
    childId: string;
    /** The index at which to insert the child node (0-based). Optional. */
    index?: number;
    /** If true, maintain the child's absolute position. Optional. */
    maintainPosition?: boolean;
  }>;
  /** Options for the operation (e.g., skipErrors). Optional. */
  options?: {
    /** If true, skip errors and continue processing remaining operations. Optional. */
    skipErrors?: boolean;
  };
}
