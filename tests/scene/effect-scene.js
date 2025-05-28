import { randomColor } from "../helper.js";
import { channel, runStep, ws } from "../test-runner.js";

/**
 * Creates a frame container for effect demonstrations with random styling.
 * @param {string} [parentId] - Optional parent frame ID for hierarchical organization
 * @returns {Promise<string|null>} The created frame ID, or null if creation failed
 * @example
 * const frameId = await createFrame('container123');
 */
async function createFrame(parentId) {
  const params = {
    x: 50, y: 100, width: 400, height: 200,
    name: "Effect Frame",
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: 2,
    ...(parentId && { parentId })
  };
  const res = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: r => Array.isArray(r.ids) && r.ids.length > 0,
    label: "create_frame"
  });
  return res?.response?.ids?.[0];
}

/**
 * Applies horizontal auto-layout to a frame with wrapping and consistent spacing.
 * Optimizes layout for effect demonstration with proper padding and gaps.
 * @param {string} frameId - The frame ID to apply auto-layout to
 * @returns {Promise} Test result object
 * @example
 * await applyAutolayout('frame123');
 * // Frame now has horizontal flow with 20px spacing
 */
async function applyAutolayout(frameId) {
  const params = {
    layout: {
      nodeId: frameId,
      mode: "HORIZONTAL",
      layoutWrap: "WRAP",
      itemSpacing: 20,
      counterAxisSpacing: 20,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 20,
      paddingBottom: 20,
      primaryAxisSizing: "AUTO",
      counterAxisSizing: "AUTO"
    }
  };
  await runStep({
    ws, channel,
    command: "set_auto_layout",
    params,
    assert: r => r && r["0"] && r["0"].success === true && r["0"].nodeId === frameId,
    label: "apply_autolayout"
  });
}

/**
 * Creates a rectangle with specified styling for effect testing.
 * @param {string} frameId - Parent frame ID for containment
 * @param {string} name - Display name for the rectangle
 * @param {{r: number, g: number, b: number, a: number}} fillColor - Rectangle fill color
 * @returns {Promise<string|null>} The created rectangle ID, or null if creation failed
 * @example
 * const rectId = await createRect('frame123', 'TestRect', { r: 1, g: 0, b: 0, a: 1 });
 */
async function createRect(frameId, name, fillColor) {
  const params = {
    x: 0, y: 0,
    width: 100, height: 100,
    name,
    fillColor,
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1,
    parentId: frameId
  };
  const res = await runStep({
    ws, channel,
    command: "create_rectangle",
    params: { rectangle: params },
    assert: r => Array.isArray(r.ids) && r.ids.length > 0,
    label: `create_rectangle (${name})`
  });
  return res?.response?.ids?.[0];
}

/**
 * Applies visual effects to a node (drop shadow, inner shadow, background blur, etc.).
 * @param {string} nodeId - Target node ID to apply effects to
 * @param {Array} effects - Array of effect configurations
 * @param {string} label - Descriptive label for the operation
 * @returns {Promise<void>}
 * @throws {Error} When effect application fails or node is invalid
 * @example
 * await applyEffect('rect123', [{
 *   type: "DROP_SHADOW",
 *   color: { r: 0, g: 0, b: 0, a: 1 },
 *   offset: { x: 0, y: 2 },
 *   radius: 4,
 *   visible: true
 * }], "Apply drop shadow");
 */
async function applyEffect(nodeId, effects, label) {
  await runStep({
    ws, channel,
    command: "set_effect",
    params: {
      nodeId,
      effects
    },
    assert: r => r && r.nodeId === nodeId,
    label
  });
}

/**
 * Creates a red rectangle with drop shadow effect for demonstration.
 * @param {string} frameId - Parent frame ID for the rectangle
 * @returns {Promise<void>}
 * @example
 * await addRedRectWithDropShadow('frame123');
 * // Creates red rectangle with subtle drop shadow
 */
