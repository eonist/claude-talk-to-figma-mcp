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
  console.log(" 💥 Created rectangle with ID:", rectId, "Result:", rectResult);
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
  console.log("💥 Applied drop shadow to rectangle. Result:", effectResult);

  // 3. Convert rectangle to frame (should copy effects)
  const convertResult = await runStep({
    ws, channel,
    command: "convert_rectangle_to_frame",
    params: { nodeId: rectId },
    assert: r => r && r.id,
    label: "Convert rectangle to frame"
  });
  console.log("💥 Convert rectangle to frame result (full):", JSON.stringify(convertResult, null, 2));
  console.log("💥 convertResult.respons", convertResult.reason);
  console.log("💥 convertResult", convertResult);
  const frameId = convertResult.response?.id;
  console.log("💥 Converted rectangle to frame. New frame ID:", frameId);
  if (!frameId) {
    console.error("🚫 convert_rectangle_to_frame failed. Response:", convertResult);
    return { ...rectResult, effectResult, convertResult };
  }
 
  // 4. Apply auto layout to the frame
  const autoLayoutParams = {
    layout: {
      nodeId: frameId,
      mode: "HORIZONTAL",
      layoutWrap: "WRAP",
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      primaryAxisSizing: "FIXED",
      counterAxisSizing: "FIXED"
    }
  };
  const autoLayoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: autoLayoutParams,
    assert: r => r && r["0"] && r["0"].success === true && r["0"].nodeId === frameId,
    label: "Set auto layout on NeonGreenFrame"
  });
  console.log("💥 Set auto layout on green frame. Result:", autoLayoutResult);

  // 5. Create header inside the green frame
  const headerResult = await create_header(frameId);
  console.log("💥 Header creation result:", headerResult);

  // Return all results for reporting
  return {
    ...rectResult,
    effectResult,
    convertResult,
    autoLayoutResult,
    headerResult
  };
}

/**
 * Creates a header frame inside the given parent frame.
 * The header stretches to 100% width, has fixed height 32px, gray background, and horizontal auto layout.
 * @param {string} parentId - The parent frame ID (neon green frame)
 * @returns {Promise} Test result with header creation status
 */
async function create_header(parentId) {
  // 1. Create the header frame
  const params = {
    x: 0, y: 0,
    width: 100, // will be stretched to fill parent
    height: 32,
    name: "Header",
    fillColor: { r: 0.5, g: 0.5, b: 0.5, a: 1 }, // gray
    parentId
  };
  const headerResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "create_header"
  });
  const headerId = headerResult.response?.ids?.[0];
  console.log("Created header frame with ID:", headerId, "Result:", headerResult);
  if (!headerId) return headerResult;

  // No need to move or insert header; parentId is set at creation

  // 2. Set auto layout on the header: horizontal, no wrap
  const autoLayoutParams = {
    layout: {
      nodeId: headerId,
      mode: "HORIZONTAL",
      layoutWrap: "NO_WRAP"
    }
  };
  const autoLayoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: autoLayoutParams,
    assert: r => r && r["0"] && r["0"].success === true && r["0"].nodeId === headerId,
    label: "Set auto layout on header"
  });

  // 3. Set auto layout resizing: fill horizontally for the header frame itself
  const headerResizingResult = await runStep({
    ws, channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: headerId,
      axis: "horizontal",
      mode: "FILL"
    },
    assert: r => r && r.nodeId === headerId,
    label: "Set header frame to fill parent width"
  });

  // 4. Create the "Cash" text node
  const cashTextResult = await create_header_cash_text(headerId);

  // Return all results for reporting
  return {
    ...headerResult,
    autoLayoutResult,
    headerResizingResult,
    cashTextResult
  };
}

/**
 * Creates the "Cash" text node in the header frame.
 * @param {string} parentId - The header frame ID
 * @returns {Promise} Test result with text creation status
 */
async function create_header_cash_text(parentId) {
  // 1. Create the text node
  const params = {
    x: 0, y: 0,
    text: "Cash",
    fontSize: 16,
    fontWeight: 700,
    fontColor: { r: 0, g: 0, b: 0, a: 0.4 },
    parentId
  };
  const textResult = await runStep({
    ws, channel,
    command: "set_text",
    params: { text: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "create_header_cash_text"
  });
  const textId = textResult.response?.ids?.[0];
  if (!textId) return textResult;

  // 2. Set auto layout resizing: fill horizontally
  const resizingResult = await runStep({
    ws, channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: textId,
      axis: "horizontal",
      mode: "FILL"
    },
    assert: r => r && r.nodeId === textId,
    label: "Set cash text to fill header"
  });

  return {
    ...textResult,
    resizingResult
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

  // const headerResult = await create_header(frameId);
   //results.push(headerResult);
}
