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
import { flatten_nodes, union_selection, subtract_selection, intersect_selection, exclude_selection } from './node/node-misc.js';
import { clone_node } from './layout/layout-clone.js';

export const layoutOperations = {
  setAutoLayout,
  setAutoLayoutResizing,
  groupNodes,
  ungroupNodes,
  insertChild,
  insertChildren,
  flatten_nodes,
  union_selection,
  subtract_selection,
  intersect_selection,
  exclude_selection,
  clone_node
  // Note: clone_nodes has been unified into clone_node. Remove any plugin references to clone_nodes.
};
