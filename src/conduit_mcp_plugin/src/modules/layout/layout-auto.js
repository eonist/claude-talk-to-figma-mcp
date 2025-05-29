/**
 * Auto layout operations for Figma nodes.
 * Exports: setAutoLayout, setAutoLayoutResizing
 */

/**
 * Configures auto layout properties for a node in Figma.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for auto layout configuration.
 * @param {string} params.nodeId - The ID of the node to configure.
 * @param {"NONE"|"HORIZONTAL"|"VERTICAL"} params.layoutMode - The auto layout mode to set.
 * @param {number} [params.paddingTop] - Top padding.
 * @param {number} [params.paddingBottom] - Bottom padding.
 * @param {number} [params.paddingLeft] - Left padding.
 * @param {number} [params.paddingRight] - Right padding.
 * @param {number} [params.itemSpacing] - Spacing between items.
 * @param {string} [params.primaryAxisAlignItems] - Alignment along the primary axis.
 * @param {string} [params.counterAxisAlignItems] - Alignment along the counter axis.
 * @param {string} [params.layoutWrap] - Layout wrap mode.
 * @param {boolean} [params.strokesIncludedInLayout] - Whether strokes are included in layout.
 * @returns {Promise<Object>} Updated node layout properties.
 * @throws {Error} If nodeId or layoutMode is missing, node is not found, or does not support auto layout.
 */
export async function setAutoLayout(params) {
  // LOGGING: Print all received params for debugging
  console.log("[setAutoLayout] called with params:", JSON.stringify(params, null, 2));
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
    strokesIncludedInLayout,
    // New for sizing
    counterAxisSizingMode,
    primaryAxisSizingMode,
    axis,
    mode
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

    // --- Sizing logic for hug/fill/fixed ---
    // Direct property support
    if (typeof primaryAxisSizingMode === "string") {
      node.primaryAxisSizingMode = primaryAxisSizingMode;
      console.log(`[setAutoLayout] Set node.primaryAxisSizingMode = ${primaryAxisSizingMode}`);
    }
    if (typeof counterAxisSizingMode === "string") {
      node.counterAxisSizingMode = counterAxisSizingMode;
      console.log(`[setAutoLayout] Set node.counterAxisSizingMode = ${counterAxisSizingMode}`);
    }
    // Axis/mode mapping support (for legacy or alternate API usage)
    if (axis && mode) {
      if (axis === "vertical") {
        if (layoutMode === "HORIZONTAL") {
          node.counterAxisSizingMode = mode;
          console.log(`[setAutoLayout] Set node.counterAxisSizingMode (height in HORIZONTAL) = ${mode}`);
        } else if (layoutMode === "VERTICAL") {
          node.primaryAxisSizingMode = mode;
          console.log(`[setAutoLayout] Set node.primaryAxisSizingMode (height in VERTICAL) = ${mode}`);
        }
      } else if (axis === "horizontal") {
        if (layoutMode === "VERTICAL") {
          node.counterAxisSizingMode = mode;
          console.log(`[setAutoLayout] Set node.counterAxisSizingMode (width in VERTICAL) = ${mode}`);
        } else if (layoutMode === "HORIZONTAL") {
          node.primaryAxisSizingMode = mode;
          console.log(`[setAutoLayout] Set node.primaryAxisSizingMode (width in HORIZONTAL) = ${mode}`);
        }
      }
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
    strokesIncludedInLayout: node.strokesIncludedInLayout,
    primaryAxisSizingMode: node.primaryAxisSizingMode,
    counterAxisSizingMode: node.counterAxisSizingMode
  };
}

/**
 * Adjusts auto-layout resizing behavior for a node along a specified axis.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for resizing configuration.
 * @param {string} params.nodeId - The ID of the node to configure.
 * @param {"horizontal"|"vertical"} params.axis - The axis to set sizing mode for.
 * @param {"HUG"|"FIXED"|"FILL"} params.mode - The sizing mode to set.
 * @returns {Promise<{id: string, primaryAxisSizingMode: string, counterAxisSizingMode: string}>} Updated sizing modes.
 * @throws {Error} If parameters are missing/invalid, or node does not support auto layout.
 */
