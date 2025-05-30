/**
 * Auto layout operations for Figma nodes.
 * Exports: setAutoLayout, setAutoLayoutResizing
 */


/**
 * Adjusts auto-layout resizing behavior for a node along a specified axis.
 * 
 * @note using FILL for primaryAxisSizing counterAxisSizing, rather use setAutoLayoutResizing. As setting stretch etc is involved. temp hack fix for now
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
      primaryAxisSizing, // primaryAxisSizingMode
      counterAxisSizing, // counterAxisSizingMode
      itemSpacing,
      counterAxisSpacing, // NEW: Added support for vertical gap between wrapped rows
      primaryAxisAlignItems, // new
      counterAxisAlignItems, // new
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
      
      // new
      if (primaryAxisAlignItems !== undefined) node.primaryAxisAlignItems = primaryAxisAlignItems;
      if (counterAxisAlignItems !== undefined) node.counterAxisAlignItems = counterAxisAlignItems;

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
 * Sets the auto layout resizing behavior for a Figma node along specified axes.
 * This function configures how a node behaves within its auto layout parent container.
 *
 * @async
 * @function setAutoLayoutResizing
 * @param {Object} params - Configuration parameters for auto layout resizing
 * @param {string} params.nodeId - The unique identifier of the Figma node to modify
 * @param {("horizontal"|"vertical")} [params.axis] - The axis along which to apply resizing behavior (deprecated, use horizontal/vertical instead)
 * @param {("HUG"|"FIXED"|"FILL")} [params.mode] - The resizing mode (deprecated, use horizontal/vertical instead)
 * @param {("HUG"|"FIXED"|"FILL")} [params.horizontal] - Horizontal resizing behavior
 * @param {("HUG"|"FIXED"|"FILL")} [params.vertical] - Vertical resizing behavior
 * 
 * @returns {Promise} A promise that resolves to an object containing the node's layout state
 * @throws {Error} Throws an error if parameters are invalid or node doesn't support layout behavior
 * 
 * @example
 * // Fill both directions
 * await setAutoLayoutResizing({
 *   nodeId: "320:4665",
 *   horizontal: "FILL",
 *   vertical: "FILL"
 * });
 * 
 * @important **FIGMA CAVEATS & LIMITATIONS:**
 * 
 * 1. **Auto layout only works on frames** - This function only works on nodes that are direct 
 *    children of frames with auto layout enabled. Regular shapes or groups won't work.
 * 
 * 2. **Manual positioning is disabled** - Once a node is in an auto layout container, you cannot 
 *    manually drag or position it. All positioning is controlled by layout properties.
 * 
 * 3. **layoutGrow vs layoutAlign behavior** - Figma uses different properties depending on axis:
 *    - Primary axis (direction of layout): Uses `layoutGrow` (0 = hug/fixed, 1 = fill)
 *    - Counter axis (perpendicular): Uses `layoutAlign` ("INHERIT" = hug, "STRETCH" = fill)
 * 
 * 4. **Component instances may need detaching** - When working with component instances inside 
 *    auto layout, you may need to detach them to get full layout flexibility. Components and 
 *    auto layout "aren't quite as intelligent as we might like them to be".
 * 
 * 5. **Text alignment can interfere** - Text layers may have alignment settings that conflict 
 *    with intended layout behavior. Check text alignment if results are unexpected.
 * 
 * 6. **Frame conversion side effects** - When enabling auto layout, Figma converts shapes to 
 *    frames, which may change visual properties. The frame itself becomes the visual container, 
 *    "taking on all the styles and effects from the container shape it's just swallowed up".
 * 
 * 7. **Constraints vs Auto Layout confusion** - Don't confuse auto layout alignment with 
 *    constraints. Constraints work on children of frames WITHOUT auto layout, while this 
 *    function works on children OF auto layout frames.
 * 
 * 8. **FILL mode requires parent space** - For FILL to work properly, the parent auto layout 
 *    frame must have sufficient space. If the parent is also set to "hug contents", FILL 
 *    behavior may not work as expected.
 * 
 * 9. **Nested auto layout complexity** - Multiple levels of auto layout can create complex 
 *    interactions. Changes to child nodes may affect parent sizing unexpectedly.
 * 
 * 10. **Grid auto layout differences** - If the parent uses grid auto layout, some resizing 
 *     properties may behave differently than horizontal/vertical layouts.
 */
