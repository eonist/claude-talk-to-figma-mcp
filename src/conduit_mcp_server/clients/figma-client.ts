/**
 * Client for interacting with Figma via WebSocket.
 *
 * Provides a structured API for:
 * - Reading document and node information
 * - Creation, modification, and deletion of Figma elements
 * - Style and text operations
 * - Layout and transform operations
 *
 * @module clients/figma-client
 * @example
 * import { FigmaClient } from './figma-client';
 * const client = new FigmaClient();
 * await client.connectToFigma('localhost', 3055, 2000);
 * const info = await client.getDocumentInfo();
 * console.log(info);
 */
import { filterFigmaNode } from "../utils/figma/filter-node.js";
import { logger } from "../utils/logger.js";
import { ensureNodeIdIsString } from "../utils/node-utils.js";
import { FigmaCommand, MCP_COMMANDS } from "../types/commands.js";
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
  async executeCommand(command: string, params: any = {}): Promise<any> {
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
    return this.executeCommand(MCP_COMMANDS.GET_DOCUMENT_INFO);
  }
  
  /**
   * Gets information about the current selection
   * 
   * @returns {Promise<SelectionInfo>} The selection information
   */
  async getSelection(): Promise<SelectionInfo> {
    return this.executeCommand(MCP_COMMANDS.GET_SELECTION);
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
    
    const result = await this.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId: nodeIdString });
    return filterFigmaNode(result);
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
    cornerRadius?: number;
  }): Promise<BaseFigmaNode> {
    // Ensure parentId is treated as a string if provided
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    
    return this.executeCommand(MCP_COMMANDS.CREATE_RECTANGLE, {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      name: params.name || "Rectangle",
      parentId: parentIdString,
      fillColor: params.fillColor,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight,
      cornerRadius: params.cornerRadius
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
    
    return this.executeCommand(MCP_COMMANDS.CREATE_FRAME, {
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
    
    return this.executeCommand(MCP_COMMANDS.CREATE_ELLIPSE, {
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

  // Batch SVG insertion

  /**
   * Creates a line in Figma
   *
   * @param {object} params - Line parameters
   * @returns {Promise<BaseFigmaNode>} The created line node
   */
  async createLine(params: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    parentId?: string;
    strokeColor?: RGBAColor;
    strokeWeight?: number;
  }): Promise<BaseFigmaNode> {
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_LINE, {
      x1: params.x1,
      y1: params.y1,
      x2: params.x2,
      y2: params.y2,
      parentId: parentIdString,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  }

  /**
   * Creates a new vector node in Figma
   *
   * @param {object} params - Vector parameters
   * @returns {Promise<BaseFigmaNode>} The created vector node
   */
  async createVector(params: {
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
    parentId?: string;
    vectorPaths?: Array<{ windingRule?: string; data: string }>;
    fillColor?: RGBAColor;
    strokeColor?: RGBAColor;
    strokeWeight?: number;
  }): Promise<BaseFigmaNode> {
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_VECTOR, {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      name: params.name || "Vector",
      parentId: parentIdString,
      vectorPaths: params.vectorPaths,
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
    
    return this.executeCommand(MCP_COMMANDS.INSERT_SVG_VECTOR, {
      svg: params.svg,
      x: params.x || 0,
      y: params.y || 0,
      name: params.name || "SVG Vector",
      parentId: parentIdString
    });
  }
  
  /**
   * Creates a polygon node in Figma.
   * @param {object} params - Polygon parameters.
   * @param {number} params.x - X position.
   * @param {number} params.y - Y position.
   * @param {number} params.width - Width of the polygon.
   * @param {number} params.height - Height of the polygon.
   * @param {number} [params.sides] - Number of sides.
   * @param {string} [params.name] - Name of the node.
   * @param {string} [params.parentId] - Parent node ID.
   * @param {RGBAColor} [params.fillColor] - Fill color.
   * @param {RGBAColor} [params.strokeColor] - Stroke color.
   * @param {number} [params.strokeWeight] - Stroke weight.
   * @returns {Promise<BaseFigmaNode>} The created polygon node.
   */
  async createPolygon(params: {
    x: number;
    y: number;
    width: number;
    height: number;
    sides?: number;
    name?: string;
    parentId?: string;
    fillColor?: RGBAColor;
    strokeColor?: RGBAColor;
    strokeWeight?: number;
  }): Promise<BaseFigmaNode> {
    const parentIdString = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_POLYGON, {
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      sides: params.sides,
      name: params.name,
      parentId: parentIdString,
      fillColor: params.fillColor,
      strokeColor: params.strokeColor,
      strokeWeight: params.strokeWeight
    });
  }
  


  // Batch SVG insertion
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
    
    return this.executeCommand(MCP_COMMANDS.SET_FILL_COLOR, {
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
    
      return this.executeCommand(MCP_COMMANDS.SET_STROKE_COLOR, {
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
  async setStyle(this: FigmaClient, params: any) {
    return this.executeCommand(MCP_COMMANDS.SET_STYLE, params);
  }

  /**
   * Sets effects on a node in Figma.
   * @param params - effect operation parameters
   * @returns {Promise<any>}
   */
  async setEffects(this: FigmaClient, params: any) {
    return this.executeCommand(MCP_COMMANDS.SET_EFFECT, params);
  }

  /**
   * Sets the effect style ID for a node in Figma.
   * @param params - { nodeId: string, effectStyleId: string }
   * @returns {Promise<any>}
   */
  async setEffectStyleId(this: FigmaClient, params: { nodeId: string, effectStyleId: string }) {
    return this.executeCommand(MCP_COMMANDS.SET_EFFECT_STYLE_ID, params);
  }

  
  // Node operations
  
  /**
   * Moves one or more nodes to a new position.
   * Accepts either { nodeId } for single or { nodeIds } for batch, plus x and y.
   */
  async moveNode(params: {
    nodeId?: string;
    nodeIds?: string[];
    x: number;
    y: number;
  }): Promise<any> {
    let nodeIds: string[] = [];
    if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
      nodeIds = params.nodeIds.map(ensureNodeIdIsString);
    } else if (params.nodeId) {
      nodeIds = [ensureNodeIdIsString(params.nodeId)];
    } else {
      throw new Error("moveNode: Provide either nodeId or nodeIds.");
    }
    return this.executeCommand(MCP_COMMANDS.MOVE_NODE, {
      nodeIds,
      x: params.x,
      y: params.y
    });
  }
  
  /**
   * Clones one or more nodes.
   * Accepts either { nodeId } for single or { nodeIds } for batch, plus optional params.
   */
  async cloneNode(params: {
    nodeId?: string;
    nodeIds?: string[];
    x?: number;
    y?: number;
    positions?: { x: number; y: number }[];
    offsetX?: number;
    offsetY?: number;
    parentId?: string;
  }): Promise<any> {
    let nodeIds: string[] = [];
    if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
      nodeIds = params.nodeIds.map(ensureNodeIdIsString);
    } else if (params.nodeId) {
      nodeIds = [ensureNodeIdIsString(params.nodeId)];
    } else {
      throw new Error("cloneNode: Provide either nodeId or nodeIds.");
    }
    const { x, y, positions, offsetX, offsetY, parentId } = params;
    return this.executeCommand(MCP_COMMANDS.CLONE_NODE, {
      nodeIds,
      x,
      y,
      positions,
      offsetX,
      offsetY,
      parentId: parentId ? ensureNodeIdIsString(parentId) : undefined
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
    
    return this.executeCommand(MCP_COMMANDS.RESIZE_NODE, {
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
    
    return this.executeCommand(MCP_COMMANDS.DELETE_NODE, { nodeId: nodeIdString });
  }

  /**
   * Flattens one or more nodes in Figma.
   * @param params - { nodeIds: string[] }
   * @returns {Promise<any>}
   */
  async flattenNode(this: FigmaClient, params: { nodeIds: string[] }) {
    return this.executeCommand(MCP_COMMANDS.FLATTEN_NODE, params);
  }

  /**
   * Groups or ungroups nodes in Figma.
   * @param params - { group: boolean, nodeIds?: string[], name?: string, nodeId?: string }
   * @returns {Promise<any>}
   */
  async groupOrUngroupNodes(this: FigmaClient, params: { group: boolean, nodeIds?: string[], name?: string, nodeId?: string }) {
    return this.executeCommand(MCP_COMMANDS.GROUP_OR_UNGROUP_NODES, params);
  }

  /**
   * Locks or unlocks a node in Figma.
   * @param params - { nodeId: string, locked: boolean }
   * @returns {Promise<any>}
   */
  async setNodeLocked(this: FigmaClient, params: { nodeId: string, locked: boolean }) {
    return this.executeCommand(MCP_COMMANDS.SET_NODE_LOCKED, params);
  }

  /**
   * Shows or hides a node in Figma.
   * @param params - { nodeId: string, visible: boolean }
   * @returns {Promise<any>}
   */
  async setNodeVisible(this: FigmaClient, params: { nodeId: string, visible: boolean }) {
    return this.executeCommand(MCP_COMMANDS.SET_NODE_VISIBLE, params);
  }

  /**
   * Sets a guide in Figma.
   * @param params - guide operation parameters
   * @returns {Promise<any>}
   */
  async setGuide(this: FigmaClient, params: any) {
    return this.executeCommand(MCP_COMMANDS.SET_GUIDE, params);
  }

  /**
   * Gets all guides in Figma.
   * @param params - (optional) parameters
   * @returns {Promise<any>}
   */
  async getGuide(this: FigmaClient, params: any = {}) {
    return this.executeCommand(MCP_COMMANDS.GET_GUIDE, params);
  }

  /**
   * Sets a grid in Figma.
   * @param params - grid operation parameters
   * @returns {Promise<any>}
   */
  async setGrid(this: FigmaClient, params: any) {
    return this.executeCommand(MCP_COMMANDS.SET_GRID, params);
  }

  /**
   * Sets constraints in Figma.
   * @param params - constraint operation parameters
   * @returns {Promise<any>}
   */
  async setConstraints(this: FigmaClient, params: any) {
    return this.executeCommand(MCP_COMMANDS.SET_CONSTRAINTS, params);
  }

  /**
   * Gets constraints in Figma.
   * @param params - get constraints parameters
   * @returns {Promise<any>}
   */
  async getConstraints(this: FigmaClient, params: any) {
    return this.executeCommand(MCP_COMMANDS.GET_CONSTRAINTS, params);
  }

  /**
   * Deletes multiple nodes
   *
   * @param {string[]} nodeIds - Array of node IDs to delete
   * @returns {Promise<{success: string[]; failed: string[]}>} Operation results
   */
  // (Removed: use deleteNode({ nodeIds }) instead)
  
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
    
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_CONTENT, {
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
    
    // Unified set_text_content now handles both single and batch updates.
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_CONTENT, {
      texts: validatedTextNodes
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
    
    return this.executeCommand(MCP_COMMANDS.EXPORT_NODE_AS_IMAGE, {
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
    
    return this.executeCommand(MCP_COMMANDS.SET_LETTER_SPACING, {
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
    
    return this.executeCommand(MCP_COMMANDS.SET_LINE_HEIGHT, {
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
    
    return this.executeCommand(MCP_COMMANDS.SET_PARAGRAPH_SPACING, {
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
    
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_CASE, {
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
    
    return this.executeCommand(MCP_COMMANDS.SET_TEXT_DECORATION, {
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
    return this.executeCommand(MCP_COMMANDS.LOAD_FONT_ASYNC, {
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
    
    return this.executeCommand(MCP_COMMANDS.SET_EFFECT, {
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
    
    return this.executeCommand(MCP_COMMANDS.SET_EFFECT_STYLE_ID, {
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
    
    return this.executeCommand(MCP_COMMANDS.SET_AUTO_LAYOUT, {
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
    
    return this.executeCommand(MCP_COMMANDS.SET_AUTO_LAYOUT_RESIZING, {
      nodeId: nodeIdString,
      axis: params.axis,
      mode: params.mode
    });
  }
  
}
