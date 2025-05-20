/**
 * Miscellaneous Figma commands for FigmaClient.
 */
import { MCP_COMMANDS } from "../types/commands.js";

import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaClient } from "./index.js";

export const miscCommands = {
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
