/**
 * Flatten operations for Figma nodes.
 * Exports: flatten_nodes
 */

/**
 * Robust batch flatten for Figma plugin API.
 *
 * Why all this complexity?
 * - The Figma Plugin API's `figma.flatten()` is stricter than the UI: nodes must be siblings, not locked/removed, not in instances/components, and must have a valid parent.
 * - Flattening in the UI "just works" because Figma auto-fixes parent/selection/z-index issues, but the API does not.
 * - To guarantee flattening works for any set of nodes, we:
 *   1. Clone and prepare nodes (detach instances, skip locked/removed, clone if possible).
 *   2. Create a temporary frame as a child of the intended parent (frame or page).
 *   3. Append the prepared nodes to the temp frame.
 *   4. Call `figma.flatten(tempFrame.children, tempFrame)` to flatten.
 *   5. Remove the original nodes (not the clones).
 *   6. Move the flattened node to the original parent (frame) before removing the temp frame.
 *   7. Remove the temp frame (Figma will reparent the flattened node to the frame).
 * - This workflow avoids all known Figma API flattening errors, including parent lookup, z-index, and auto-layout issues.
 * - See: https://github.com/eonist/conduit/issues/370#issuecomment-2908978084 for a comprehensive analysis.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for flattening nodes.
 * @param {Array<string>} params.nodeIds - Array of node IDs to flatten.
 * @returns {Promise<{success: boolean, flattened: Array<string>}>} Object with success flag and array of flattened node IDs.
 * @throws {Error} If nodeIds is missing/invalid, or nodes cannot be found or flattened.
 */
export async function flatten_nodes(params) {
  
  // Support flattening an array of sibling nodes, a single node, or selection
  let nodeIds = [];
  if (params && params.selection) {
    nodeIds = (figma.currentPage.selection || []).map(node => node.id);
    if (nodeIds.length === 0) {
      throw new Error("No nodes selected to flatten");
    }
  } else if (params && Array.isArray(params.nodeIds)) {
    nodeIds = params.nodeIds;
  } else if (params && typeof params.nodeId === "string") {
    nodeIds = [params.nodeId];
  } else {
    throw new Error("Must provide 'nodeId', 'nodeIds', or 'selection: true'");
  }

  // If more than one node, try flattening as siblings
  if (nodeIds.length > 1) {
    // Step 1: Node lookup
    console.log("[flatten_nodes] Step 1: Looking up nodes", nodeIds);
    const nodes = [];
    for (const id of nodeIds) {
      const node = await figma.getNodeByIdAsync(id);
      if (!node) {
        console.error("[flatten_nodes] Node not found:", id);
        throw new Error(`Node not found: ${id}`);
      }
      nodes.push(node);
    }
    console.log("[flatten_nodes] Found nodes:", nodes.map(n => n.id), "types:", nodes.map(n => n.type));

    // Step 2: Prepare nodes (detach, skip locked/removed, clone)
    const prepared = [];
    for (let n of nodes) {
      if (n.locked || n.removed) {
        console.warn("[flatten_nodes] Skipping locked/removed node:", n.id, n.name, n.type);
        continue;
      }
      if (n.type === "INSTANCE" && typeof n.detachInstance === "function") {
        console.log("[flatten_nodes] Detaching instance:", n.id, n.name);
        n = n.detachInstance();
      }
      if (n.clone) n = n.clone();
      prepared.push(n);
    }
    console.log("[flatten_nodes] Prepared nodes:", prepared.map(n => n.id), "types:", prepared.map(n => n.type));
    if (prepared.length < 2) {
      console.error("[flatten_nodes] Not enough eligible nodes to flatten");
      throw new Error("Need at least 2 eligible nodes to flatten");
    }

    // Step 3: Parent lookup
    const origParentId = nodes[0].parent && nodes[0].parent.id;
    let origParent = null;
    if (origParentId) {
      try {
        origParent = await figma.getNodeByIdAsync(origParentId);
        console.log("[flatten_nodes] Found original parent:", origParentId, origParent && origParent.type);
      } catch (e) {
        console.warn("[flatten_nodes] Could not find original parent:", origParentId, e && e.message);
        origParent = null;
      }
    }

    // Step 4: Create temp frame
    const tempFrame = figma.createFrame();
    tempFrame.x = prepared[0].x;
    tempFrame.y = prepared[0].y;
    tempFrame.resizeWithoutConstraints(1000, 1000); // Large enough to fit
    if (origParent && origParent.type !== "PAGE" && !origParent.removed) {
      origParent.appendChild(tempFrame);
      console.log("[flatten_nodes] Appended temp frame to original parent:", origParentId);
    } else {
      figma.currentPage.appendChild(tempFrame);
      console.log("[flatten_nodes] Appended temp frame to current page");
    }

    // Step 5: Append prepared nodes to temp frame
    for (const n of prepared) tempFrame.appendChild(n);
    console.log("[flatten_nodes] Appended prepared nodes to temp frame:", prepared.map(n => n.id));

    // Step 6: Flatten
    try {
      const flattened = figma.flatten(tempFrame.children, tempFrame);
      console.log("[flatten_nodes] Flattened node:", flattened.id);

      // Step 7: Remove original nodes (not the clones)
      for (const orig of nodes) {
        try {
          if (orig.remove) orig.remove();
          console.log("[flatten_nodes] Removed original node:", orig.id);
        } catch (e) {
          console.warn("[flatten_nodes] Failed to remove original node:", orig.id, e && e.message);
        }
      }

      // Step 8: Move the flattened node to the original parent (the frame), before removing the temp frame
      if (origParent && origParent.type !== "PAGE" && !origParent.removed) {
        origParent.appendChild(flattened);
        console.log("[flatten_nodes] Appended flattened node to original parent:", origParentId);
      } else {
        figma.currentPage.appendChild(flattened);
        console.log("[flatten_nodes] Appended flattened node to current page");
      }

      // Step 9: Remove temp frame
      tempFrame.remove();
      console.log("[flatten_nodes] Removed temp frame");

      return { success: true, nodeId: flattened.id, ids: [flattened.id] };
    } catch (error) {
      tempFrame.remove();
      console.error("[flatten_nodes] Flatten failed:", error && error.message, error);
      throw error;
    }
  }

  // Fallback: flatten a single node's children (legacy)
  const node = await figma.getNodeByIdAsync(nodeIds[0]);
  if (!node) throw new Error(`Node not found with ID: ${nodeIds[0]}`);
  if (!("children" in node) || typeof node.flatten !== "function") {
    throw new Error(`Node with ID ${nodeIds[0]} cannot be flattened`);
  }
  // Flatten the node's children
  const result = node.flatten(node.children);
  return { success: true, nodeId: result.id, ids: [result.id] };
}
