import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../types/commands.js";
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
    return this.executeCommand(MCP_COMMANDS.SET_AUTO_LAYOUT, {
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
    return this.executeCommand(MCP_COMMANDS.SET_AUTO_LAYOUT_RESIZING, {
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
    return this.executeCommand(MCP_COMMANDS.GROUP_NODE, {
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
    return this.executeCommand(MCP_COMMANDS.GROUP_NODE, {
      nodeId
    });
  },

  /**
   * Sets constraints in Figma.
   * @param params - constraint operation parameters
   * @returns {Promise<any>}
   */
  async setConstraints(
    this: FigmaClient,
    params: any
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.SET_CONSTRAINT, params);
  },

  /**
   * Gets constraints in Figma.
   * @param params - get constraints parameters
   * @returns {Promise<any>}
   */
  async getConstraints(
    this: FigmaClient,
    params: any
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.GET_CONSTRAINT, params);
  },

  /**
   * Sets a grid in Figma.
   * @param params - grid operation parameters
   * @returns {Promise<any>}
   */
  async setGrid(
    this: FigmaClient,
    params: any
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.SET_GRID, params);
  },

  /**
   * Sets a guide in Figma.
   * @param params - guide operation parameters
   * @returns {Promise<any>}
   */
  async setGuide(
    this: FigmaClient,
    params: any
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.SET_GUIDE, params);
  },

  /**
   * Gets all guides in Figma.
   * @param params - (optional) parameters
   * @returns {Promise<any>}
   */
  async getGuide(
    this: FigmaClient,
    params: any = {}
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.GET_GUIDE, params);
  }
};
