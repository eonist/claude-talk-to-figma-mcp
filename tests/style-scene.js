import { ws, channel, runStep, assertEchoedCommand } from "./test-runner.js";

/**
 * Helper to create a gradient style.
 */
function create_gradient(params) {
  return runStep({
    ws,
    channel,
    command: "create_gradient_style",
    params: { gradients: params },
    assert: assertEchoedCommand("create_gradient_style", params, "gradients"),
    label: `create_gradient (${params.name || ""})`
  });
}

/**
 * Scene for style/gradient tests.
 */
export async function styleScene(results) {
  results.push(await create_gradient({
    name: "UnitTestGradient",
    gradientType: "LINEAR",
    stops: [
      { position: 0, color: [1, 0, 0, 1] }, // Red RGBA
      { position: 1, color: [0, 0, 1, 1] }  // Blue RGBA
    ]
    // mode, opacity, transformMatrix are optional and omitted for this test
  }));
}