export async function setAutoLayoutUnified(params) {
  console.log("💥 [setAutoLayoutUnified] called with params:", JSON.stringify(params, null, 2));
  const { layout, layouts, options } = params || {};
  const configs = [];
  if (layout) configs.push(layout);
  if (layouts && Array.isArray(layouts)) configs.push(...layouts);

  if (configs.length === 0) {
    throw new Error("At least one of layout or layouts is required.");
  }

  const results = [];
  for (const config of configs) {
    const { 
      nodeId, 
      mode, 
      primaryAxisSizing, 
      counterAxisSizing, 
      itemSpacing,
      counterAxisSpacing, // NEW: Added support for vertical gap between wrapped rows
      layoutWrap, 
      padding, 
      paddingLeft, // NEW: Added individual padding support
      paddingRight, // NEW: Added individual padding support
      paddingTop, // NEW: Added individual padding support
      paddingBottom, // NEW: Added individual padding support
      alignItems 
    } = config;
    
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        if (options && options.skipErrors) {
          results.push({ nodeId, success: false, error: "Node not found" });
          continue;
        } else {
          throw new Error("Node not found");
        }
      }
      if (!("layoutMode" in node)) {
        if (options && options.skipErrors) {
          results.push({ nodeId, success: false, error: `Node type ${node.type} doesn't support auto-layout` });
          continue;
        } else {
          throw new Error(`Node type ${node.type} doesn't support auto-layout`);
        }
      }

      // Maintain original position if requested
      const originalPosition = { x: node.x, y: node.y };

      // Set layout mode first
      node.layoutMode = mode;

      // Set sizing modes
      if (primaryAxisSizing) node.primaryAxisSizingMode = primaryAxisSizing;
      if (counterAxisSizing) node.counterAxisSizingMode = counterAxisSizing;

      // Set spacing and padding
      if (typeof itemSpacing === "number") node.itemSpacing = itemSpacing;
      
      // NEW: Set counter axis spacing (vertical gap between rows when wrapping)
      if (typeof counterAxisSpacing === "number") node.counterAxisSpacing = counterAxisSpacing;
      
      // Set layout wrap
      if (layoutWrap !== undefined) node.layoutWrap = layoutWrap;
      
      // Handle padding - support both object format and individual properties
      if (padding) {
        if (typeof padding.top === "number") node.paddingTop = padding.top;
        if (typeof padding.right === "number") node.paddingRight = padding.right;
        if (typeof padding.bottom === "number") node.paddingBottom = padding.bottom;
        if (typeof padding.left === "number") node.paddingLeft = padding.left;
      }
      
      // NEW: Handle individual padding properties
      if (typeof paddingTop === "number") node.paddingTop = paddingTop;
      if (typeof paddingRight === "number") node.paddingRight = paddingRight;
      if (typeof paddingBottom === "number") node.paddingBottom = paddingBottom;
      if (typeof paddingLeft === "number") node.paddingLeft = paddingLeft;

      // Set alignment
      if (alignItems) node.primaryAxisAlignItems = alignItems;

      // Maintain original position if requested
      if (options && options.maintainPosition) {
        node.x = originalPosition.x;
        node.y = originalPosition.y;
      }

      results.push({ nodeId, success: true });
    } catch (error) {
      if (options && options.skipErrors) {
        results.push({ nodeId: config.nodeId, success: false, error: error && error.message ? error.message : String(error) });
        continue;
      } else {
        throw error;
      }
    }
  }
  return results;
}
/**
 * Sets the auto layout resizing behavior for a Figma node along a specified axis.
 * This function configures how a node and its children behave in auto layout containers,
 * supporting three resizing modes: HUG (content-based sizing), FILL (stretch to fill),
 * and FIXED (explicit dimensions).
 *
 * @async
 * @function setAutoLayoutResizing
 * @param {Object} params - Configuration parameters for auto layout resizing
 * @param {string} params.nodeId - The unique identifier of the Figma node to modify
 * @param {("horizontal"|"vertical")} params.axis - The axis along which to apply resizing behavior
 * @param {("HUG"|"FIXED"|"FILL")} params.mode - The resizing mode to apply:
 *   - "HUG": Node sizes itself to fit its content
 *   - "FILL": Node stretches to fill available space
 *   - "FIXED": Node maintains explicit dimensions
 * 
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - {string} id - The node's unique identifier
 *   - {string} primaryAxisSizingMode - The primary axis sizing mode after modification
 *   - {string} counterAxisSizingMode - The counter axis sizing mode after modification
 * 
 * @throws {Error} Throws an error if:
 *   - nodeId parameter is missing or falsy
 *   - axis parameter is missing or not "horizontal" or "vertical"
 *   - mode parameter is missing or not one of "HUG", "FIXED", "FILL"
 *   - the specified node doesn't exist or doesn't support auto layout
 * 
 * @example
 * // Set a node to hug its content horizontally
 * const result = await setAutoLayoutResizing({
 *   nodeId: "123:456",
 *   axis: "horizontal",
 *   mode: "HUG"
 * });
 * console.log(result.primaryAxisSizingMode); // "AUTO"
 * 
 * @example
 * // Set a node to fill available space vertically
 * await setAutoLayoutResizing({
 *   nodeId: "789:012",
 *   axis: "vertical",
 *   mode: "FILL"
 * });
 * 
 * @example
 * // Set a node to fixed dimensions horizontally
 * await setAutoLayoutResizing({
 *   nodeId: "345:678",
 *   axis: "horizontal",
 *   mode: "FIXED"
 * });
 */
export async function setAutoLayoutResizing(params) {
  console.log("💥 [setAutoLayoutResizing] called with params:", JSON.stringify(params, null, 2));
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
