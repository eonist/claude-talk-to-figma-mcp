import { runStep, ws, channel } from '../test-runner.js';

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
 * Main mask scene test.
 * @param {Array} results
 * @param {string} [parentFrameId] - Optional parent frame ID for the scene
 */
export async function maskScene(results, parentFrameId) {
  try {
    // Create a container frame as a child of the all-scenes container
    let containerId = null;
    if (parentFrameId) {
      const containerRes = await runStep({
        ws,
        channel,
        command: "create_frame",
        params: {
          frame: {
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            name: "MaskSceneContainer",
            fillColor: { r: 1, g: 1, b: 1, a: 1 },
            parentId: parentFrameId
          }
        },
        assert: (response) => Array.isArray(response.ids) && response.ids.length > 0,
        label: "create_mask_scene_container"
      });
      containerId = containerRes.response?.ids?.[0];

      // Apply hugging autolayout to the container frame
      if (containerId) {
        await runStep({
          ws,
          channel,
          command: "set_auto_layout",
          params: {
            layout: {
              nodeId: containerId,
              mode: "HORIZONTAL",
              itemSpacing: 20,
              counterAxisSpacing: 20,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 20,
              paddingBottom: 20,
              primaryAxisSizing: "AUTO",
              counterAxisSizing: "AUTO"
            }
          },
          assert: (response) => response && response["0"] && response["0"].success === true && response["0"].nodeId === containerId,
          label: "set_auto_layout (hug both axes, maskScene)"
        });
      }
    }

    const ellipseId = await createEllipse(containerId); // must be bellow the shape to mask
    const rectId = await createRectangle(containerId);
    await setMask(rectId, ellipseId);
    results.push({ label: 'Mask Scene', pass: true });
  } catch (error) {
    results.push({ label: 'Mask Scene', pass: false, reason: error.message });
  }
}
