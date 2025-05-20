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
   * Deletes one or more nodes.
   * Accepts either { nodeId } for single or { nodeIds } for batch, like create_rectangle.
   * @param params - Node IDs to delete.
   * @returns The result of the delete operation.
   */
  async deleteNode(
    this: FigmaClient,
    params: { nodeId?: string; nodeIds?: string[] }
  ): Promise<any> {
    let nodeIds: string[] = [];
    if (params.nodeIds && Array.isArray(params.nodeIds)) {
      nodeIds = params.nodeIds.map(ensureNodeIdIsString);
    } else if (params.nodeId) {
      nodeIds = [ensureNodeIdIsString(params.nodeId)];
    } else {
      throw new Error("deleteNode: Must provide nodeId or nodeIds");
    }
    // If backend supports batch in DELETE_NODE, always use nodeIds param
    return this.executeCommand(MCP_COMMANDS.DELETE_NODE, { nodeIds });
  },

  /**
   * Moves one or more nodes to a new position.
   * Accepts either { nodeId } for single or { nodeIds } for batch, plus x and y.
   * @param params - Node IDs and new position.
   * @returns The result of the move operation.
   */
  async moveNode(
    this: FigmaClient,
    params: { nodeId?: string; nodeIds?: string[]; x: number; y: number }
  ): Promise<any> {
    let nodeIds: string[] = [];
    if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
      nodeIds = params.nodeIds.map(ensureNodeIdIsString);
    } else if (params.nodeId) {
      nodeIds = [ensureNodeIdIsString(params.nodeId)];
    } else {
      throw new Error("moveNode: Provide either nodeId or nodeIds.");
    }
    return this.executeCommand(MCP_COMMANDS.MOVE_NODE, { nodeIds, x: params.x, y: params.y });
  },

  /**
   * Clones one or more nodes.
   * Accepts either { nodeId } for single or { nodeIds } for batch, plus optional params.
   * @param params - Node IDs and clone options.
   * @returns The result of the clone operation.
   */
  async cloneNode(
    this: FigmaClient,
    params: {
      nodeId?: string;
      nodeIds?: string[];
      x?: number;
      y?: number;
      positions?: { x: number; y: number }[];
      offsetX?: number;
      offsetY?: number;
      parentId?: string;
    }
  ): Promise<any> {
    let nodeIds: string[] = [];
    if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
      nodeIds = params.nodeIds.map(ensureNodeIdIsString);
    } else if (params.nodeId) {
      nodeIds = [ensureNodeIdIsString(params.nodeId)];
    } else {
      throw new Error("cloneNode: Provide either nodeId or nodeIds.");
    }
    // Pass through other params as needed (positions, offsetX, etc.)
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
  },

  /**
   * Resizes a node to the specified width and height.
   * @param params - Node ID and new size.
   * @returns The result of the resize operation.
   */
  async resizeNode(
    this: FigmaClient,
    params: { nodeId: string; width: number; height: number }
  ): Promise<any> {
    const id = ensureNodeIdIsString(params.nodeId);
    return this.executeCommand(MCP_COMMANDS.RESIZE_NODE, { nodeId: id, width: params.width, height: params.height });
  }
};
