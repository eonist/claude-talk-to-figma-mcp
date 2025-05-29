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
      mode: "VERTICAL",
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 15,
      paddingBottom: 15,
      itemSpacing: 15,
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
  console.log("💥 create_header called with parentId:", parentId);
  // 1. Create the header frame
  const params = {
    x: 0, y: 0,
    // width: 100, // remove width for FILL
    // height: 32, // remove height for HUG
    name: "Header",
    fillColor: { r: 1, g: 1, b: 1, a: 0 }, // gray
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
  console.log("💥 Created header frame with ID:", headerId, "Result:", headerResult);
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

  // 3. Set auto layout resizing: fill horizontally and hug vertically for the header frame itself
  console.log("💥 About to call set_auto_layout_resizing for header frame (FILL horizontal, AUTO vertical). NodeId:", headerId);
  const headerResizingResult = await runStep({
    ws, channel,
    command: "set_auto_layout_resizing",
    params: {
      nodeId: headerId,
      horizontal: "FILL",
      vertical: "AUTO"
    },
    assert: r => r && r.nodeId === headerId,
    label: "Set header frame to fill width and hug height"
  });
  console.log("💥 Set_auto_layout_resizing for header frame (FILL horizontal, AUTO vertical). NodeId:", headerId, "Result:", headerResizingResult);

  // 4. Create the "Cash" text node
  const cashTextResult = await create_header_cash_text(headerId);

  // 5. Create the "Amount" text node
  const amountTextResult = await create_header_amount_text(headerId);

  // 6. Create the "USD" capsule
  const usdCapsuleResult = await create_header_usd_capsule(headerId);

  // 7. Create the growth metrics section below the header
  const growthSectionResult = await create_growth_metrics_section(parentId);

  // 8. Create the "+38%" percentage text inside the growth section
  const growthPercentResult = growthSectionResult.sectionId
    ? await create_growth_percentage_text(growthSectionResult.sectionId)
    : null;

  // 9. Create the subtitle frame below the percentage text
  let subtitleResult = null, growthTextResult = null, arrowTextResult = null;
  if (growthSectionResult.sectionId) {
    subtitleResult = await create_subtitle_frame(growthSectionResult.sectionId);
    if (subtitleResult.subtitleId) {
      // 10. Create the growth text and arrow inside the subtitle frame
      growthTextResult = await create_growth_text(subtitleResult.subtitleId);
      arrowTextResult = await create_upward_arrow_text(subtitleResult.subtitleId);
    }
  }

  // Return all results for reporting
  return {
    ...headerResult,
    autoLayoutResult,
    headerResizingResult,
    cashTextResult,
    amountTextResult,
    usdCapsuleResult,
    growthSectionResult,
    growthPercentResult,
    subtitleResult,
    growthTextResult,
    arrowTextResult
  };
}

/**
 * Creates the subtitle frame below the percentage text.
 * @param {string} parentId - The growth metrics section frame ID
 * @returns {Promise<{subtitleId: string}|object>} Test result with subtitle frame creation status
 */
async function create_subtitle_frame(parentId) {
  console.log("💥 create_subtitle_frame called with parentId:", parentId);
  // 1. Create the subtitle frame
  const params = {
    x: 0, y: 0,
    name: "sub_title",
    fillColor: { r: 1, g: 1, b: 1, a: 0 }, // gray
    parentId
  };
  const subtitleResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "create_subtitle_frame"
  });
  const subtitleId = subtitleResult.response?.ids?.[0];
  console.log("Created subtitle frame with ID:", subtitleId, "Result:", subtitleResult);
  if (!subtitleId) return subtitleResult;

  // 2. Set horizontal auto layout, gap 4px, HUG both axes
  const subtitleLayoutParams = {
    layout: {
      nodeId: subtitleId,
      mode: "HORIZONTAL",
      layoutWrap: "NO_WRAP",
      itemSpacing: 4,
      primaryAxisSizing: "AUTO",
      counterAxisSizing: "AUTO"
    }
  };
  const subtitleLayoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: subtitleLayoutParams,
    assert: r => r && r["0"] && r["0"].success === true && r["0"].nodeId === subtitleId,
    label: "Set auto layout on subtitle frame"
  });

  return {
    ...subtitleResult,
    subtitleId,
    subtitleLayoutResult
  };
}