export async function setAutoLayoutResizing(params) {
  const { nodeId, axis, mode, horizontal, vertical } = params || {};
  
  console.log(`💥 [setAutoLayoutResizing] called with params:`, JSON.stringify(params, null, 2));
  
  // Validation
  if (!nodeId) throw new Error("Missing nodeId parameter");
  
  // Support both old API (axis/mode) and new API (horizontal/vertical)
  let horizontalMode = horizontal;
  let verticalMode = vertical;
  
  if (axis && mode) {
    if (axis === "horizontal") {
      horizontalMode = mode;
    } else if (axis === "vertical") {
      verticalMode = mode;
    }
  }
  
  if (!horizontalMode && !verticalMode) {
    throw new Error("Must specify either horizontal, vertical, or both axis/mode parameters");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node with id ${nodeId} not found`);

   console.log(`🔍 Before changes:`, {
     layoutMode: node.layoutMode,
     primaryAxisSizingMode: node.primaryAxisSizingMode,
     counterAxisSizingMode: node.counterAxisSizingMode,
     layoutGrow: node.layoutGrow,
     layoutAlign: node.layoutAlign
   });

   console.log(`🔍 Node details:`, {
     name: node.name,
     width: node.width,
     height: node.height,
     layoutMode: node.layoutMode,
     hasLayoutProperties: "layoutGrow" in node,
     layoutGrow: node.layoutGrow,
     layoutAlign: node.layoutAlign,
     parent: node.parent ? {
       name: node.parent.name,
       layoutMode: node.parent.layoutMode,
       width: node.parent.width,
       height: node.parent.height
     } : null
   });

  /**
   * Validates that the node can have layout behavior applied
   */
  function validateLayoutContext(node) {
    if (!node.parent || !("layoutMode" in node.parent) || node.parent.layoutMode === "NONE") {
      throw new Error(`Node is not a child of an auto layout container`);
    }
    
    if (!("layoutGrow" in node) && !("layoutAlign" in node)) {
      throw new Error(`Node doesn't support layout properties`);
    }
  }

  /**
   * Sets the grow behavior (for primary axis)
   */
  function setGrowBehavior(node, mode) {
    if (!("layoutGrow" in node)) return;
    
    console.log(`🔧 Setting grow behavior: ${mode}`);
    
    switch (mode) {
      case "FILL":
        node.layoutGrow = 1;
        break;
      case "HUG":
      case "FIXED":
        node.layoutGrow = 0;
        break;
    }
  }

  /**
   * Sets the alignment behavior (for counter axis)
   */
  function setAlignBehavior(node, mode) {
    if (!("layoutAlign" in node)) return;

    console.log(`🔧 [setAlignBehavior] Node: ${node.name} (${node.id}) - Current width: ${node.width}, layoutAlign: ${node.layoutAlign}, mode: ${mode}`);

    if (mode === "FILL") {
      // If parent is vertical, clear width so STRETCH can work
      if (
        node.parent &&
        "layoutMode" in node.parent &&
        node.parent.layoutMode === "VERTICAL" &&
        typeof node.width === "number"
      ) {
        try {
          node.resize(0, node.height);
          console.log(`✅ [setAlignBehavior] Set width to 0 for node ${node.name} (${node.id}) to enable STRETCH in vertical parent`);
        } catch (e) {
          try {
            node.resize(undefined, node.height);
            console.log(`✅ [setAlignBehavior] Cleared width for node ${node.name} (${node.id}) to enable STRETCH in vertical parent`);
          } catch (e2) {
            console.log(`❌ [setAlignBehavior] Failed to clear width for node ${node.name} (${node.id}):`, e2);
          }
        }
      }
      node.layoutAlign = "STRETCH";
      console.log(`✅ [setAlignBehavior] Set layoutAlign to "STRETCH" for node ${node.name} (${node.id})`);
    } else if (mode === "HUG" || mode === "FIXED") {
      node.layoutAlign = "INHERIT";
      console.log(`✅ [setAlignBehavior] Set layoutAlign to "INHERIT" for node ${node.name} (${node.id})`);
    } else {
      console.log(`❌ [setAlignBehavior] Did NOT set layoutAlign to "STRETCH" for node ${node.name} (${node.id}) - mode: ${mode}`);
    }
  }

  /**
   * Core logic for applying layout behavior
   */
  function applyLayoutBehavior(node, { horizontal, vertical }) {
    validateLayoutContext(node);
    
    const parent = node.parent;
    const isHorizontalLayout = parent.layoutMode === "HORIZONTAL";
    
     console.log(`🔧 Applying layout behavior:`, {
       horizontal,
       vertical,
       isHorizontalLayout,
       parentLayoutMode: parent.layoutMode
     });
    
    // Apply horizontal behavior
    if (horizontal) {
      if (isHorizontalLayout) {
        setGrowBehavior(node, horizontal);
      } else {
        setAlignBehavior(node, horizontal);
      }
    }
    
    // Apply vertical behavior  
    if (vertical) {
      if (isHorizontalLayout) {
        setAlignBehavior(node, vertical);
      } else {
        setGrowBehavior(node, vertical);
        // For hug, set counterAxisSizingMode to "AUTO" and clear height if possible
        if (vertical === "HUG" || vertical === "AUTO") {
          try {
            node.counterAxisSizingMode = "AUTO";
            console.log(`✅ [applyLayoutBehavior] Set counterAxisSizingMode to "AUTO" for node ${node.name} (${node.id}) in vertical parent (hug height)`);
            // Try to clear height if possible
            if (typeof node.height === "number" && node.height > 0) {
              try {
                node.resize(node.width, undefined);
                console.log(`✅ [applyLayoutBehavior] Cleared height for node ${node.name} (${node.id}) to enable vertical hug`);
              } catch (e2) {
                console.log(`❌ [applyLayoutBehavior] Failed to clear height for node ${node.name} (${node.id}):`, e2);
              }
            }
          } catch (e) {
            console.log(`❌ [applyLayoutBehavior] Failed to set counterAxisSizingMode to "AUTO" for node ${node.name} (${node.id}):`, e);
          }
        }
      }
    }
    
    return {
      layoutGrow: node.layoutGrow,
      layoutAlign: node.layoutAlign,
      width: node.width,
      height: node.height,
      parentLayoutMode: parent.layoutMode
    };
  }

  // Apply the layout behavior
  const result = applyLayoutBehavior(node, { 
    horizontal: horizontalMode, 
    vertical: verticalMode 
  });
  
   console.log(`✅ After changes:`, {
     layoutGrow: node.layoutGrow,
     layoutAlign: node.layoutAlign,
     width: node.width,
     height: node.height,
     parentLayoutMode: result.parentLayoutMode
   });
  
  // Fixed: Replace spread operator with Object.assign for compatibility
  return Object.assign({
    id: node.id
  }, result);
}


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
  console.log("⚠️⚠️⚠️⚠️️ this is deprecated use setAutoLayoutUnified⚠️⚠️⚠️⚠️")
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