async function addRedRectWithDropShadow(frameId) {
  const red = { r: 1, g: 0, b: 0, a: 1 };
  const rectId = await createRect(frameId, "RedRect", red);
  if (!rectId) return;
  await applyEffect(rectId, [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 1 },
      offset: { x: 0, y: 2 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
      opacity: 0.5,
      name: "Drop Shadow"
    }
  ], "Apply drop shadow to RedRect");
}

/**
 * Creates a green rectangle with inner shadow effect using style variables.
 * Demonstrates advanced effect styling with reusable style definitions.
 * @param {string} frameId - Parent frame ID for the rectangle
 * @returns {Promise<void>}
 * @example
 * await addGreenRectWithInnerShadow('frame123');
 * // Creates green rectangle with inner shadow style
 */
async function addGreenRectWithInnerShadow(frameId) {
  const green = { r: 0, g: 1, b: 0, a: 1 };
  const rectId = await createRect(frameId, "GreenRect", green);
  if (!rectId) return;

  // 1. Create the effect style variable for inner shadow
  const styleResult = await runStep({
    ws, channel,
    command: "create_effect_style_variable",
    params: {
      name: "Inner Shadow",
      effects: [
        {
          type: "INNER_SHADOW",
          color: { r: 0.2, g: 0.2, b: 0.2, a: 0.3 },
          offset: { x: 0, y: -2 },
          radius: 3,
          spread: 0,
          visible: true,
          blendMode: "NORMAL"
        }
      ]
    },
    assert: r => r && r.id,
    label: "create_effect_style_variable (Inner Shadow)"
  });
  const effectStyleId = styleResult?.response?.id;
  if (!effectStyleId) {
    console.error("No effectStyleId returned from create_effect_style_variable");
    return;
  }

  // Add a delay to ensure the style is registered before applying
  //await new Promise(res => setTimeout(res, 300));

  // 2. Apply the effect style to the green rectangle
  try {
    console.log("Applying effect style to GreenRect", { nodeId: rectId, effectStyleId });
    await runStep({
      ws, channel,
      command: "apply_effect_style",
      params: {
        nodeId: rectId,
        effectStyleId
      },
      assert: r => r && r.nodeId === rectId,
      label: "apply_effect_style to GreenRect"
    });
    console.log("Applied effect style to GreenRect", { nodeId: rectId, effectStyleId });
  } catch (err) {
    console.error("Error applying effect style to GreenRect", err);
  }

}

/**
 * Creates a blue rectangle with background blur effect.
 * @param {string} frameId - Parent frame ID for the rectangle
 * @returns {Promise<void>}
 * @example
 * await addBlueRectWithBackgroundBlur('frame123');
 * // Creates blue rectangle with 6px background blur
 */
async function addBlueRectWithBackgroundBlur(frameId) {
  const blue = { r: 0, g: 0, b: 1, a: 1 };
  const rectId = await createRect(frameId, "BlueRect", blue);
  if (!rectId) return;
  await applyEffect(rectId, [
    {
      type: "BACKGROUND_BLUR",
      radius: 6,
      visible: true,
      blendMode: "NORMAL",
      name: "Background Blur"
    }
  ], "Apply background blur to BlueRect");
}

// --- Main Entrypoint ---

/**
 * Main entry point for effect scene demonstration.
 * Creates multiple rectangles showcasing different visual effects.
 * @param {Array} results - Array to collect test results
 * @param {string} [parentFrameId] - Optional parent frame ID for scene organization
 * @example
 * const results = [];
 * await effectScene(results, 'container123');
 * console.log('Effect demonstrations completed');
 */
export async function effectScene(results, parentFrameId) {
  const frameId = await createFrame(parentFrameId);
  if (!frameId) return;
  await applyAutolayout(frameId);

  await addRedRectWithDropShadow(frameId);
  await addGreenRectWithInnerShadow(frameId);
  await addBlueRectWithBackgroundBlur(frameId);
}