/**
 * Creates the "Growth since last day" text node in the subtitle frame.
 * @param {string} parentId - The subtitle frame ID
 * @returns {Promise} Test result with text creation status
 */
async function create_growth_text(parentId) {
  console.log("💥 create_growth_text called with parentId:", parentId);
  // 1. Create the text node
  const params = {
    x: 0, y: 0,
    text: "Growth since last day",
    fontSize: 8,
    fontWeight: 400,
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
    label: "create_growth_text"
  });
  const textId = textResult.response?.id;
  console.log("Created growth text with ID:", textId, "Result:", textResult);
  if (!textId) return textResult;

  // No need to set auto layout resizing: HUG is default for text nodes

  return textResult;
}

/**
 * Creates the up-right arrow text node in the subtitle frame.
 * @param {string} parentId - The subtitle frame ID
 * @returns {Promise} Test result with text creation status
 */
async function create_upward_arrow_text(parentId) {
  console.log("💥 create_upward_arrow_text called with parentId:", parentId);
  // 1. Create the text node
  const params = {
    x: 0, y: 0,
    text: "↗",
    fontSize: 8,
    fontWeight: 400,
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
    label: "create_upward_arrow_text"
  });
  const textId = textResult.response?.id;
  console.log("Created upward arrow text with ID:", textId, "Result:", textResult);
  if (!textId) return textResult;

  // No need to set auto layout resizing: HUG is default for text nodes

  return textResult;
}

/**
 * Creates the growth metrics section frame below the header.
 * @param {string} parentId - The green frame ID
 * @returns {Promise<{sectionId: string}|object>} Test result with section frame creation status
 */
async function create_growth_metrics_section(parentId) {
  console.log("💥 create_growth_metrics_section called with parentId:", parentId);
  // 1. Create the section frame
  const params = {
    x: 0, y: 0,
    // width: 10, // remove width for HUG
    height: 0, // HUG
    name: "Growth Metrics Section",
    fillColor: { r: 0.7, g: 0.7, b: 0.7, a: 0 }, // gray for debug
    parentId
  };
  const sectionResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "create_growth_metrics_section"
  });
  const sectionId = sectionResult.response?.ids?.[0];
  console.log("Created growth metrics section frame with ID:", sectionId, "Result:", sectionResult);
  if (!sectionId) return sectionResult;

  // 2. Set vertical auto layout, gap 10px, HUG both axes
  const sectionLayoutParams = {
    layout: {
      nodeId: sectionId,
      mode: "VERTICAL",
      layoutWrap: "NO_WRAP",
      itemSpacing: 10,
      primaryAxisSizing: "AUTO",
      counterAxisSizing: "AUTO",
      primaryAxisAlignItems: "MIN",
      counterAxisAlignItems: "MIN"
    }
  };
  const sectionLayoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: sectionLayoutParams,
    assert: r => r && r["0"] && r["0"].success === true && r["0"].nodeId === sectionId,
    label: "Set auto layout on growth metrics section"
  });

  return {
    ...sectionResult,
    sectionId,
    sectionLayoutResult
  };
}

/**
 * Creates the "+38%" percentage text node in the growth metrics section.
 * @param {string} parentId - The growth metrics section frame ID
 * @returns {Promise} Test result with text creation status
 */
async function create_growth_percentage_text(parentId) {
  console.log("💥 create_growth_percentage_text called with parentId:", parentId);
  // 1. Create the text node
  const params = {
    x: 0, y: 0,
    text: "+38%",
    fontSize: 28,
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
    label: "create_growth_percentage_text"
  });
  const textId = textResult.response?.id;
  console.log("Created growth percentage text with ID:", textId, "Result:", textResult);
  if (!textId) return textResult;

  // No need to set auto layout resizing: HUG is default for text nodes

  return textResult;
}

