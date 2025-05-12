import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import type { FigmaCommand } from "./types.js";
import type { FigmaClient } from "./index.js";

/**
 * Commands related to layout operations in Figma
 */
export const layoutCommands = {
  /**
   * Configure auto layout properties for a node in Figma
   * 
   * @param {object} params - Auto layout parameters
   * @param {string} params.nodeId - ID of the node to configure auto layout for
   * @param {string} params.layoutMode - Layout mode (HORIZONTAL, VERTICAL, or NONE)
   * @param {number} [params.paddingTop] - Top padding in pixels
   * @param {number} [params.paddingBottom] - Bottom padding in pixels
   * @param {number} [params.paddingLeft] - Left padding in pixels
   * @param {number} [params.paddingRight] - Right padding in pixels
   * @param {number} [params.itemSpacing] - Spacing between items in pixels
   * @param {string} [params.primaryAxisAlignItems] - Primary axis alignment
   * @param {string} [params.counterAxisAlignItems] - Counter axis alignment
   * @param {string} [params.layoutWrap] - Whether items should wrap
   * @param {boolean} [params.strokesIncludedInLayout] - Whether strokes affect layout
   * @returns {Promise<any>} - Layout operation result
   */
  async setAutoLayout(
    this: FigmaClient,
    params: {
      nodeId: string;
      layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
      paddingTop?: number;
      paddingBottom?: number;
      paddingLeft?: number;
      paddingRight?: number;
      itemSpacing?: number;
      primaryAxisAlignItems?: string;
      counterAxisAlignItems?: string;
      layoutWrap?: string;
      strokesIncludedInLayout?: boolean;
    }
  ): Promise<any> {
    const nodeId = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand("set_auto_layout", {
      ...params,
      nodeId
    });
  },

  /**
   * Set hug or fill sizing mode on an auto layout frame or child node
   * 
   * @param {object} params - Auto layout resizing parameters
   * @param {string} params.nodeId - ID of the node to configure
   * @param {string} params.axis - The axis to configure (horizontal or vertical)
   * @param {string} params.mode - The sizing mode (FIXED, HUG, or FILL)
   * @returns {Promise<any>} - Layout operation result
   */
  async setAutoLayoutResizing(
    this: FigmaClient,
    params: {
      nodeId: string;
      axis: "horizontal" | "vertical";
      mode: "FIXED" | "HUG" | "FILL";
    }
  ): Promise<any> {
    const nodeId = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand("set_auto_layout_resizing", {
      ...params,
      nodeId
    });
  },

  /**
   * Group nodes in Figma
   * 
   * @param {object} params - Grouping parameters
   * @param {string[]} params.nodeIds - Array of node IDs to group
   * @param {string} [params.name] - Optional name for the new group
   * @returns {Promise<any>} - Group operation result
   */
  async groupNodes(
    this: FigmaClient,
    params: {
      nodeIds: string[];
      name?: string;
    }
  ): Promise<any> {
    const ids = params.nodeIds.map(ensureNodeIdIsString);
    return this.executeCommand("group_nodes", {
      ...params,
      nodeIds: ids
    });
  },

  /**
   * Ungroup a group node in Figma
   * 
   * @param {object} params - Ungrouping parameters
   * @param {string} params.nodeId - ID of the group to ungroup
   * @returns {Promise<any>} - Ungroup operation result
   */
  async ungroupNodes(
    this: FigmaClient,
    params: {
      nodeId: string;
    }
  ): Promise<any> {
    const nodeId = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand("ungroup_nodes", {
      nodeId
    });
  }
};
