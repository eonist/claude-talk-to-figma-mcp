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
  exclude_selection,
  boolean_operation
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

/**
 * Collection of node operation functions for Figma.
 * @namespace nodeOperations
 * @property {function} resizeNode - Resize a node.
 * @property {function} resizeNodes - Resize multiple nodes.
 * @property {function} moveNode - Move a node.
 * @property {function} moveNodes - Move multiple nodes.
 * @property {function} setNodeCornerRadii - Set corner radii for a node.
 * @property {function} setNodesCornerRadii - Set corner radii for multiple nodes.
 * @property {function} deleteNode - Delete a node.
 * @property {function} deleteNodes - Delete multiple nodes.
 * @property {function} convertRectangleToFrame - Convert a rectangle to a frame.
 * @property {function} flattenNode - Flatten a node.
 * @property {function} union_selection - Union selection.
 * @property {function} subtract_selection - Subtract selection.
 * @property {function} intersect_selection - Intersect selection.
 * @property {function} exclude_selection - Exclude selection.
 * @property {function} clone_node - Clone a node.
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
  clone_node,
  boolean: boolean_operation,
  setMatrixTransform
};

export default nodeOperations;
