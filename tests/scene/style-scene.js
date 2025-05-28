import { ws, channel, runStep, assertEchoedCommand } from "../test-runner.js";

/**
 * Helper to create a gradient style and return the style ID.
 */
/**
 * Helper to create a gradient style in Figma and return its style ID.
 * @returns {Promise<{styleId: string, result: object}>} The created style ID and full result object.
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
/**
 * Helper to create a rectangle in Figma for gradient tests.
 * @returns {Promise<{nodeId: string, result: object}>} The created node ID and full result object.
 */
/**
 * Helper to create a rectangle in Figma for gradient tests.
 * @param {string} name - Name for the rectangle
 * @param {number} x - X position (default: 0)
 * @param {number} y - Y position (default: 0)
 * @returns {Promise<{nodeId: string, result: object}>} The created node ID and full result object.
 */
async function create_rectangle(name = "GradientRectTest", x = 0, y = 0) {
  const params = {
    x,
    y,
    width: 100,
    height: 50,
    name
  };
  console.log("[create_rectangle] params:", params);
  const result = await runStep({
    ws,
    channel,
    command: "create_rectangle",
    params: params,
    assert: (response) => {
      console.log("[create_rectangle] response:", response);
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
/**
 * Helper to apply a gradient style to a Figma node.
 * @param {object} options - Options for the operation.
 * @param {string} options.nodeId - ID of the node to style.
 * @param {string} options.gradientStyleId - ID of the gradient style to apply.
 * @returns {Promise<object>} The result of the set_gradient command.
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
/**
 * Style scene: creates a gradient style, a rectangle, then applies the style to the rectangle.
 * @param {Array} results - Collector array for test step results.
 * @returns {Promise<void>}
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

/**
 * Helper to create a radial gradient style.
 * @returns {Promise<{styleId: string, result: object}>} The created style ID and full result object.
 */
async function create_radial_gradient() {
  const params = {
    name: "UnitTestRadialGradientStyle",
    gradientType: "RADIAL",
    stops: [
      { position: 0, color: [1, 1, 0, 1] },   // Yellow center
      { position: 0.5, color: [1, 0.5, 0, 1] }, // Orange middle
      { position: 1, color: [1, 0, 0, 1] }    // Red outer
    ],
    transformMatrix: [
      [1, 0, 0.5],   // Scale and center horizontally
      [0, 1, 0.5]    // Scale and center vertically
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
    label: `create_radial_gradient (${params.name})`
  });
  const styleId = result.response && result.response.id;
  return { styleId, result };
}

/**
 * Helper to create a multicolor horizontal linear gradient style.
 * @returns {Promise<{styleId: string, result: object}>} The created style ID and full result object.
 */
async function create_multicolor_horizontal_gradient() {
  const params = {
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
      [1, 0, 0],     // Horizontal direction (0° rotation)
      [0, 1, 0]      // No vertical transformation
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
    label: `create_multicolor_horizontal_gradient (${params.name})`
  });
  const styleId = result.response && result.response.id;
  return { styleId, result };
}

/**
 * Extended scene that demonstrates all three gradient types.
 * @param {Array} results - Collector array for test step results.
 * @returns {Promise<void>}
 */
export async function extendedGradientScene(results) {
  // Create all three gradient styles
  const { styleId: linearStyleId, result: linearResult } = await create_gradient();
  results.push(linearResult);

  const { styleId: radialStyleId, result: radialResult } = await create_radial_gradient();
  results.push(radialResult);

  const { styleId: multicolorStyleId, result: multicolorResult } = await create_multicolor_horizontal_gradient();
  results.push(multicolorResult);

  // Create three rectangles for each gradient with different positions
  const rectangles = [];
  const spacing = 120; // Space between rectangles (width + margin)
  for (let i = 0; i < 3; i++) {
    const rectName = `GradientRectTest ${i + 1}`;
    const x = i * spacing; // Position rectangles horizontally
    const y = 0;
    console.log(`[extendedGradientScene] Creating rectangle: ${rectName} at position (${x}, ${y})`);
    const { nodeId, result: rectResult } = await create_rectangle(rectName, x, y);
    rectangles.push(nodeId);
    results.push(rectResult);
  }

  // Apply each gradient to its respective rectangle
  const gradientStyles = [linearStyleId, radialStyleId, multicolorStyleId];
  const gradientNames = ["linear", "radial", "multicolor"];

  for (let i = 0; i < 3; i++) {
    if (gradientStyles[i] && rectangles[i]) {
      console.log(`[extendedGradientScene] Applying ${gradientNames[i]} gradient to rectangle: ${rectangles[i]}`);
      const setResult = await set_gradient({
        nodeId: rectangles[i],
        gradientStyleId: gradientStyles[i]
      });
      setResult.label = `set_gradient (${gradientNames[i]})`;
      results.push(setResult);
    } else {
      console.log(`[extendedGradientScene] Skipped applying ${gradientNames[i]} gradient: missing styleId or nodeId`);
      results.push({
        label: `set_gradient (${gradientNames[i]} - skipped)`,
        pass: false,
        reason: `Missing styleId or nodeId for ${gradientNames[i]} gradient`
      });
    }
  }
}
