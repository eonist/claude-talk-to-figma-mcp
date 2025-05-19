import { filterFigmaNode } from "../../utils/figma/filter-node.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaCommand, BaseFigmaNode, DocumentInfo, SelectionInfo } from "./types.js";
import { MCP_COMMANDS } from "../types/commands.js";
import type { FigmaClient } from "./index.js";

export const readCommands = {
  async getDocumentInfo(this: FigmaClient): Promise<DocumentInfo> {
    return this.executeCommand(MCP_COMMANDS.GET_DOCUMENT_INFO);
  },

  async getSelection(this: FigmaClient): Promise<SelectionInfo> {
    return this.executeCommand(MCP_COMMANDS.GET_SELECTION);
  },

  async getNodeInfo(this: FigmaClient, nodeId: string): Promise<BaseFigmaNode> {
    const id = ensureNodeIdIsString(nodeId);
    const result = await this.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId: id });
    return filterFigmaNode(result);
  },


  async getCssAsync(this: FigmaClient, params?: { nodeId?: string; format?: "object"|"string"|"inline" }): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.GET_CSS_ASYNC, params || {});
  },

  // --- Added for page management ---
  async getPages(this: FigmaClient): Promise<Array<{ id: string, name: string, childCount: number }>> {
    return this.executeCommand(MCP_COMMANDS.GET_PAGES);
  },

};
