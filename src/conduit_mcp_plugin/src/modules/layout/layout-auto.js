/**
 * Auto layout operations for Figma nodes.
 * Exports: setAutoLayout, setAutoLayoutResizing
 */

/**
 * Configures auto layout properties for a node in Figma.
 * @async
 * @function setAutoLayout
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

  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (!layoutMode) throw new Error("Missing layoutMode parameter");

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (!("layoutMode" in node)) throw new Error(`Node does not support auto layout: ${nodeId}`);

  if (layoutMode === "NONE") {
    node.layoutMode = "NONE";
  } else {
    node.layoutMode = layoutMode;
    if (paddingTop !== undefined) node.paddingTop = paddingTop;
    if (paddingBottom !== undefined) node.paddingBottom = paddingBottom;
    if (paddingLeft !== undefined) node.paddingLeft = paddingLeft;
    if (paddingRight !== undefined) node.paddingRight = paddingRight;
    if (itemSpacing !== undefined) node.itemSpacing = itemSpacing;
    if (primaryAxisAlignItems !== undefined) node.primaryAxisAlignItems = primaryAxisAlignItems;
    if (counterAxisAlignItems !== undefined) node.counterAxisAlignItems = counterAxisAlignItems;
    if (layoutWrap !== undefined) node.layoutWrap = layoutWrap;
    if (strokesIncludedInLayout !== undefined) node.strokesIncludedInLayout = strokesIncludedInLayout;
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
 * @async
 * @function setAutoLayoutResizing
 */
export async function setAutoLayoutResizing(params) {
  const { nodeId, axis, mode } = params || {};
  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (!axis || (axis !== "horizontal" && axis !== "vertical")) throw new Error("Invalid or missing axis parameter");
  if (!mode || !["HUG", "FIXED", "FILL"].includes(mode)) throw new Error("Invalid or missing mode parameter");
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || !("primaryAxisSizingMode" in node)) throw new Error(`Node ${nodeId} does not support auto layout`);
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
