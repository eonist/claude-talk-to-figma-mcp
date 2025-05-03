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
  
  // Other Figma commands can be added in their respective categories
}
