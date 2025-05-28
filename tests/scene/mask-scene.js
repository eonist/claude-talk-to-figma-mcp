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

    // Create shapes inside the container
    const ellipseId = await createEllipse(containerId);
    const rectId = await createRectangle(containerId);

    // Move both to (padding, padding)
    if (ellipseId) {
      await runStep({
        ws,
        channel,
        command: "move_node",
        params: { nodeId: ellipseId, x: padding, y: padding },
        assert: () => true,
        label: "move_ellipse_to_padding"
      });
    }
    if (rectId) {
      await runStep({
        ws,
        channel,
        command: "move_node",
        params: { nodeId: rectId, x: padding, y: padding },
        assert: () => true,
        label: "move_rect_to_padding"
      });
    }

    // Apply mask, ensuring group is created in the container
    await runStep({
      ws,
      channel,
      command: "set_mask",
      params: {
        targetNodeId: rectId,
        maskNodeId: ellipseId,
        operations: [
          { targetNodeId: rectId, maskNodeId: ellipseId }
        ],
        parentId: containerId
      },
      assert: (response) => response && (
        (Array.isArray(response) && response[0]?.success) ||
        response.success
      ),
      label: "set_mask_with_parent"
    });

    results.push({ label: 'Mask Scene', pass: true });
  } catch (error) {
    results.push({ label: 'Mask Scene', pass: false, reason: error.message });
  }
}
