import { filterFigmaNode } from "../../utils/figma/filter-node.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaCommand, BaseFigmaNode, DocumentInfo, SelectionInfo } from "./types.js";
import type { FigmaClient } from "./index.js";

export const readCommands = {
  async getDocumentInfo(this: FigmaClient): Promise<DocumentInfo> {
    return this.executeCommand("get_document_info");
  },

  async getSelection(this: FigmaClient): Promise<SelectionInfo> {
    return this.executeCommand("get_selection");
  },

  async getNodeInfo(this: FigmaClient, nodeId: string): Promise<BaseFigmaNode> {
    const id = ensureNodeIdIsString(nodeId);
    const result = await this.executeCommand("get_node_info", { nodeId: id });
    return filterFigmaNode(result);
  },

  async getNodesInfo(this: FigmaClient, nodeIds: string[]): Promise<BaseFigmaNode[]> {
    const ids = nodeIds.map(ensureNodeIdIsString);
    const result = await this.executeCommand("get_nodes_info", { nodeIds: ids });
    return result.map(filterFigmaNode);
  },

  async getCssAsync(this: FigmaClient, params?: { nodeId?: string; format?: "object"|"string"|"inline" }): Promise<any> {
    return this.executeCommand("get_css_async", params || {});
  },

  // --- Added for page management ---
  async getPages(this: FigmaClient): Promise<Array<{ id: string, name: string, childCount: number }>> {
    return this.executeCommand("get_pages");
  },

  async setCurrentPage(this: FigmaClient, pageId: string): Promise<{ id: string, name: string, childCount: number }> {
    const id = ensureNodeIdIsString(pageId);
    return this.executeCommand("set_current_page", { pageId: id });
  }
};
