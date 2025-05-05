import { filterFigmaNode } from "../utils/node-filter.js";
import { logger } from "../utils/logger.js";
import { ensureNodeIdIsString } from "../utils/node-utils.js";
import { FigmaCommand } from "../types/commands.js";
import { sendCommandToFigma, getCurrentChannel, isConnectedToFigma } from "../server/websocket.js";
import { BaseFigmaNode, DocumentInfo, RGBAColor, SelectionInfo } from "../types/figma.js";

/**
 * Client for interacting with Figma via WebSocket
 * 
 * Provides a structured API for:
 * - Reading document and node information
 * - Creating and modifying Figma elements
 * - Managing styles and components
 * - Text operations
 * - Layout operations
 */
export class FigmaClient {
  /**
   * Checks if the client is connected to Figma
   * 
   * @returns {boolean} True if connected, false otherwise
   */
  isConnected(): boolean {
    return isConnectedToFigma();
  }
  
  /**
   * Gets the current channel
   * 
   * @returns {string|null} The current channel or null if not connected
   */
  getCurrentChannel(): string | null {
    return getCurrentChannel();
  }

  /**
   * Executes a command on Figma
   * 
   * @param {FigmaCommand} command - The command to execute
   * @param {any} params - The command parameters
   * @returns {Promise<any>} - The command result
   */
  async executeCommand(command: FigmaCommand, params: any = {}): Promise<any> {
    try {
      logger.debug(`Executing Figma command: ${command}`);
      const result = await sendCommandToFigma(command, params);
      return result;
    } catch (error) {
      logger.error(`Error executing Figma command ${command}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  // Document operations
  
  /**
   * Gets information about the current document
   * 
   * @returns {Promise<DocumentInfo>} The document information
   */
  async getDocumentInfo(): Promise<DocumentInfo> {
    return this.executeCommand("get_document_info");
  }
  
  /**
   * Gets information about the current selection
   * 
   * @returns {Promise<SelectionInfo>} The selection information
   */
  async getSelection(): Promise<SelectionInfo> {
    return this.executeCommand("get_selection");
  }
  
  /**
   * Gets information about a specific node
   * 
   * @param {string} nodeId - The ID of the node to get information about
   * @returns {Promise<BaseFigmaNode>} The node information
   */
  async getNodeInfo(nodeId: string): Promise<BaseFigmaNode> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(nodeId);
    logger.debug(`Getting node info for ID: ${nodeIdString}`);
    
    const result = await this.executeCommand("get_node_info", { nodeId: nodeIdString });
    return filterFigmaNode(result);
  }
  
  /**
   * Gets information about multiple nodes
   * 
   * @param {string[]} nodeIds - The IDs of the nodes to get information about
   * @returns {Promise<BaseFigmaNode[]>} The node information
   */
  async getNodesInfo(nodeIds: string[]): Promise<BaseFigmaNode[]> {
    // Ensure all nodeIds are treated as strings and validate they're not objects
    const nodeIdStrings = nodeIds.map(nodeId => ensureNodeIdIsString(nodeId));
    logger.debug(`Getting info for ${nodeIdStrings.length} nodes`);
    
    const result = await this.executeCommand("get_nodes_info", { nodeIds: nodeIdStrings });
    return result.map(filterFigmaNode);
  }
  
  // Creation operations
  
  /**
   * Creates a rectangle
   * 
   * @param {object} params - Rectangle parameters
   * @returns {Promise<BaseFigmaNode>} The created rectangle
   */
  async createRectangle(params: {
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
    parentId?: string;
    fillColor?: RGBAColor;
    strokeColor?: RGBAColor;
    strokeWeight?: number;
  }): Promise<BaseFigmaNode> {
    // Ensure parentId is treated as a string if provided
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    
    return this.executeCommand("create_rectangle", {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      name: params.name || "Rectangle",
      parentId: parentIdString,
      fillColor: params.fillColor,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  }
  
  /**
   * Creates a frame
   * 
   * @param {object} params - Frame parameters
   * @returns {Promise<BaseFigmaNode>} The created frame
   */
  async createFrame(params: {
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
    parentId?: string;
    fillColor?: RGBAColor;
    strokeColor?: RGBAColor;
    strokeWeight?: number;
  }): Promise<BaseFigmaNode> {
    // Ensure parentId is treated as a string if provided
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    
    return this.executeCommand("create_frame", {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      name: params.name || "Frame",
      parentId: parentIdString,
      fillColor: params.fillColor || { r: 1, g: 1, b: 1, a: 1 },
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  }
  
  /**
   * Creates a text element
   * 
   * @param {object} params - Text parameters
   * @returns {Promise<BaseFigmaNode>} The created text
   */
  async createText(params: {
    x: number;
    y: number;
    text: string;
    fontSize?: number;
    fontWeight?: number;
    fontColor?: RGBAColor;
    name?: string;
    parentId?: string;
  }): Promise<BaseFigmaNode> {
    // Ensure parentId is treated as a string if provided
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    
    return this.executeCommand("create_text", {
      x: params.x,
      y: params.y,
      text: params.text,
      fontSize: params.fontSize || 14,
      fontWeight: params.fontWeight || 400,
      fontColor: params.fontColor || { r: 0, g: 0, b: 0, a: 1 },
      name: params.name || "Text",
      parentId: parentIdString
    });
  }
  
  /**
   * Creates an ellipse
   * 
   * @param {object} params - Ellipse parameters
   * @returns {Promise<BaseFigmaNode>} The created ellipse
   */
  async createEllipse(params: {
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
    parentId?: string;
    fillColor?: RGBAColor;
    strokeColor?: RGBAColor;
    strokeWeight?: number;
  }): Promise<BaseFigmaNode> {
    // Ensure parentId is treated as a string if provided
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    
    return this.executeCommand("create_ellipse", {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      name: params.name || "Ellipse",
      parentId: parentIdString,
      fillColor: params.fillColor,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  }
  
  /**
   * Inserts an SVG vector in Figma
   * 
   * @param {object} params - SVG vector parameters
   * @returns {Promise<BaseFigmaNode>} The created SVG vector node
   */
  async insertSvgVector(params: {
    svg: string;
    x?: number;
    y?: number;
    name?: string;
    parentId?: string;
  }): Promise<BaseFigmaNode> {
    // Ensure parentId is treated as a string if provided
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    
    return this.executeCommand("insert_svg_vector", {
      svg: params.svg,
      x: params.x || 0,
      y: params.y || 0,
      name: params.name || "SVG Vector",
      parentId: parentIdString
    });
  }
  
  // Style operations
  
  /**
   * Sets the fill color of a node
   * 
   * @param {object} params - Fill color parameters
   * @returns {Promise<any>} Operation result
   */
  async setFillColor(params: {
    nodeId: string;
    r: number;
    g: number;
    b: number;
    a?: number;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_fill_color", {
      nodeId: nodeIdString,
      color: {
        r: params.r,
        g: params.g,
        b: params.b,
        a: params.a || 1
      }
    });
  }
  
  /**
   * Sets the stroke color of a node
   * 
   * @param {object} params - Stroke color parameters
   * @returns {Promise<any>} Operation result
   */
  async setStrokeColor(params: {
    nodeId: string;
    r: number;
    g: number;
    b: number;
    a?: number;
    weight?: number;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
      return this.executeCommand("set_stroke_color", {
        nodeId: nodeIdString,
        color: {
          r: params.r,
          g: params.g,
          b: params.b,
          a: params.a || 1
        },
        weight: params.weight || 1
      });
    }

    /**
     * Sets both fill and stroke properties on a node in a single call
     *
     * @param params.nodeId - The node ID to style
     * @param params.fillProps - Optional fill properties
     * @param params.strokeProps - Optional stroke properties
     */
    async setStyle(params: {
      nodeId: string;
      fillProps?: {
        color?: [number, number, number, number];
        visible?: boolean;
        opacity?: number;
        gradient?: any;
      };
      strokeProps?: {
        color?: [number, number, number, number];
        weight?: number;
        align?: "INSIDE" | "CENTER" | "OUTSIDE";
        dashes?: number[];
        visible?: boolean;
      };
    }): Promise<any> {
      return this.executeCommand("set_style", params);
    }

    /**
     * Apply fill and/or stroke styles to multiple nodes in a single call
     *
     * @param params.entries - Array of style configurations per node
     */
    async setStyles(params: {
      entries: Array<{
        nodeId: string;
        fillProps?: {
          color?: [number, number, number, number];
          visible?: boolean;
          opacity?: number;
          gradient?: any;
        };
        strokeProps?: {
          color?: [number, number, number, number];
          weight?: number;
          align?: "INSIDE" | "CENTER" | "OUTSIDE";
          dashes?: number[];
          visible?: boolean;
        };
      }>;
    }): Promise<any> {
      return this.executeCommand("set_styles", params);
    }
  
  // Node operations
  
  /**
   * Moves a node to a new position
   * 
   * @param {object} params - Move parameters
   * @returns {Promise<any>} Operation result
   */
  async moveNode(params: {
    nodeId: string;
    x: number;
    y: number;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("move_node", {
      nodeId: nodeIdString,
      x: params.x,
      y: params.y
    });
  }
  
  /**
   * Clones a node
   * 
   * @param {object} params - Clone parameters
   * @returns {Promise<BaseFigmaNode>} The cloned node
   */
  async cloneNode(params: {
    nodeId: string;
    x?: number;
    y?: number;
  }): Promise<BaseFigmaNode> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("clone_node", {
      nodeId: nodeIdString,
      x: params.x,
      y: params.y
    });
  }
  
  /**
   * Resizes a node
   * 
   * @param {object} params - Resize parameters
   * @returns {Promise<any>} Operation result
   */
  async resizeNode(params: {
    nodeId: string;
    width: number;
    height: number;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("resize_node", {
      nodeId: nodeIdString,
      width: params.width,
      height: params.height
    });
  }
  
  /**
   * Deletes a node
   * 
   * @param {string} nodeId - The ID of the node to delete
   * @returns {Promise<any>} Operation result
   */
  async deleteNode(nodeId: string): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(nodeId);
    logger.debug(`Deleting node with ID: ${nodeIdString}`);
    
    return this.executeCommand("delete_node", { nodeId: nodeIdString });
  }
  
  /**
   * Sets the text content of a node
   * 
   * @param {object} params - Text content parameters
   * @returns {Promise<any>} Operation result
   */
  async setTextContent(params: {
    nodeId: string;
    text: string;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_text_content", {
      nodeId: nodeIdString,
      text: params.text
    });
  }
  
  /**
   * Sets text content for multiple nodes in parallel
   * 
   * @param {object} params - Multiple text content parameters
   * @returns {Promise<any>} Operation result
   */
  async setMultipleTextContents(params: {
    nodeId: string;
    text: Array<{ nodeId: string; text: string }>;
  }): Promise<any> {
    // Ensure parent nodeId is treated as a string and validate it's not an object
    const parentNodeIdString = ensureNodeIdIsString(params.nodeId);
    
    // Also validate all node IDs in the text array
    const validatedTextNodes = params.text.map(item => ({
      nodeId: ensureNodeIdIsString(item.nodeId),
      text: item.text
    }));
    
    return this.executeCommand("set_multiple_text_contents", {
      nodeId: parentNodeIdString,
      text: validatedTextNodes
    });
  }
  
  /**
   * Exports a node as an image
   * 
   * @param {object} params - Export parameters
   * @returns {Promise<{imageData: string, mimeType: string}>} The exported image
   */
  async exportNodeAsImage(params: {
    nodeId: string;
    format?: "PNG" | "JPG" | "SVG" | "PDF";
    scale?: number;
  }): Promise<{imageData: string, mimeType: string}> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("export_node_as_image", {
      nodeId: nodeIdString,
      format: params.format || "PNG",
      scale: params.scale || 1
    });
  }
  
  // Text styling operations
  
  /**
   * Sets the font name of a text node
   * 
   * @param {object} params - Font name parameters
   * @returns {Promise<any>} Operation result
   */
  async setFontName(params: {
    nodeId: string;
    family: string;
    style?: string;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_font_name", {
      nodeId: nodeIdString,
      family: params.family,
      style: params.style
    });
  }
  
  /**
   * Sets the font size of a text node
   * 
   * @param {object} params - Font size parameters
   * @returns {Promise<any>} Operation result
   */
  async setFontSize(params: {
    nodeId: string;
    fontSize: number;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_font_size", {
      nodeId: nodeIdString,
      fontSize: params.fontSize
    });
  }
  
  /**
   * Sets the font weight of a text node
   * 
   * @param {object} params - Font weight parameters
   * @returns {Promise<any>} Operation result
   */
  async setFontWeight(params: {
    nodeId: string;
    weight: number;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_font_weight", {
      nodeId: nodeIdString,
      weight: params.weight
    });
  }
  
  /**
   * Sets the letter spacing of a text node
   * 
   * @param {object} params - Letter spacing parameters
   * @returns {Promise<any>} Operation result
   */
  async setLetterSpacing(params: {
    nodeId: string;
    letterSpacing: number;
    unit?: "PIXELS" | "PERCENT";
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_letter_spacing", {
      nodeId: nodeIdString,
      letterSpacing: params.letterSpacing,
      unit: params.unit || "PIXELS"
    });
  }
  
  /**
   * Sets the line height of a text node
   * 
   * @param {object} params - Line height parameters
   * @returns {Promise<any>} Operation result
   */
  async setLineHeight(params: {
    nodeId: string;
    lineHeight: number;
    unit?: "PIXELS" | "PERCENT" | "AUTO";
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_line_height", {
      nodeId: nodeIdString,
      lineHeight: params.lineHeight,
      unit: params.unit || "PIXELS"
    });
  }
  
  /**
   * Sets the paragraph spacing of a text node
   * 
   * @param {object} params - Paragraph spacing parameters
   * @returns {Promise<any>} Operation result
   */
  async setParagraphSpacing(params: {
    nodeId: string;
    paragraphSpacing: number;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_paragraph_spacing", {
      nodeId: nodeIdString,
      paragraphSpacing: params.paragraphSpacing
    });
  }
  
  /**
   * Sets the text case of a text node
   * 
   * @param {object} params - Text case parameters
   * @returns {Promise<any>} Operation result
   */
  async setTextCase(params: {
    nodeId: string;
    textCase: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_text_case", {
      nodeId: nodeIdString,
      textCase: params.textCase
    });
  }
  
  /**
   * Sets the text decoration of a text node
   * 
   * @param {object} params - Text decoration parameters
   * @returns {Promise<any>} Operation result
   */
  async setTextDecoration(params: {
    nodeId: string;
    textDecoration: "NONE" | "UNDERLINE" | "STRIKETHROUGH";
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_text_decoration", {
      nodeId: nodeIdString,
      textDecoration: params.textDecoration
    });
  }
  
  /**
   * Loads a font asynchronously in Figma
   * 
   * @param {object} params - Font loading parameters
   * @returns {Promise<any>} Operation result
   */
  async loadFontAsync(params: {
    family: string;
    style?: string;
  }): Promise<any> {
    return this.executeCommand("load_font_async", {
      family: params.family,
      style: params.style || "Regular"
    });
  }
  
  /**
   * Sets visual effects (shadows, blurs) on a node
   * 
   * @param {object} params - Effect parameters
   * @returns {Promise<any>} Operation result
   */
  async setEffects(params: {
    nodeId: string;
    effects: Array<{
      type: "DROP_SHADOW" | "INNER_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR";
      color?: { r: number; g: number; b: number; a: number };
      offset?: { x: number; y: number };
      radius?: number;
      spread?: number;
      visible?: boolean;
      blendMode?: string;
    }>;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_effects", {
      nodeId: nodeIdString,
      effects: params.effects
    });
  }
  
  /**
   * Sets the effect style ID for a node
   * 
   * @param {object} params - Effect style parameters
   * @returns {Promise<any>} Operation result
   */
  async setEffectStyleId(params: {
    nodeId: string;
    effectStyleId: string;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_effect_style_id", {
      nodeId: nodeIdString,
      effectStyleId: params.effectStyleId
    });
  }
  
  /**
   * Sets auto layout properties for a node
   * 
   * @param {object} params - Auto layout parameters
   * @returns {Promise<any>} Operation result
   */
  async setAutoLayout(params: {
    nodeId: string;
    layoutMode: "HORIZONTAL" | "VERTICAL" | "NONE";
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    itemSpacing?: number;
    primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
    counterAxisAlignItems?: "MIN" | "CENTER" | "MAX";
    layoutWrap?: "WRAP" | "NO_WRAP";
    strokesIncludedInLayout?: boolean;
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_auto_layout", {
      nodeId: nodeIdString,
      layoutMode: params.layoutMode,
      paddingTop: params.paddingTop,
      paddingBottom: params.paddingBottom,
      paddingLeft: params.paddingLeft,
      paddingRight: params.paddingRight,
      itemSpacing: params.itemSpacing,
      primaryAxisAlignItems: params.primaryAxisAlignItems,
      counterAxisAlignItems: params.counterAxisAlignItems,
      layoutWrap: params.layoutWrap,
      strokesIncludedInLayout: params.strokesIncludedInLayout
    });
  }
  
  /**
   * Sets auto layout resizing mode for a node
   * 
   * @param {object} params - Auto layout resizing parameters
   * @returns {Promise<any>} Operation result
   */
  async setAutoLayoutResizing(params: {
    nodeId: string;
    axis: "horizontal" | "vertical";
    mode: "FIXED" | "HUG" | "FILL";
  }): Promise<any> {
    // Ensure nodeId is treated as a string and validate it's not an object
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    
    return this.executeCommand("set_auto_layout_resizing", {
      nodeId: nodeIdString,
      axis: params.axis,
      mode: params.mode
    });
  }

  /**
   * Apply font settings to multiple text nodes at once
   * 
   * @param {object} params - Font settings to apply
   * @param {Array<{nodeIds?: string[], parentId?: string, font: object}>} params.targets - Array of target configurations
   * @returns {Promise<any>} Operation result
   */
  async setBulkFont(params: {
    targets: Array<{
      nodeIds?: string[];
      parentId?: string;
      font: {
        family?: string;
        style?: string;
        size?: number;
        weight?: number;
      }
    }>;
  }): Promise<any> {
    return this.executeCommand("set_bulk_font", params);
  }
  
  // Other Figma commands can be added in their respective categories
}
