/**
 * Miscellaneous Figma commands for FigmaClient.
 */
import { MCP_COMMANDS } from "../../types/commands.js";

import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaClient } from "./index.js";

export const miscCommands = {
  /**
   * Gets document info.
   * @returns {Promise<DocumentInfo>}
   */
  async getDocumentInfo(this: FigmaClient): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.GET_DOCUMENT_INFO);
  },

  /**
   * Gets the current selection.
   * @returns {Promise<any>}
   */
  async getSelection(this: FigmaClient): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.GET_SELECTION);
  },

  /**
   * Gets CSS asynchronously for a node.
   * @param params - { nodeId?: string; format?: "object"|"string"|"inline" }
   * @returns {Promise<any>}
   */
  async getCssAsync(this: FigmaClient, params?: { nodeId?: string; format?: "object"|"string"|"inline" }): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.GET_CSS_ASYNC, params || {});
  },

  /**
   * Gets all pages in the document.
   * @returns {Promise<Array<{ id: string, name: string, childCount: number }>>}
   */
  async getDocPages(this: FigmaClient): Promise<Array<{ id: string, name: string, childCount: number }>> {
    return this.executeCommand(MCP_COMMANDS.GET_DOC_PAGES);
  },
  /**
   * Inserts an image node into Figma from a URL or data.
   * @param params - Image properties (URL, position, size, etc.)
   * @returns The created image node.
   */
  async insertImage(
    this: FigmaClient,
    params: {
      url: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      name?: string;
      parentId?: string;
    }
  ): Promise<any> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.SET_IMAGE, {
      url: params.url,
      x: params.x || 0,
      y: params.y || 0,
      width: params.width,
      height: params.height,
      name: params.name || "Image",
      parentId: parent,
    });
  },

  /**
   * Creates a complete button with background and text.
   * @param params - Button properties (position, size, style, etc.)
   * @returns The IDs of the created button elements.
   */
  async createButton(
    this: FigmaClient,
    params: {
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
  ): Promise<{frameId: string, backgroundId: string, textId: string}> {
    const parent = params.parentId ? ensureNodeIdIsString(params.parentId) : undefined;
    return this.executeCommand(MCP_COMMANDS.CREATE_BUTTON, {
      ...params,
      name: params.name || "Button",
      parentId: parent,
    });
  },

  /**
   * Exports a node as an image
   * 
   * @param {object} params - Export parameters
   * @returns {Promise<{imageData: string, mimeType: string}>} The exported image
   */
  async exportNodeAsImage(
    this: FigmaClient,
    params: {
      nodeId: string;
      format?: "PNG" | "JPG" | "SVG" | "PDF";
      scale?: number;
    }
  ): Promise<{ imageData: string; mimeType: string }> {
    const nodeIdString = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand(MCP_COMMANDS.EXPORT_NODE_AS_IMAGE, {
      nodeId: nodeIdString,
      format: params.format || "PNG",
      scale: params.scale || 1
    });
  },
  /**
   * Duplicate a Figma page and all its children as a new page.
   * @param {string} pageId - The ID of the page to duplicate.
   * @param {string} [newPageName] - Optional name for the new page.
   * @returns {Promise<{ newPageId: string, newPageName: string, clonedIds: string[] }>}
   */
  async duplicatePage(this: any, pageId: string, newPageName?: string) {
    if (!pageId) throw new Error("Missing pageId parameter");
    return await this.executeCommand(MCP_COMMANDS.DUPLICATE_PAGE, { pageId, newPageName });
  }
};
