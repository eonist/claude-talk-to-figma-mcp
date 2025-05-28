import { runStep, ws, channel } from '../test-runner.js';

async function createRectangle() {
  const params = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    name: 'MaskRectangle',
    fillColor: { r: 0, g: 1, b: 0, a: 1 } // Green
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

async function createEllipse() {
  const params = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    name: 'MaskEllipse',
    fillColor: { r: 1, g: 0, b: 0, a: 1 } // Red
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

export async function maskScene(results) {
  try {
    const ellipseId = await createEllipse();
    const rectId = await createRectangle();
    
    await setMask(rectId, ellipseId);
    results.push({ label: 'Mask Scene', pass: true });
  } catch (error) {
    results.push({ label: 'Mask Scene', pass: false, reason: error.message });
  }
}