/**
 * Creates the "USD" capsule indicator in the header frame.
 * @param {string} parentId - The header frame ID
 * @returns {Promise} Test result with capsule creation status
 */
async function create_header_usd_capsule(parentId) {
  console.log("💥 create_header_usd_capsule called with parentId:", parentId);
  // 1. Create the capsule frame
  const capsuleParams = {
    x: 0, y: 0,
    width: 10, // will hug content
    //height: 24, // enough for 14px text + padding
    name: "USD Capsule",
    fillColor: { r: 0, g: 0, b: 0, a: 0.1 },
    cornerRadius: 16,
    parentId
  };
  const capsuleResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: capsuleParams },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "create_header_usd_capsule"
  });
  const capsuleId = capsuleResult.response?.ids?.[0];
  console.log("Created USD capsule frame with ID:", capsuleId, "Result:", capsuleResult);
  if (!capsuleId) return capsuleResult;

  // 2. Set auto layout on the capsule: horizontal, no wrap, center alignment, padding 4px
  const capsuleLayoutParams = {
    layout: {
      nodeId: capsuleId,
      mode: "HORIZONTAL",
      layoutWrap: "NO_WRAP",
      paddingLeft: 4,
      paddingRight: 4,
      paddingTop: 4,
      paddingBottom: 4,
      primaryAxisAlignItems: "CENTER",
      counterAxisAlignItems: "CENTER"
    }
  };
  const capsuleLayoutResult = await runStep({
    ws, channel,
    command: "set_auto_layout",
    params: capsuleLayoutParams,
    assert: r => r && r["0"] && r["0"].success === true && r["0"].nodeId === capsuleId,
    label: "Set auto layout on USD capsule"
  });

  // 3. Create the "USD" text node inside the capsule
  const usdTextParams = {
    x: 0, y: 0,
    text: "USD",
    fontSize: 12,
    fontWeight: 500,
    fontColor: { r: 0, g: 0, b: 0, a: 0.4 },
    opacity: 0.7,
    parentId: capsuleId
  };
  const usdTextResult = await runStep({
    ws, channel,
    command: "set_text",
    params: { text: usdTextParams },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "create_header_usd_text"
  });
  const usdTextId = usdTextResult.response?.id;
  console.log("Created USD text with ID:", usdTextId, "Result:", usdTextResult);
  if (!usdTextId) return { ...capsuleResult, capsuleLayoutResult, usdTextResult };

  // No need to set resizing: HUG is default for text nodes

  return {
    ...capsuleResult,
    capsuleLayoutResult,
    usdTextResult
  };
}

/**
 * Creates the "816,754" amount text node in the header frame.
 * @param {string} parentId - The header frame ID
 * @returns {Promise} Test result with text creation status
 */
async function create_header_amount_text(parentId) {
  console.log("💥 create_header_amount_text called with parentId:", parentId);
  // 1. Create the text node
  const params = {
    x: 0, y: 0,
    text: "816,754",
    fontSize: 24,
    fontWeight: 400,
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
    label: "create_header_amount_text"
  });
  const textId = textResult.response?.id;
  console.log("Created amount text with ID:", textId, "Result:", textResult);
  if (!textId) return textResult;

  // No need to set auto layout resizing: HUG is default for text nodes

  return textResult;
}

/**
 * Creates the "Cash" text node in the header frame.
 * @param {string} parentId - The header frame ID
 * @returns {Promise} Test result with text creation status
 */
async function create_header_cash_text(parentId) {
  console.log("💥 create_header_cash_text called with parentId:", parentId);
  // 1. Create the text node
  const params = {
    x: 0, y: 0,
    text: "Cash",
    fontSize: 12,
    fontWeight: 500,
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
  const textId = textResult.response?.id;
  console.log("Created cash text with ID:", textId, "Result:", textResult);
  if (!textId) return textResult;

  // 2. Set auto layout resizing: fill horizontally
  console.log("💥 About to call set_auto_layout_resizing for cash text. NodeId:", textId);
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
  console.log("💥 Set_auto_layout_resizing for cash text. NodeId:", textId, "Result:", resizingResult);

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
