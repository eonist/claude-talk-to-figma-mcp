import { runStep, ws, channel } from '../test-runner.js';

/**
 * Creates a rectangle shape for masking operations with predefined styling.
 * @param {string} [parentId] - Optional parent frame ID for containment
 * @returns {Promise<string|null>} The created rectangle ID, or null if creation failed
 * @example
 * const rectId = await createRectangle('frame123');
 * // Creates a green 100x100 rectangle at origin
 */
async function createRectangle(parentId) {
  const params = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    name: 'MaskRectangle',
    fillColor: { r: 0, g: 1, b: 0, a: 1 }, // Green
    ...(parentId && { parentId })
  };
  const response = await runStep({
    ws,
    channel,
    command: 'create_rectangle',
    params: { rectangle: params },
    assert: (response) => Array.isArray(response.ids) && response.ids.length > 0,
    label: 'createRectangle'
  });
  return response.response?.ids?.[0];
}

/**
 * Creates an ellipse shape for masking operations with predefined styling.
 * @param {string} [parentId] - Optional parent frame ID for containment  
 * @returns {Promise<string|null>} The created ellipse ID, or null if creation failed
 * @example
 * const ellipseId = await createEllipse('frame123');
 * // Creates a red 100x100 ellipse at origin
 */
async function createEllipse(parentId) {
  const params = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    name: 'MaskEllipse',
    fillColor: { r: 1, g: 0, b: 0, a: 1 }, // Red
    ...(parentId && { parentId })
  };
  const response = await runStep({
    ws,
    channel,
    command: 'create_ellipse',
    params: { ellipse: params },
    assert: (response) => Array.isArray(response.ids) && response.ids.length > 0,
    label: 'createEllipse'
  });
  return response.response?.ids?.[0];
}

/**
 * Applies a mask operation using one shape to clip another shape.
 * The mask node defines the visible area of the target node.
 * @param {string} rectId - ID of the target node to be masked
 * @param {string} ellipseId - ID of the mask node that defines the clipping area
 * @throws {Error} When mask operation fails or nodes are invalid
 * @example
 * await setMask('rect123', 'ellipse456');
 * // Rectangle will only be visible within the ellipse boundaries
 */
async function setMask(rectId, ellipseId) {
  // Command to apply the mask using the given IDs
  await runStep({
    ws,
    channel,
    command: "set_mask",
    params: {
      targetNodeId: rectId,
      maskNodeId: ellipseId,
      operations: [
        { targetNodeId: rectId, maskNodeId: ellipseId }
      ]
    },
    assert: (response) => response && response.success === true,
    label: `set_mask with rectId: ${rectId} and ellipseId: ${ellipseId}`
  });
}

/**
 * Main entry point for mask scene testing.
 * Creates overlapping shapes and demonstrates masking functionality.
 * @param {Array} results - Array to collect test results
 * @param {string} [parentFrameId] - Optional parent frame ID for scene organization
 * @example
 * const results = [];
 * await maskScene(results, 'container123');
 * console.log('Mask operations completed');
 */
export async function maskScene(results, parentFrameId) {
  try {
    // Create a container frame as a child of the all-scenes container
    let containerId = null;
    // Use padding and fit frame to content
    const padding = 20;
    // Rectangle: x: 0, y: 0, width: 100, height: 100
    // Ellipse: x: 0, y: 0, width: 100, height: 100 (overlap)
    // For this simple case, content size is 100x100, so frame is 100+2*padding
    const frameWidth = 100 + 2 * padding;
    const frameHeight = 100 + 2 * padding;

    if (parentFrameId) {
      console.log("[MASK SCENE] Creating container frame...");
      const containerRes = await runStep({
        ws,
        channel,
        command: "create_frame",
        params: {
          frame: {
            x: 0,
            y: 0,
            width: frameWidth,
            height: frameHeight,
            name: "MaskSceneContainer",
            fillColor: { r: 1, g: 1, b: 1, a: 1 },
            parentId: parentFrameId
          }
        },
        assert: (response) => Array.isArray(response.ids) && response.ids.length > 0,
        label: "create_mask_scene_container"
      });
      containerId = containerRes.response?.ids?.[0];
      console.log("[MASK SCENE] Container frame created:", containerId, containerRes);
    }

    // Offset both shapes by padding
    console.log("[MASK SCENE] Creating ellipse...");
    const ellipseId = await createEllipse(containerId); // must be bellow the shape to mask
    console.log("[MASK SCENE] Ellipse created:", ellipseId);

    console.log("[MASK SCENE] Creating rectangle...");
    const rectId = await createRectangle(containerId);
    console.log("[MASK SCENE] Rectangle created:", rectId);

    // Move both to (padding, padding)
    if (ellipseId) {
      console.log("[MASK SCENE] Moving ellipse to padding...");
      const moveEllipseRes = await runStep({
        ws,
        channel,
        command: "move_node",
        params: { nodeId: ellipseId, x: padding, y: padding },
        assert: () => true,
        label: "move_ellipse_to_padding"
      });
      console.log("[MASK SCENE] Ellipse moved:", moveEllipseRes);
    }
    if (rectId) {
      console.log("[MASK SCENE] Moving rect to padding...");
      const moveRectRes = await runStep({
        ws,
        channel,
        command: "move_node",
        params: { nodeId: rectId, x: padding, y: padding },
        assert: () => true,
        label: "move_rect_to_padding"
      });
      console.log("[MASK SCENE] Rect moved:", moveRectRes);
    }

    console.log("[MASK SCENE] Applying mask...");
    await setMask(rectId, ellipseId);
    console.log("[MASK SCENE] Mask applied.");

    // --- Wait for mask operation to complete ---
    console.log("[MASK SCENE] Waiting for mask operation to complete...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("[MASK SCENE] Wait complete.");

    // --- Ensure mask group is inside the container frame ---
    let groupId = null;
    if (containerId) {
      console.log("[MASK SCENE] Getting document info to find mask group...");
      const docInfoRes = await runStep({
        ws,
        channel,
        command: "get_document_info",
        params: {},
        assert: (response) => response && response.id,
        label: "get_document_info_for_mask_group"
      });
      console.log("[MASK SCENE] Document info:", docInfoRes);
      const allNodes = docInfoRes.response?.document?.children || [];
      // Find a GROUP node that is not ellipse/rect
      const candidateGroups = allNodes.filter(child =>
        child.type === "GROUP" &&
        child.id !== ellipseId &&
        child.id !== rectId
      );
      console.log("[MASK SCENE] Candidate groups found:", candidateGroups.map(g => g.id));
      if (candidateGroups.length > 0) {
        groupId = candidateGroups[0].id;
        console.log("[MASK SCENE] Attempting to move group to container:", groupId, "->", containerId);
        const moveGroupRes = await runStep({
          ws,
          channel,
          command: "set_node",
          params: { parentId: containerId, childId: groupId, index: 0 },
          assert: (response) => {
            // Check for success in the returned content array
            const content = response?.content;
            if (Array.isArray(content)) {
              return content.some(
                obj =>
                  obj.type === "text" &&
                  obj.text &&
                  obj.text.includes('"success":true')
              );
            }
            return false;
          },
          label: "move_mask_group_to_container"
        });
        console.log("[MASK SCENE] Move group result:", moveGroupRes);
        // Optionally, move the group to (padding, padding) if needed
      } else {
        console.warn("[MASK SCENE] Mask group not found anywhere in document after masking.");
      }
    }

    results.push({ label: 'Mask Scene', pass: true });
  } catch (error) {
    results.push({ label: 'Mask Scene', pass: false, reason: error.message });
  }
}
