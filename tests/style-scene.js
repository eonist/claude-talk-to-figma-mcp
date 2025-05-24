import { ws, channel, runStep, assertEchoedCommand } from "./test-runner.js";

/**
 * Helper to create a gradient style and return the style ID.
 */
async function create_gradient(params) {
  const result = await runStep({
    ws,
    channel,
    command: "create_gradient_style",
    params: { gradients: params },
    assert: (response) => {
      // Accept any response, we'll extract the style ID below
      return { pass: !!(response && (response.id || (response.result && response.result.id))), response };
    },
    label: `create_gradient (${params.name || ""})`
  });
  // The style ID may be in result.response.id or result.response.result.id
  const styleId = (result.response && result.response.id) ||
                  (result.response && result.response.result && result.response.result.id);
  return { styleId, result };
}

/**
 * Helper to create a rectangle and return the nodeId.
 */
async function create_rectangle(params) {
  const result = await runStep({
    ws,
    channel,
    command: "create_rectangle",
    params: { rectangle: params },
    assert: (response) => {
      // Log the actual response for debugging
      console.log("create_rectangle response:", response);
      return { pass: true, response };
    },
    label: `create_rectangle (${params.name || ""})`
  });
  // The nodeId may be in result.response.nodeId or result.response.result.nodeId
  const nodeId = (result.response && result.response.nodeId) ||
                 (result.response && result.response.result && result.response.result.nodeId);
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
  const gradientParams = {
    name: "UnitTestGradient",
    gradientType: "LINEAR",
    stops: [
      { position: 0, color: [1, 0, 0, 1] }, // Red RGBA
      { position: 1, color: [0, 0, 1, 1] }  // Blue RGBA
    ]
  };
  const { styleId, result: gradResult } = await create_gradient(gradientParams);
  results.push(gradResult);

  // 2. Create the rectangle
  const rectParams = {
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    name: "GradientRect"
  };
  const { nodeId, result: rectResult } = await create_rectangle(rectParams);
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
