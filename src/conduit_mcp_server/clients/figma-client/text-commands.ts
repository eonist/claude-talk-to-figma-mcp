import { MCP_COMMANDS } from "../../types/commands.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaClient } from "./index.js";
import type { BaseFigmaNode, RGBAColor } from "./types.js";

/**
 * Text-related Figma commands.
 */
export const textCommands = {
  /**
   * Creates a text element
   * 
   * @param {object} params - Text parameters
   * @returns {Promise<BaseFigmaNode>} The created text
   */
  async createText(
    this: FigmaClient,
    params: {
      x: number;
      y: number;
      text: string;
      fontSize?: number;
      fontWeight?: number;
      fontColor?: RGBAColor;
      name?: string;
      parentId?: string;
    }
  ): Promise<BaseFigmaNode> {
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_TEXT, {
      x: params.x,
      y: params.y,
      text: params.text,
      fontSize: params.fontSize || 14,
      fontWeight: params.fontWeight || 400,
      fontColor: params.fontColor || { r: 0, g: 0, b: 0, a: 1 },
      name: params.name || "Text",
      parentId: parentIdString
    });
  },

  /**
   * Sets the text content of a node
   * 
   * @param {object} params - Text content parameters
   * @returns {Promise<any>} Operation result
   */
  async setTextContent(
    this: FigmaClient,
    params: {
      nodeId: string;
      text: string;
    }
  ): Promise<any> {
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_CONTENT, {
      nodeId: nodeIdString,
      text: params.text
    });
  },

  /**
   * Sets text content for multiple nodes in parallel
   * 
   * @param {object} params - Multiple text content parameters
   * @returns {Promise<any>} Operation result
   */
  async setMultipleTextContents(
    this: FigmaClient,
    params: {
      nodeId: string;
      text: Array<{ nodeId: string; text: string }>;
    }
  ): Promise<any> {
    const parentNodeIdString = ensureNodeIdIsString(params.nodeId);
    const validatedTextNodes = params.text.map(item => ({
      nodeId: ensureNodeIdIsString(item.nodeId),
      text: item.text
    }));
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_CONTENT, {
      texts: validatedTextNodes
    });
  },


  /**
   * Sets the letter spacing of a text node
   * 
   * @param {object} params - Letter spacing parameters
   * @returns {Promise<any>} Operation result
   */
  async setLetterSpacing(
    this: FigmaClient,
    params: {
      nodeId: string;
      letterSpacing: number;
      unit?: "PIXELS" | "PERCENT";
    }
  ): Promise<any> {
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    // SET_LETTER_SPACING is deprecated; use SET_TEXT_STYLE
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_STYLE, {
      nodeId: nodeIdString,
      letterSpacing: params.letterSpacing,
      unit: params.unit || "PIXELS"
    });
  },

  /**
   * Sets the line height of a text node
   * 
   * @param {object} params - Line height parameters
   * @returns {Promise<any>} Operation result
   */
  async setLineHeight(
    this: FigmaClient,
    params: {
      nodeId: string;
      lineHeight: number;
      unit?: "PIXELS" | "PERCENT" | "AUTO";
    }
  ): Promise<any> {
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    // SET_LINE_HEIGHT is deprecated; use SET_TEXT_STYLE
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_STYLE, {
      nodeId: nodeIdString,
      lineHeight: params.lineHeight,
      unit: params.unit || "PIXELS"
    });
  },

  /**
   * Sets the paragraph spacing of a text node
   * 
   * @param {object} params - Paragraph spacing parameters
   * @returns {Promise<any>} Operation result
   */
  async setParagraphSpacing(
    this: FigmaClient,
    params: {
      nodeId: string;
      paragraphSpacing: number;
    }
  ): Promise<any> {
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    // SET_PARAGRAPH_SPACING is deprecated; use SET_TEXT_STYLE
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_STYLE, {
      nodeId: nodeIdString,
      paragraphSpacing: params.paragraphSpacing
    });
  },

  /**
   * Sets the text case of a text node
   * 
   * @param {object} params - Text case parameters
   * @returns {Promise<any>} Operation result
   */
  async setTextCase(
    this: FigmaClient,
    params: {
      nodeId: string;
      textCase: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
    }
  ): Promise<any> {
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    // SET_TEXT_CASE is deprecated; use SET_TEXT_STYLE
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_STYLE, {
      nodeId: nodeIdString,
      textCase: params.textCase
    });
  },

  /**
   * Sets the text decoration of a text node
   * 
   * @param {object} params - Text decoration parameters
   * @returns {Promise<any>} Operation result
   */
  async setTextDecoration(
    this: FigmaClient,
    params: {
      nodeId: string;
      textDecoration: "NONE" | "UNDERLINE" | "STRIKETHROUGH";
    }
  ): Promise<any> {
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    // SET_TEXT_DECORATION is deprecated; use SET_TEXT_STYLE
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_STYLE, {
      nodeId: nodeIdString,
      textDecoration: params.textDecoration
    });
  },

  /**
   * Loads a font asynchronously in Figma
   * 
   * @param {object} params - Font loading parameters
   * @returns {Promise<any>} Operation result
   */
  async loadFontAsync(
    this: FigmaClient,
    params: {
      family: string;
      style?: string;
    }
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.LOAD_FONT_ASYNC, {
      family: params.family,
      style: params.style || "Regular"
    });
  }
};
