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

export interface CommandParamsMap {
  set_text_style: SetTextStyleParams;
  get_node_styles: GetNodeStylesParams;
  get_svg_vector: GetSvgVectorParams;
  get_image: GetImageParams;
  get_text_style: GetTextStyleParams;
  set_paragraph_spacing: SetParagraphSpacingParams;
  set_line_height: SetLineHeightParams;
  set_letter_spacing: SetLetterSpacingParams;
  set_text_case: SetTextCaseParams;
  // ...other command mappings
}
