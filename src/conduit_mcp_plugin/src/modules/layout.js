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
