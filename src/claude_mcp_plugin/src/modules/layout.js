/**
 * Layout operations module.
 * Provides functions to configure auto-layout, resizing behaviors, grouping, ungrouping, and child insertion in Figma via MCP.
 *
 * Exposed functions:
 * - setAutoLayout(params): Promise<{ id: string, name: string, layoutMode: string, paddingTop: number, paddingBottom: number, paddingLeft: number, paddingRight: number, itemSpacing: number, primaryAxisAlignItems: string, counterAxisAlignItems: string, layoutWrap: string, strokesIncludedInLayout: boolean }>
 * - setAutoLayoutResizing(params): Promise<{ id: string, primaryAxisSizingMode: string, counterAxisSizingMode: string }>
 * - groupNodes(params): Promise<{ id: string, name: string, type: string, children: Array<{ id: string, name: string, type: string }> }>
 * - ungroupNodes(params): Promise<{ success: boolean, ungroupedCount: number, items: Array<{ id: string, name: string, type: string }> }>
 * - insertChild(params): Promise<{ parentId: string, childId: string, index: number, success: boolean, previousParentId: string|null }>
 *
 * @example
 * import { layoutOperations } from './modules/layout.js';
 * await layoutOperations.setAutoLayout({ nodeId: '123', layoutMode: 'HORIZONTAL', itemSpacing: 8 });
 */

/**
Ss a l pertson a noei Figa.
* Auto llwsfr autc arramendsof chds
/**wih a ntfm rup.
*
 *e@out pe{ibjatuows fo -aAutoalayort no fiaunatiigfparamechrllements
 *i@t fra {mt ong}ams.nod -Te D of theo toonfg
 * @arra T{('NONE'|'HORIZONTAL'|hVERTICAL )}mp{|'mZOlERTICM} pm-uLMode  Lrto
 *   - NONE: Disables auto layout
 *   - HORIZONTAL: Arranges items in a row
 *   - VERTICAL: Arranges items in a column
 * @param {number} [params.paddingTop] - Top padding in pixels
 * @param {number} [params.paddingBottom] - Bottom padding in pixels
 * @param {number} [params.paddingLeft] - Left padding in pixels
 * @param {number} [params.paddingRight] - Right padding in pixels
 * @param {number} [params.itemSpacing] - Spacing between items in pixels
 * @param {('MIN'|'CENTER'|'MAX'|'SPACE_BETWEEN')} [params.primaryAxisAlignItems] - Primary axis alignment:
 *   - MIN: Aligns to start
 *   - CENTER: Centers items
 *   - MAX: Aligns to end
 *   - SPACE_BETWEEN: Distributes space between items
 * @param {('MIN'|'CENTER'|'MAX')} [params.counterAxisAlignItems] - Counter axis alignment:
 *   - MIN: Aligns to start
 *   - CENTER: Centers items
 *   - MAX: Aligns to end
 * @param {('WRAP'|'NO_WRAP')} [params.layoutWrap] - Whether items should wrap to new lines
 * @param {boolean} [params.strokesIncludedInLayout] - Whether strokes affect layout spacing
 *
 * @returns {object} Updated auto layout properties including:
 *   - id: Node ID
 *   - name: Node name
 *   - layoutMode: Current layout mode
 *   - padding values
 *   - itemSpacing
 *   - alignment settings
 *   - wrap mode
 *   - stroke inclusion setting
 *
 * @throws {Error} If node is not found or doesn't support auto layout
 * 
 * @example
 * // Configure horizontal auto layout with padding and spacing
 * await setAutoLayout({
 *   nodeId: "123:456",
 *   layoutMode: "HORIZONTAL",
 *   paddingAll: 16,
 *   itemSpacing: 8,
 *   primaryAxisAlignItems: "SPACE_BETWEEN"
 * });
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
 * Adjusts auto-layout resizing behavior for a node along a specified axis.
 * This function controls how a node and its children resize within an auto-layout container.
 *
 * @param {object} params - Resizing configuration parameters
 * @param {string} params.nodeId - The node's unique identifier
 * @param {('horizontal'|'vertical')} params.axis - The axis to configure:
 *   - horizontal: Affects width/horizontal layout
 *   - vertical: Affects height/vertical layout
 * @param {('HUG'|'FIXED'|'FILL')} params.mode - The sizing behavior:
 *   - HUG: Node sizes to fit its content
 *   - FIXED: Node maintains a specific size
 *   - FILL: Node expands to fill available space
 *
 * @returns {object} Current sizing configuration:
 *   - id: Node ID
 *   - primaryAxisSizingMode: Primary axis sizing behavior
 *   - counterAxisSizingMode: Counter axis sizing behavior
 *
 * @throws {Error} If node not found or parameters invalid
 * 
 * @example
 * // Make a node fill available horizontal space
 * await setAutoLayoutResizing({
 *   nodeId: "123:456",
 *   axis: "horizontal",
 *   mode: "FILL"
 * });
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
 * Groups multiple Figma nodes into a single group.
 * Grouped nodes maintain their relative positions but can be moved and manipulated together.
 *
 * @param {object} params - Grouping parameters
 * @param {string[]} params.nodeIds - Array of node IDs to group
 * @param {string} [params.name] - Optional name for the new group
 *
 * @returns {object} New group details:
 *   - id: Group node ID
 *   - name: Group name
 *   - type: Node type (always "GROUP")
 *   - children: Array of grouped node details
 *
 * @throws {Error} If:
 *   - Fewer than 2 nodes provided
 *   - Any node not found
 *   - Nodes have different parents
 *   - Grouping operation fails
 * 
 * @example
 * // Group three nodes together
 * await groupNodes({
 *   nodeIds: ["123:456", "123:457", "123:458"],
 *   name: "Button Group"
 * });
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
 * Ungroups a Figma group or frame, promoting its children to the parent level.
 * This is the reverse of the groupNodes operation.
 *
 * @param {object} params - Ungrouping parameters
 * @param {string} params.nodeId - ID of group/frame to ungroup
 *
 * @returns {object} Ungrouping results:
 *   - success: Operation success status
 *   - ungroupedCount: Number of items ungrouped
 *   - items: Array of ungrouped node details
 *
 * @throws {Error} If:
 *   - Node not found
 *   - Node is not a group or frame
 *   - Ungrouping operation fails
 * 
 * @example
 * // Ungroup a group of elements
 * await ungroupNodes({
 *   nodeId: "123:456"
 * });
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
 * Inserts a child node into a parent node at an optional index position.
 * This allows for precise control over node hierarchy and ordering.
 *
 * @param {object} params - Insertion parameters
 * @param {string} params.parentId - ID of the parent node
 * @param {string} params.childId - ID of the child node to insert
 * @param {number} [params.index] - Optional insertion index (0-based)
 *
 * @returns {object} Insertion results:
 *   - parentId: Parent node ID
 *   - childId: Child node ID
 *   - index: Final insertion index
 *   - success: Operation success status
 *   - previousParentId: Previous parent's ID (if node was moved)
 *
 * @throws {Error} If:
 *   - Parent/child not found
 *   - Parent cannot accept children
 *   - Insertion operation fails
 * 
 * @example
 * // Insert a node as the first child
 * await insertChild({
 *   parentId: "123:456",
 *   childId: "123:457",
 *   index: 0
 * });
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
