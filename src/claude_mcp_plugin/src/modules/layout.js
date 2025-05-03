// Layout module

/**
 * Sets auto layout properties on a node.
 *
 * Configures layout mode, padding, spacing, alignment, wrapping, and stroke inclusion.
 *
 * @param {object} params - Auto layout configuration parameters.
 * @param {string} params.nodeId - The ID of the node to configure.
 * @param {string} params.layoutMode - Layout mode ("NONE", "HORIZONTAL", "VERTICAL").
 * @param {number} [params.paddingTop] - Top padding in pixels.
 * @param {number} [params.paddingBottom] - Bottom padding in pixels.
 * @param {number} [params.paddingLeft] - Left padding in pixels.
 * @param {number} [params.paddingRight] - Right padding in pixels.
 * @param {number} [params.itemSpacing] - Spacing between items in pixels.
 * @param {string} [params.primaryAxisAlignItems] - Alignment along primary axis.
 * @param {string} [params.counterAxisAlignItems] - Alignment along counter axis.
 * @param {string} [params.layoutWrap] - Layout wrap mode ("WRAP", "NO_WRAP").
 * @param {boolean} [params.strokesIncludedInLayout] - Whether strokes are included in layout.
 *
 * @returns {object} An object with updated auto layout properties.
 *
 * @throws Will throw an error if the node is not found or does not support auto layout.
 */
export async function setAutoLayout(params) {
  const { 
    nodeId, 
    layoutMode, 
    paddingTop, 
    paddingBottom, 
    paddingLeft, 
    paddingRight, 
    itemSpacing, 
    primaryAxisAlignItems, 
    counterAxisAlignItems, 
    layoutWrap, 
    strokesIncludedInLayout 
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!layoutMode) {
    throw new Error("Missing layoutMode parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Check if the node is a frame or group
  if (!("layoutMode" in node)) {
    throw new Error(`Node does not support auto layout: ${nodeId}`);
  }

  // Configure layout mode
  if (layoutMode === "NONE") {
    node.layoutMode = "NONE";
  } else {
    // Set auto layout properties
    node.layoutMode = layoutMode;
    
    // Configure padding if provided
    if (paddingTop !== undefined) node.paddingTop = paddingTop;
    if (paddingBottom !== undefined) node.paddingBottom = paddingBottom;
    if (paddingLeft !== undefined) node.paddingLeft = paddingLeft;
    if (paddingRight !== undefined) node.paddingRight = paddingRight;
    
    // Configure item spacing
    if (itemSpacing !== undefined) node.itemSpacing = itemSpacing;
    
    // Configure alignment
    if (primaryAxisAlignItems !== undefined) {
      node.primaryAxisAlignItems = primaryAxisAlignItems;
    }
    
    if (counterAxisAlignItems !== undefined) {
      node.counterAxisAlignItems = counterAxisAlignItems;
    }
    
    // Configure wrap
    if (layoutWrap !== undefined) {
      node.layoutWrap = layoutWrap;
    }
    
    // Configure stroke inclusion
    if (strokesIncludedInLayout !== undefined) {
      node.strokesIncludedInLayout = strokesIncludedInLayout;
    }
  }

  return {
    id: node.id,
    name: node.name,
    layoutMode: node.layoutMode,
    paddingTop: node.paddingTop,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    paddingRight: node.paddingRight,
    itemSpacing: node.itemSpacing,
    primaryAxisAlignItems: node.primaryAxisAlignItems,
    counterAxisAlignItems: node.counterAxisAlignItems,
    layoutWrap: node.layoutWrap,
    strokesIncludedInLayout: node.strokesIncludedInLayout
  };
}

/**
 * Adjust Auto-Layout Resizing of a Node
 *
 * This function adjusts the sizing mode along a specified axis (horizontal or vertical)
 * for a given node that supports auto layout. When using the "FILL" mode, the function
 * also sets the layoutGrow property on each child element so that they expand to fill the space.
 *
 * @param {object} params - Parameters for adjusting auto layout resizing.
 * @param {string} params.nodeId - The unique identifier of the node to update.
 * @param {string} params.axis - The axis along which to adjust the resizing ("horizontal" or "vertical").
 * @param {string} params.mode - The sizing mode to set for the specified axis ("HUG", "FIXED", "FILL").
 *
 * @returns {object} An object containing the node's ID and current sizing modes.
 *
 * @throws Will throw an error if required parameters are missing or invalid, or if the node doesn't support auto layout.
 */
export async function setAutoLayoutResizing(params) {
  const { nodeId, axis, mode } = params || {};
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!axis || (axis !== "horizontal" && axis !== "vertical")) {
    throw new Error("Invalid or missing axis parameter");
  }
  if (!mode || !["HUG", "FIXED", "FILL"].includes(mode)) {
    throw new Error("Invalid or missing mode parameter");
  }
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || !("primaryAxisSizingMode" in node)) {
    throw new Error(`Node ${nodeId} does not support auto layout`);
  }
  if (mode === "HUG") {
    if (axis === "horizontal") {
      node.primaryAxisSizingMode = "AUTO";
    } else {
      node.counterAxisSizingMode = "AUTO";
    }
    for (const child of node.children) {
      if (axis === "horizontal") {
        if (node.layoutMode === "HORIZONTAL" && "layoutGrow" in child) {
          child.layoutGrow = 0;
        }
        if (node.layoutMode !== "HORIZONTAL" && "layoutAlign" in child) {
          child.layoutAlign = "INHERIT";
        }
      } else {
        if (node.layoutMode === "VERTICAL" && "layoutGrow" in child) {
          child.layoutGrow = 0;
        }
        if (node.layoutMode !== "VERTICAL" && "layoutAlign" in child) {
          child.layoutAlign = "INHERIT";
        }
      }
    }
  } else if (mode === "FILL") {
    if (axis === "horizontal") {
      node.primaryAxisSizingMode = "AUTO";
    } else {
      node.counterAxisSizingMode = "AUTO";
    }
    for (const child of node.children) {
      if (axis === "horizontal") {
        if (node.layoutMode === "HORIZONTAL" && "layoutGrow" in child) {
          child.layoutGrow = 1;
        }
        if (node.layoutMode !== "HORIZONTAL" && "layoutAlign" in child) {
          child.layoutAlign = "STRETCH";
        }
      } else {
        if (node.layoutMode === "VERTICAL" && "layoutGrow" in child) {
          child.layoutGrow = 1;
        }
        if (node.layoutMode !== "VERTICAL" && "layoutAlign" in child) {
          child.layoutAlign = "STRETCH";
        }
      }
    }
  } else {
    if (axis === "horizontal") {
      node.primaryAxisSizingMode = "FIXED";
    } else {
      node.counterAxisSizingMode = "FIXED";
    }
  }
  return {
    id: node.id,
    primaryAxisSizingMode: node.primaryAxisSizingMode,
    counterAxisSizingMode: node.counterAxisSizingMode
  };
}

