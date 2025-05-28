export async function maskScene(results) {
  try {
    const rectId = await createRectangle();
    const ellipseId = await createEllipse();
    await setMask(rectId, ellipseId);
    results.push({ label: 'Mask Scene', pass: true });
  } catch (error) {
    results.push({ label: 'Mask Scene', pass: false, reason: error.message });
  }
}

async function createRectangle() {
  // Logic to create a rectangle with green fill
  return createShape({
    type: 'rectangle',
    width: 100,
    height: 100,
    fillColor: { r: 0, g: 1, b: 0, a: 1 } // Green
  });
}

async function createEllipse() {
  // Logic to create an ellipse with red fill
  return createShape({
    type: 'ellipse',
    width: 100,
    height: 100,
    fillColor: { r: 1, g: 0, b: 0, a: 1 } // Red
  });
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
