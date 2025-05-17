import { clone_node } from './layout/layout-clone.js';
import {
  resizeNode,
  resizeNodes,
  moveNode,
  moveNodes,
  setNodeCornerRadii,
  setNodesCornerRadii
} from './node/node-modify.js';
import {
  deleteNode,
  deleteNodes,
  convertRectangleToFrame
} from './node/node-edit.js';
import {
  flattenNode,
  union_selection,
  subtract_selection,
  intersect_selection,
  exclude_selection
} from './node/node-misc.js';

/**
 * Node operations module.
 * Provides functions to manipulate Figma nodes (resize, move, delete, boolean ops, etc.) via MCP.
 *
 * @module modules/node
 * @example
 * import { nodeOperations } from './modules/node.js';
 * const result = await nodeOperations.resizeNode({ nodeId, width: 100, height: 100 });
 * console.log('Resized node', result);
 */

export const nodeOperations = {
  resizeNode,
  resizeNodes,
  moveNode,
  moveNodes,
  setNodeCornerRadii,
  setNodesCornerRadii,
  deleteNode,
  deleteNodes,
  convertRectangleToFrame,
  flattenNode,
  union_selection,
  subtract_selection,
  intersect_selection,
  exclude_selection,
  clone_node
};