/**
 * Groups multiple nodes in Figma into a single group.
 *
 * @param {object} params - Parameters for grouping.
 * @param {string[]} params.nodeIds - Array of node IDs to group.
 * @param {string} [params.name] - Optional name for the group.
 *
 * @returns {object} An object with the group's id, name, type, and children details.
 *
 * @throws Will throw an error if nodes are missing, have different parents, or grouping fails.
 */
export async function groupNodes(params) {
  const { nodeIds, name } = params || {};
  
  if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length < 2) {
    throw new Error("Must provide at least two nodeIds to group");
  }
  
  try {
    // Get all nodes to be grouped
    const nodesToGroup = [];
    for (const nodeId of nodeIds) {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        throw new Error(`Node not found with ID: ${nodeId}`);
      }
      nodesToGroup.push(node);
    }
    
    // Verify that all nodes have the same parent
    const parent = nodesToGroup[0].parent;
    for (const node of nodesToGroup) {
      if (node.parent !== parent) {
        throw new Error("All nodes must have the same parent to be grouped");
      }
    }
    
    // Create a group and add the nodes to it
    const group = figma.group(nodesToGroup, parent);
    
    // Optionally set a name for the group
    if (name) {
      group.name = name;
    }
    
    return {
      id: group.id,
      name: group.name,
      type: group.type,
      children: group.children.map(child => ({ id: child.id, name: child.name, type: child.type }))
    };
  } catch (error) {
    throw new Error(`Error grouping nodes: ${error.message}`);
  }
}

/**
 * Ungroups a node (group or frame) in Figma.
 *
 * @param {object} params - Parameters for ungrouping.
 * @param {string} params.nodeId - The ID of the node to ungroup.
 *
 * @returns {object} An object with success status, count of ungrouped items, and item details.
 *
 * @throws Will throw an error if the node is not found, is not a group or frame, or ungrouping fails.
 */
