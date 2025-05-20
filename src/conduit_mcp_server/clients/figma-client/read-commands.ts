import { filterFigmaNode } from "../../utils/figma/filter-node.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaCommand, BaseFigmaNode, DocumentInfo, SelectionInfo } from "./types.js";
import { MCP_COMMANDS } from "../types/commands.js";
import { getCurrentChannel as getCurrentChannelWs } from "../server/websocket.js";
import type { FigmaClient } from "./index.js";

export const readCommands = {
  /**
   * Gets the current channel.
   * @returns {string | null}
   */
  getCurrentChannel(this: FigmaClient): string | null {
    return getCurrentChannelWs();
  },

  async getDocumentInfo(this: FigmaClient): Promise<DocumentInfo> {
    return this.executeCommand(MCP_COMMANDS.GET_DOCUMENT_INFO);
  },

  async getSelection(this: FigmaClient): Promise<SelectionInfo> {
    return this.executeCommand(MCP_COMMANDS.GET_SELECTION);
  },



  async getCssAsync(this: FigmaClient, params?: { nodeId?: string; format?: "object"|"string"|"inline" }): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.GET_CSS_ASYNC, params || {});
  },

  // --- Added for page management ---
  async getPages(this: FigmaClient): Promise<Array<{ id: string, name: string, childCount: number }>> {
    return this.executeCommand(MCP_COMMANDS.GET_PAGES);
  },

};
