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
export interface CommandParamsMap {
  set_text_style: SetTextStyleParams;
  // ...other command mappings
}
