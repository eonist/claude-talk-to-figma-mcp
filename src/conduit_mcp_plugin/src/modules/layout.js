/**
 * Layout operations module.
 * Provides functions to manage auto layout, grouping, node insertion, boolean operations, and cloning in Figma via MCP.
 *
 * @module modules/layout
 * @see {@link ./layout/layout-auto.js}
 * @see {@link ./layout/layout-group.js}
 * @see {@link ./layout/layout-insert.js}
 * @see {@link ./layout/layout-clone.js}
 * @see {@link ./node/node-misc.js}
 */

/**
 * Collection of layout operation functions for Figma.
 * @namespace layoutOperations
 * @property {function} setAutoLayout - Set auto layout mode.
 * @property {function} setAutoLayoutResizing - Set auto layout resizing.
 * @property {function} groupNodes - Group nodes.
 * @property {function} ungroupNodes - Ungroup nodes.
 * @property {function} insertChild - Insert a child node.
 * @property {function} insertChildren - Insert multiple child nodes.
 * @property {function} flatten_nodes - Flatten nodes.
 * @property {function} union_selection - Union selection.
 * @property {function} subtract_selection - Subtract selection.
 * @property {function} intersect_selection - Intersect selection.
 * @property {function} exclude_selection - Exclude selection.
 * @property {function} clone_node - Clone a node.
 */
import { setAutoLayout, setAutoLayoutResizing } from './layout/layout-auto.js';
import { groupNodes, ungroupNodes } from './layout/layout-group.js';
import { insertChild, insertChildren } from './layout/layout-insert.js';
import { flatten_nodes, boolean_operation } from './node/node-misc.js';
import { clone_node } from './layout/layout-clone.js';

/**
 * Merged group/ungroup operation for MCP.
 * @param {object} params - Parameters for the operation.
 * @param {boolean} params.group - If true, group nodes; if false, ungroup a group node.
 * @param {array} [params.nodeIds] - Array of node IDs to group (if grouping).
 * @param {string} [params.name] - Name for the group (if grouping).
 * @param {string} [params.nodeId] - Node ID to ungroup (if ungrouping).
 */
async function groupOrUngroupNodes(params) {
  if (params.group) {
    // Forward to groupNodes
    return await groupNodes(params);
  } else {
    // Forward to ungroupNodes
    return await ungroupNodes(params);
  }
}

export const layoutOperations = {
  setAutoLayout,
  setAutoLayoutResizing,
  groupNodes,
  ungroupNodes,
  groupOrUngroupNodes,
  insertChild,
  insertChildren,
  flatten_nodes,
  boolean_operation,
  clone_node,
  // Note: clone_nodes has been unified into clone_node. Remove any plugin references to clone_nodes.

  /**
   * Unified handler for CLONE_NODE plugin command.
   * Accepts both { node }, { nodes }, or flat object.
   * @function cloneNodeUnified
   * @param {object} params
   * @returns {Promise<any>}
   */
  async cloneNodeUnified(params) {
    if (params && (params.node || params.nodes)) {
      return clone_node(params);
    } else {
      return clone_node({ nodes: [params] });
    }
  },

  /**
   * Unified handler for INSERT_CHILD plugin command.
   * Accepts both { child }, { children }, or flat object.
   * @function insertChildUnified
   * @param {object} params
   * @returns {Promise<any>}
   */
  async insertChildUnified(params) {
    if (params && (params.child || params.children)) {
      return insertChildren(params);
    } else {
      return insertChildren({ children: [params] });
    }
  }
};
