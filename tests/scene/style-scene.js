import { ws, channel, runStep } from "../test-runner.js";

/**
 * Creates a simple linear gradient style
 */
async function createLinearGradient() {
  const params = {
    name: "LinearGradient",
    gradientType: "LINEAR",
    stops: [
      { position: 0, color: [1, 0, 0, 1] }, // Red
      { position: 1, color: [0, 0, 1, 1] }  // Blue
    ],
    // Vertical linear gradient (original)
    transformMatrix: [
      [0, 1, 0],     // 90-degree rotation: cos(90°), sin(90°), x-translation
      [-1, 0, 1]     // -sin(90°), cos(90°), y-translation
    ]
  };
  const result = await runStep({
    ws,
    channel,
    command: "create_gradient_style",
    params: { gradients: params },
    assert: (response) => ({ pass: !!(response && response.id), response }),
    label: "create_linear_gradient"
  });
  return result.response?.id;
}

/**
 * Creates a radial gradient style
 */
async function createRadialGradient() {
  const params = {
    name: "RadialGradient",
    gradientType: "RADIAL",
    stops: [
      { position: 0, color: [1, 1, 0, 1] }, // Yellow center
      { position: 1, color: [1, 0, 0, 1] }  // Red outer
    ],
    // Centered radial gradient
    transformMatrix: [[1, 0, 0], [0, 1, 0]]
  };
  const result = await runStep({
    ws,
    channel,
    command: "create_gradient_style",
    params: { gradients: params },
    assert: (response) => ({ pass: !!(response && response.id), response }),
    label: "create_radial_gradient"
  });
  return result.response?.id;
}

/**
 * Creates a multicolor gradient style
 */
async function createMulticolorGradient() {
  const params = {
    name: "MulticolorGradient",
    gradientType: "LINEAR",
    stops: [
      { position: 0, color: [1, 0, 0, 1] },    // Red
      { position: 0.5, color: [0, 1, 0, 1] },  // Green
      { position: 1, color: [0, 0, 1, 1] }     // Blue
    ],
    transformMatrix: [[1, 0, 0], [0, 1, 0]]
  };
  const result = await runStep({
    ws,
    channel,
    command: "create_gradient_style",
    params: { gradients: params },
    assert: (response) => ({ pass: !!(response && response.id), response }),
    label: "create_multicolor_gradient"
  });
  return result.response?.id;
}

/**
 * Creates a rectangle with specified gradient
 */
async function createRectangleWithGradient(name, gradientStyleId) {
  // Create rectangle
  const rectResult = await runStep({
    ws,
    channel,
    command: "create_rectangle",
    params: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      name
    },
    assert: (response) => ({ pass: !!(response && response.ids && response.ids.length > 0), response }),
    label: `create_rectangle_${name}`
  });
  const nodeId = rectResult.response?.ids?.[0];
  if (!nodeId) return null;

  // Apply gradient
  await runStep({
    ws,
    channel,
    command: "set_gradient",
    params: {
      entries: {
        nodeId,
        gradientStyleId,
        applyTo: "FILL"
      }
    },
    assert: () => ({ pass: true }),
    label: `apply_gradient_${name}`
  });

  return nodeId;
}

/**
 * Creates an auto layout frame and adds rectangles to it
 */
async function createAutoLayoutFrame(childNodeIds) {
  // Create frame
  const frameResult = await runStep({
    ws,
    channel,
    command: "create_frame",
    params: {
      x: 0,
      y: 0,
      width: 400,
      height: 120,
      name: "GradientContainer"
    },
    assert: (response) => ({ pass: !!(response && response.ids && response.ids.length > 0), response }),
    label: "create_container_frame"
  });
  const frameId = frameResult.response?.ids?.[0];
  if (!frameId) return null;

  // Set auto layout properties (horizontal, hug, spacing, padding)
  await runStep({
    ws,
    channel,
    command: "set_auto_layout",
    params: {
      layout: {
        nodeId: frameId,
        mode: "HORIZONTAL",
        itemSpacing: 10,
        padding: { top: 10, bottom: 10, left: 10, right: 10 }
      }
    },
    assert: () => ({ pass: true }),
    label: "set_auto_layout"
  });
  await runStep({
    ws,
    channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: frameId,
      axis: "horizontal",
      mode: "HUG"
    },
    assert: () => ({ pass: true }),
    label: "set_auto_layout_hug_width"
  });
  await runStep({
    ws,
    channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: frameId,
      axis: "vertical",
      mode: "HUG"
    },
    assert: () => ({ pass: true }),
    label: "set_auto_layout_hug_height"
  });

  // Add children to frame
  for (const childId of childNodeIds) {
    if (childId) {
      await runStep({
        ws,
        channel,
        command: "set_node",
        params: {
          parentId: frameId,
          childId: childId
        },
        assert: () => ({ pass: true }),
        label: `add_child_to_frame`
      });
    }
  }

  return frameId;
}

/**
 * Main function that creates 3 rectangles with gradients in auto layout
 */
export async function styleScene(results) {
  try {
    // Create gradient styles
    const linearGradientId = await createLinearGradient();
    const radialGradientId = await createRadialGradient();
    const multicolorGradientId = await createMulticolorGradient();

    // Create rectangles with gradients
    const rect1 = await createRectangleWithGradient("LinearRect", linearGradientId);
    const rect2 = await createRectangleWithGradient("RadialRect", radialGradientId);
    const rect3 = await createRectangleWithGradient("MulticolorRect", multicolorGradientId);
    
    // Create auto layout container and add rectangles
    const frameId = await createAutoLayoutFrame([rect1, rect2, rect3]);

    results.push({
      label: "create_three_gradient_rectangles",
      pass: !!(frameId && rect1 && rect2 && rect3),
      response: { frameId, rectangles: [rect1, rect2, rect3] }
    });

  } catch (error) {
    results.push({
      label: "create_three_gradient_rectangles",
      pass: false,
      reason: error.message
    });
  }
}
