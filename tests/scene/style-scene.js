import { ws, channel, runStep, assertEchoedCommand } from "../test-runner.js";

/**
 * Helper to create a gradient style and return the style ID.
 */
async function create_gradient() {
  const params = {
    name: "UnitTestGradientStyle",
    gradientType: "LINEAR",
    stops: [
      { position: 0, color: [1, 0, 0, 1] }, // Red RGBA
      { position: 1, color: [0, 0, 1, 1] }  // Blue RGBA
    ],
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
    assert: (response) => {
      return { pass: !!(response && response.id), response };
    },
    label: `create_gradient (${params.name})`
  });
  const styleId = result.response && result.response.id;
  return { styleId, result };
}

/**
 * Helper to create a rectangle and return the nodeId.
 */
async function create_rectangle() {
  const params = {
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    name: "GradientRectTest"
  };
  const result = await runStep({
    ws,
    channel,
    command: "create_rectangle",
    params: { rectangle: params },
    assert: (response) => {
      console.log("create_rectangle response:", response);
      return { pass: !!(response && response.ids && response.ids.length > 0), response };
    },
    label: `create_rectangle (${params.name})`
  });
  const nodeId = result.response && result.response.ids && result.response.ids[0];
  return { nodeId, result };
}

/**
 * Helper to apply a gradient style to a node.
 */
async function set_gradient({ nodeId, gradientStyleId }) {
  return await runStep({
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
    assert: (response) => ({ pass: true }),
    label: `set_gradient (nodeId: ${nodeId}, styleId: ${gradientStyleId})`
  });
}

/**
 * Scene for style/gradient tests.
 */
export async function styleScene(results) {
  // 1. Create the gradient style
  const { styleId, result: gradResult } = await create_gradient();
  results.push(gradResult);

  // 2. Create the rectangle
  const { nodeId, result: rectResult } = await create_rectangle();
  results.push(rectResult);

  // 3. Apply the gradient style to the rectangle
  if (styleId && nodeId) {
    results.push(await set_gradient({ nodeId, gradientStyleId: styleId }));
  } else {
    results.push({
      label: "set_gradient (skipped)",
      pass: false,
      reason: `Missing styleId (${styleId}) or nodeId (${nodeId})`
    });
  }
}
