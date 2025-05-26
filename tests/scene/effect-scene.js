import { randomColor } from "../helper.js";
import { channel, runStep, ws } from "../test-runner.js";

/**
 * Helper to create a frame for effect tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_frame() {
  const params = {
    x: 50, y: 100, width: 400, height: 200,
    name: 'Effect Frame',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: 2
  };
  return runStep({
    ws, channel,
    command: 'create_frame',
    params: { frame: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_frame (${params.name})`
  });
}

/**
 * Helper to apply autolayout to a frame with horizontal flow, wrapping, and specific gaps and padding.
 * @param {string} frameId
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function apply_autolayout(frameId) {
  const params = {
    layout: {
      nodeId: frameId,
      mode: 'HORIZONTAL',
      layoutWrap: 'WRAP',
      itemSpacing: 20,
      counterAxisSpacing: 20,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 20,
      paddingBottom: 20,
      primaryAxisSizing: 'FIXED'
    }
  };
  return runStep({
    ws, channel,
    command: 'set_auto_layout',
    params: params,
    assert: (response) => ({
      pass: response && response['0'] && response['0'].success === true && response['0'].nodeId === frameId,
      response
    }),
    label: `apply_autolayout to frame ${frameId}`
  });
}

/**
 * Helper to create a rectangle of a specific color and size inside a parent frame.
 * @param {string} parentId
 * @param {string} name
 * @param {{r:number,g:number,b:number,a:number}} fillColor
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_rectangle_with_color(parentId, name, fillColor) {
  const params = {
    x: 0, y: 0,
    width: 100, height: 100,
    name,
    fillColor,
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1,
    parentId
  };
  return runStep({
    ws, channel,
    command: 'create_rectangle',
    params: { rectangle: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_rectangle (${name})`
  });
}

/**
 * Apply a single effect to a node (not batch).
 * @param {string} nodeId
 * @param {Array<Object>} effects
 * @param {string} label
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function apply_effect(nodeId, effects, label) {
  return runStep({
    ws, channel,
    command: 'set_effect',
    params: {
      nodeId,
      effects
    },
    assert: (response) => {
      // Accept any response with nodeId present
      const ok = response && response.nodeId === nodeId;
      return { pass: ok, response };
    },
    label
  });
}

// --- Rectangle + Effect Functions ---

/**
 * Create a red rectangle and apply drop shadow.
 */
export async function addRedRectWithDropShadow(frameId, results) {
  const red = { r: 1, g: 0, b: 0, a: 1 };
  const rectResult = await create_rectangle_with_color(frameId, "RedRect", red);
  results.push(rectResult);
  const rectId = rectResult.response?.ids?.[0];
  if (!rectId) {
    results.push({ label: "RedRect creation failed", pass: false, reason: "No rectId returned", response: rectResult.response });
    return;
  }
  // Apply drop shadow (singular)
  results.push(await apply_effect(rectId, [
    {
      type: "DROP_SHADOW",
      color: "#000000",
      offset: { x: 0, y: 2 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
      opacity: 0.5,
      name: "Drop Shadow"
    }
  ], "Apply drop shadow to RedRect"));
}

/**
 * Create a green rectangle and apply inner shadow.
 */
export async function addGreenRectWithInnerShadow(frameId, results) {
  const green = { r: 0, g: 1, b: 0, a: 1 };
  const rectResult = await create_rectangle_with_color(frameId, "GreenRect", green);
  results.push(rectResult);
  const rectId = rectResult.response?.ids?.[0];
  if (!rectId) {
    results.push({ label: "GreenRect creation failed", pass: false, reason: "No rectId returned", response: rectResult.response });
    return;
  }
  // Apply inner shadow (singular)
  results.push(await apply_effect(rectId, [
    {
      type: "INNER_SHADOW",
      color: "#333333",
      offset: { x: 0, y: -2 },
      radius: 3,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
      opacity: 0.3,
      name: "Inner Shadow"
    }
  ], "Apply inner shadow to GreenRect"));
}

/**
 * Create a blue rectangle and apply background blur.
 */
export async function addBlueRectWithBackgroundBlur(frameId, results) {
  const blue = { r: 0, g: 0, b: 1, a: 1 };
  const rectResult = await create_rectangle_with_color(frameId, "BlueRect", blue);
  results.push(rectResult);
  const rectId = rectResult.response?.ids?.[0];
  if (!rectId) {
    results.push({ label: "BlueRect creation failed", pass: false, reason: "No rectId returned", response: rectResult.response });
    return;
  }
  // Apply background blur (singular)
  results.push(await apply_effect(rectId, [
    {
      type: "BACKGROUND_BLUR",
      radius: 6,
      visible: true,
      blendMode: "NORMAL",
      name: "Background Blur"
    }
  ], "Apply background blur to BlueRect"));
}

// --- Main Test Entrypoint ---

export async function effectScene(results) {
  // 1. Create frame
  const frameResult = await create_frame();
  results.push(frameResult);
  const frameId = frameResult.response?.ids?.[0];
  if (!frameId) {
    results.push({ label: "Frame creation failed", pass: false, reason: "No frameId returned", response: frameResult.response });
    return;
  }

  // 2. Apply autolayout
  results.push(await apply_autolayout(frameId));

  // 3. Add rectangles with effects (only one active at a time)
  await addRedRectWithDropShadow(frameId, results);
  // await addGreenRectWithInnerShadow(frameId, results);
  // await addBlueRectWithBackgroundBlur(frameId, results);
}