export async function ungroupNodes(params) {
  const { nodeId } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  try {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }
    
    // Verify that the node is a group or a frame
    if (node.type !== "GROUP" && node.type !== "FRAME") {
      throw new Error(`Node with ID ${nodeId} is not a GROUP or FRAME`);
    }
    
    // Get the parent and children before ungrouping
    const parent = node.parent;
    const children = [...node.children];
    
    // Ungroup the node
    const ungroupedItems = figma.ungroup(node);
    
    return {
      success: true,
      ungroupedCount: ungroupedItems.length,
      items: ungroupedItems.map(item => ({ id: item.id, name: item.name, type: item.type }))
    };
  } catch (error) {
    throw new Error(`Error ungrouping node: ${error.message}`);
  }
}

/**
 * Inserts a child node into a parent node at an optional index.
 *
 * @param {object} params - Parameters for insertion.
 * @param {string} params.parentId - The ID of the parent node.
 * @param {string} params.childId - The ID of the child node.
 * @param {number} [params.index] - Optional index to insert at.
 *
 * @returns {object} An object with parentId, childId, index, success status, and previous parentId.
 *
 * @throws Will throw an error if parent or child nodes are not found or insertion fails.
 */
export async function insertChild(params) {
  const { parentId, childId, index } = params || {};
  
  if (!parentId) {
    throw new Error("Missing parentId parameter");
  }
  
  if (!childId) {
    throw new Error("Missing childId parameter");
  }
  
  try {
    // Get the parent and child nodes
    const parent = await figma.getNodeByIdAsync(parentId);
    if (!parent) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    
    const child = await figma.getNodeByIdAsync(childId);
    if (!child) {
      throw new Error(`Child node not found with ID: ${childId}`);
    }
    
    // Check if the parent can have children
    if (!("appendChild" in parent)) {
      throw new Error(`Parent node with ID ${parentId} cannot have children`);
    }
    
    // Save child's current parent for proper handling
    const originalParent = child.parent;
    
    // Insert the child at the specified index or append it
    if (index !== undefined && index >= 0 && index <= parent.children.length) {
      parent.insertChild(index, child);
    } else {
      parent.appendChild(child);
    }
    
    // Verify that the insertion worked
    const newIndex = parent.children.indexOf(child);
    
    return {
      parentId: parent.id,
      childId: child.id,
      index: newIndex,
      success: newIndex !== -1,
      previousParentId: originalParent ? originalParent.id : null
    };
  } catch (error) {
    throw new Error(`Error inserting child: ${error.message}`);
  }
}

// Helper functions for auto layout resizing
/**
 * Sets a node to fill its container along the specified axis.
 * 
 * @param {object} node - The node to modify.
 * @param {string} axis - The axis to apply fill ("horizontal" or "vertical").
 * @private
 */
function setFillContainer(node, axis) {
  const parent = node.parent;
  if (!parent || parent.layoutMode === 'NONE') return;

  if (axis === 'horizontal') {
    parent.layoutMode === 'HORIZONTAL'
      ? node.layoutGrow = 1
      : node.layoutAlign = 'STRETCH';
  } else {
    parent.layoutMode === 'VERTICAL'
      ? node.layoutGrow = 1
      : node.layoutAlign = 'STRETCH';
  }
}

/**
 * Sets a node to hug its contents along the specified axis.
 * 
 * @param {object} node - The node to modify.
 * @param {string} axis - The axis to apply hug ("horizontal" or "vertical").
 * @private
 */
function setHugContents(node, axis) {
  const parent = node.parent;
  if (!parent || parent.layoutMode === 'NONE') return;

  if (axis === 'horizontal') {
    parent.layoutMode === 'HORIZONTAL'
      ? node.layoutGrow = 0
      : node.layoutAlign = 'INHERIT';
  } else {
    parent.layoutMode === 'VERTICAL'
      ? node.layoutGrow = 0
      : node.layoutAlign = 'INHERIT';
  }
}

/**
 * Sets a fixed size for a node along the specified axis.
 * 
 * @param {object} node - The node to resize.
 * @param {string} axis - The axis to resize ("horizontal" or "vertical").
 * @param {number} size - The size to set.
 * @private
 */
function setFixedSize(node, axis, size) {
  if (axis === 'horizontal') {
    node.resize(size, node.height);
    node.layoutGrow = 0;
  } else {
    node.resize(node.width, size);
    node.layoutGrow = 0;
  }
}

// Export the operations as a group
export const layoutOperations = {
  setAutoLayout,
  setAutoLayoutResizing,
  groupNodes,
  ungroupNodes,
  insertChild
};
