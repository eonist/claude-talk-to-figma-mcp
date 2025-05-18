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

export interface CommandParamsMap {
  set_text_style: SetTextStyleParams;
  get_node_styles: GetNodeStylesParams;
  get_svg_vector: GetSvgVectorParams;
  get_image: GetImageParams;
  get_text_style: GetTextStyleParams;
  // ...other command mappings
}
