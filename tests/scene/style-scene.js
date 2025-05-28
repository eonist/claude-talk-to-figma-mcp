import { ws, channel, runStep, assertEchoedCommand } from "../test-runner.js";

/**
 * Helper to create a frame with horizontal auto layout and hug settings.
 * @returns {Promise<{frameId: string, result: object}>}
 */
async function create_autolayout_frame() {
  const params = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    name: "GradientFrame",
  };
  const result = await runStep({
    ws,
    channel,
    command: "create_frame",
    params,
    assert: (response) => {
      return { pass: !!(response && response.ids && response.ids.length > 0), response };
    },
    label: "create_autolayout_frame"
  });
  const frameId = result.response && result.response.ids && result.response.ids[0];

  // Set auto layout: horizontal, hug width/height
  await runStep({
    ws,
    channel,
    command: "set_auto_layout",
    params: {
      layout: {
        nodeId: frameId,
        mode: "HORIZONTAL"
      }
    },
    assert: () => ({ pass: true }),
    label: "set_auto_layout_horizontal"
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

  return { frameId, result };
}

/**
 * Helper to create a rectangle, apply a gradient, and add to a parent frame.
 * @param {object} gradientParams - Gradient style params
 * @param {string} rectName - Name for the rectangle
 * @param {string} parentId - Frame node ID
 * @returns {Promise<{nodeId: string, result: object}>}
 */
async function create_gradient_rectangle(gradientParams, rectName, parentId) {
  // 1. Create gradient style
  const gradResult = await runStep({
    ws,
    channel,
    command: "create_gradient_style",
    params: { gradients: gradientParams },
    assert: (response) => ({ pass: !!(response && response.id), response }),
    label: `create_gradient_style (${gradientParams.name})`
  });
  const styleId = gradResult.response && gradResult.response.id;

  // 2. Create rectangle
  const rectParams = {
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    name: rectName,
    parentId
  };
  const rectResult = await runStep({
    ws,
    channel,
    command: "create_rectangle",
    params: rectParams,
    assert: (response) => ({ pass: !!(response && response.ids && response.ids.length > 0), response }),
    label: `create_rectangle (${rectName})`
  });
  const nodeId = rectResult.response && rectResult.response.ids && rectResult.response.ids[0];

  // 3. Apply gradient style to rectangle
  await runStep({
    ws,
    channel,
    command: "set_gradient",
    params: {
      entries: {
        nodeId,
        gradientStyleId: styleId,
        applyTo: "FILL"
      }
    },
    assert: () => ({ pass: true }),
    label: `set_gradient (${rectName})`
  });

  return { nodeId, result: rectResult };
}

/**
 * Create a rectangle with a vertical linear gradient and add to frame.
 */
async function create_linear_gradient_rect(parentId) {
  const gradientParams = {
    name: "UnitTestGradientStyle",
    gradientType: "LINEAR",
    stops: [
      { position: 0, color: [1, 0, 0, 1] }, // Red
      { position: 1, color: [0, 0, 1, 1] }  // Blue
    ],
    transformMatrix: [
      [0, 1, 0],
      [-1, 0, 1]
    ]
  };
  return await create_gradient_rectangle(gradientParams, "LinearGradientRect", parentId);
}

/**
 * Create a rectangle with a radial gradient and add to frame.
 */
async function create_radial_gradient_rect(parentId) {
  const gradientParams = {
    name: "UnitTestRadialGradientStyle",
    gradientType: "RADIAL",
    stops: [
      { position: 0, color: [1, 1, 0, 1] },   // Yellow
      { position: 0.5, color: [1, 0.5, 0, 1] }, // Orange
      { position: 1, color: [1, 0, 0, 1] }    // Red
    ],
    transformMatrix: [
      [1, 0, 0.5],
      [0, 1, 0.5]
    ]
  };
  return await create_gradient_rectangle(gradientParams, "RadialGradientRect", parentId);
}

/**
 * Create a rectangle with a multicolor horizontal linear gradient and add to frame.
 */
async function create_multicolor_gradient_rect(parentId) {
  const gradientParams = {
    name: "UnitTestMulticolorHorizontalGradient",
    gradientType: "LINEAR",
    stops: [
      { position: 0, color: [1, 0, 0, 1] },     // Red
      { position: 0.25, color: [1, 1, 0, 1] },  // Yellow
      { position: 0.5, color: [0, 1, 0, 1] },   // Green
      { position: 0.75, color: [0, 0, 1, 1] },  // Blue
      { position: 1, color: [0.5, 0, 0.5, 1] }  // Purple
    ],
    transformMatrix: [
      [1, 0, 0],
      [0, 1, 0]
    ]
  };
  return await create_gradient_rectangle(gradientParams, "MulticolorGradientRect", parentId);
}

/**
 * Main scene: creates a frame with horizontal auto layout, then adds three rectangles with different gradients.
 * @param {Array} results - Collector array for test step results.
 */
export async function styleScene(results) {
  // 1. Create frame with horizontal auto layout
  const { frameId, result: frameResult } = await create_autolayout_frame();
  results.push(frameResult);

  // 2. Create and add three rectangles with different gradients
  // Linear gradient rectangle
  const linear = await create_linear_gradient_rect(frameId);
  results.push({
    label: "create_linear_gradient_rect",
    pass: !!linear.nodeId,
    nodeId: linear.nodeId,
    ...linear.result
  });

  // Radial gradient rectangle
  const radial = await create_radial_gradient_rect(frameId);
  results.push({
    label: "create_radial_gradient_rect",
    pass: !!radial.nodeId,
    nodeId: radial.nodeId,
    ...radial.result
  });

  // Multicolor gradient rectangle
  const multi = await create_multicolor_gradient_rect(frameId);
  results.push({
    label: "create_multicolor_gradient_rect",
    pass: !!multi.nodeId,
    nodeId: multi.nodeId,
    ...multi.result
  });
}
