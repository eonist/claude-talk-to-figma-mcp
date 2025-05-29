import { channel, runStep, ws } from "../test-runner.js";

/**
 * Creates a frame with padding of 20 on all sides.
 * @param {string} [parentId] - Optional parent frame ID
 * @returns {Promise} Test result with frame creation status
 */
function create_padded_frame(parentId) {
  const params = {
    x: 60, y: 80, width: 600, height: 400,
    name: "Padded Frame",
    fillColor: { r: 0.15, g: 0.15, b: 0.15, a: 1 },
    ...(parentId && { parentId })
  };
  return runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: `create_padded_frame (${params.name})`
  }).then(async (frameResult) => {
    const frameId = frameResult.response?.ids?.[0];
    if (!frameId) return frameResult;
    // Set padding of 20 on all sides
    const layoutParams = {
      layout: {
        nodeId: frameId,
        mode: "VERTICAL",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
        paddingBottom: 20,
        itemSpacing: 0,
        primaryAxisSizing: "AUTO",
        counterAxisSizing: "AUTO"
      }
    };
    const layoutResult = await runStep({
      ws, channel,
      command: "set_auto_layout",
      params: layoutParams,
      assert: (response) => ({
        pass: response && response["0"] && response["0"].success === true && response["0"].nodeId === frameId,
        response
      }),
      label: `set_auto_layout padding 20 to frame ${frameId}`
    });
    // Attach layout result for reporting
    return {
      ...frameResult,
      layoutResult
    };
  });
}

/**
 * Creates a green rounded rectangle (400x300) with corner radius 24.
 * @param {string} parentId - Parent frame ID to place the rectangle inside
 * @returns {Promise} Test result with rectangle creation status
 */
async function create_green_rounded_rectangle(parentId) {
  const params = {
    x: 0, y: 0,
    width: 300, height: 220,
    name: "NeonGreenRectangle",
    cornerRadius: 20,
    fillColor: { r: 0.2235, g: 1, b: 0.0784, a: 1 }, // #39FF14
    parentId
  };
  // 1. Create the rectangle
  const rectResult = await runStep({
    ws, channel,
    command: "create_rectangle",
    params: { rectangle: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: `create_green_rounded_rectangle (${params.name})`
  });
  const rectId = rectResult.response?.ids?.[0];
  if (!rectId) return rectResult;

  // 2. Apply drop shadow effect to the rectangle
  const effectParams = [
    {
      type: "DROP_SHADOW",
      color: { r: 0.2235, g: 1, b: 0.0784, a: 0.5 }, // #39FF14, 50% opacity
      offset: { x: 0, y: 0 },
      radius: 15,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
      name: "Drop Shadow"
    }
  ];
  const effectResult = await runStep({
    ws, channel,
    command: "set_effect",
    params: {
      nodeId: rectId,
      effects: effectParams
    },
    assert: r => r && r.nodeId === rectId,
    label: "Apply drop shadow to NeonGreenRectangle"
  });

  // 3. Convert rectangle to frame (should copy effects)
  const convertResult = await runStep({
    ws, channel,
    command: "convert_rectangle_to_frame",
    params: { nodeId: rectId },
    assert: r => r && r.frameId,
    label: "Convert rectangle to frame"
  });
  const frameId = convertResult.response?.id;
  if (!frameId) return { ...rectResult, effectResult, convertResult };

  // Return all results for reporting
  return {
    ...rectResult,
    effectResult,
    convertResult
  };
}

/**
 * Main entry point for the layout-a test.
 * Creates a padded frame and a green rounded rectangle inside it.
 * @param {Array} results - Array to collect test results
 * @param {string} [parentFrameId] - Optional parent frame ID
 */
export async function layoutATest(results, parentFrameId) {
  // 1. Create the padded frame
  const frameResult = await create_padded_frame(parentFrameId);
  results.push(frameResult);

  // 2. Get the frame ID
  const frameId = frameResult.response?.ids?.[0];
  if (!frameId) {
    console.warn("Could not get frame ID for placing rectangle inside frame");
    return;
  }

  // 3. Create the green rounded rectangle inside the frame
  const rectResult = await create_green_rounded_rectangle(frameId);
  results.push(rectResult);
}
