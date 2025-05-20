import { ensureNodeIdIsString } from "../../utils/node-utils.js";
import { MCP_COMMANDS } from "../../types/commands.js";
import { filterFigmaNode } from "../../utils/figma/filter-node.js";
import type { FigmaClient } from "./index.js";
import type { BaseFigmaNode } from "./types.js";

/**
 * Node-related Figma commands.
 */
export const nodeCommands = {
  /**
   * Gets information about a specific node.
   * @param nodeId - The ID of the node to get information about
   * @returns {Promise<BaseFigmaNode>} The node information
   */
  async getNodeInfo(
    this: FigmaClient,
    nodeId: string
  ): Promise<BaseFigmaNode> {
    const nodeIdString = ensureNodeIdIsString(nodeId);
    const result = await this.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId: nodeIdString });
    return filterFigmaNode(result);
  },

  /**
   * Sets a node's visibility in Figma.
   * @param params - { nodeId: string, visible: boolean }
   * @returns {Promise<any>}
   */
  async setNodeVisible(
    this: FigmaClient,
    params: { nodeId: string, visible: boolean }
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.SET_NODE_VISIBLE, params);
  },

  /**
   * Locks or unlocks a node in Figma.
   * @param params - { nodeId: string, locked: boolean }
   * @returns {Promise<any>}
   */
  async setNodeLocked(
    this: FigmaClient,
    params: { nodeId: string, locked: boolean }
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.SET_NODE_LOCKED, params);
  },

  /**
   * Groups or ungroups nodes in Figma.
   * @param params - { group: boolean, nodeIds?: string[], name?: string, nodeId?: string }
   * @returns {Promise<any>}
   */
  async groupOrUngroupNodes(
    this: FigmaClient,
    params: { group: boolean, nodeIds?: string[], name?: string, nodeId?: string }
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.GROUP_OR_UNGROUP_NODES, params);
  },

  /**
   * Flattens one or more nodes in Figma.
   * @param params - { nodeIds: string[] }
   * @returns {Promise<any>}
   */
  async flattenNode(
    this: FigmaClient,
    params: { nodeIds: string[] }
  ): Promise<any> {
    return this.executeCommand(MCP_COMMANDS.FLATTEN_NODE, params);
  },

  /**
   * Deletes a node.
   * @param nodeId - The ID of the node to delete
   * @returns {Promise<any>}
   */
  async deleteNode(
    this: FigmaClient,
    nodeId: string
  ): Promise<any> {
    const nodeIdString = ensureNodeIdIsString(nodeId);
    return this.executeCommand(MCP_COMMANDS.DELETE_NODE, { nodeId: nodeIdString });
  }
};
