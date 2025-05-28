import { channel, runStep, ws } from "../test-runner.js";
import { randomColor } from "../helper.js";

/**
 * Predefined web colors for ellipses (converted to RGB objects).
 */
const webColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"
];

/**
 * Convert hex color to RGB object (like in shape-scene.js).
 * @param {string} hex
 * @returns {{r:number, g:number, b:number, a:number}}
 */
function webColorToRgb(hex) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const num = parseInt(c, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
    a: 1
  };
}

/**
 * Helper to create the parent container frame.
 * @returns {Promise}
 */
function create_parent_frame() {
  const params = {
    x: 20, y: 50,
    width: 800, // Initial width, will be hugged
    height: 300, // Initial height, will be hugged
    name: "Layout Container",
    fillColor: { r: 0.95, g: 0.95, b: 0.95, a: 1 }, // Light gray background
    strokeColor: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
    strokeWeight: 2
  };
  return runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: "create_parent_frame (Layout Container)"
  });
}

/**
 * Helper to apply auto layout to the parent frame.
 * @param {string} frameId
 * @returns {Promise}
 */
function apply_parent_autolayout(frameId) {
  const params = {
    layout: {
      nodeId: frameId,
      mode: "HORIZONTAL",
      itemSpacing: 20, // gap between child frames
      paddingLeft: 30,
      paddingRight: 30,
      paddingTop: 30,
      paddingBottom: 30,
      layoutWrap: "NO_WRAP", // No wrapping
      primaryAxisSizing: "AUTO",   // width: hug content
      counterAxisSizing: "AUTO"    // height: hug content
    }
  };
  return runStep({
    ws, channel,
    command: "set_auto_layout",
    params,
    assert: (response) => {
      const res = Array.isArray(response) ? response[0] : response;
      return { pass: res && res.success === true && res.nodeId === frameId, response };
    },
    label: `apply_parent_autolayout to frame ${frameId} (horizontal, no wrap, hug both)`
  });
}

/**
 * Helper to create a frame for a given layout type.
 * @param {"3x2"|"2x3"|"1x6"} layoutType
 * @param {string} parentId - ID of the parent frame
 * @returns {Promise}
 */
function create_layout_frame(layoutType, parentId) {
  let width, name;
  switch (layoutType) {
    case "3x2":
      width = 210;
      name = "Grid 3x2";
      break;
    case "2x3":
      width = 150;
      name = "iPad 2x3";
      break;
    case "1x6":
      width = 90;
      name = "Mobile 1x6";
      break;
    default:
      width = 210;
      name = "Grid 3x2";
  }
  const params = {
    x: 0, y: 0, // Position will be handled by parent's auto layout
    width, height: 200,
    name,
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1,
    parentId // Add to parent frame
  };
  return runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_layout_frame (${name}, width: ${width})`
  });
}

/**
 * Helper to apply auto layout to a child frame.
 * @param {string} frameId
 * @returns {Promise}
 */
function apply_layout_autolayout(frameId) {
  const params = {
    layout: {
      nodeId: frameId,
      mode: "HORIZONTAL",
      itemSpacing: 10, // gap between items
      counterAxisSpacing: 20, // vertical gap between rows
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 20,
      paddingBottom: 20,
      layoutWrap: "WRAP",
      primaryAxisSizing: "FIXED",   // width
      counterAxisSizing: "AUTO"     // height: hug
    }
  };
  return runStep({
    ws, channel,
    command: "set_auto_layout",
    params,
    assert: (response) => {
      const res = Array.isArray(response) ? response[0] : response;
      return { pass: res && res.success === true && res.nodeId === frameId, response };
    },
    label: `apply_layout_autolayout to frame ${frameId} (unified)`
  });
}

/**
 * Helper to create a 50x50 ellipse with a given color in a frame.
 * @param {string} parentId
 * @param {{r:number,g:number,b:number,a:number}} fillColor
 * @returns {Promise}
 */
function create_ellipse(parentId, fillColor) {
  const params = {
    x: 0, y: 0,
    width: 50, height: 50,
    name: "GridEllipse",
    fillColor,
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 4) + 1,
    parentId
  };
  return runStep({
    ws, channel,
    command: "create_ellipse",
    params: { ellipse: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_ellipse (color: rgb(${Math.round(fillColor.r*255)},${Math.round(fillColor.g*255)},${Math.round(fillColor.b*255)}))`
  });
}

/**
 * Create 6 ellipses in the frame, each with a different web color.
 * @param {string} frameId
 * @param {Array} results
 */
async function create_ellipses_in_frame(frameId, results) {
  const colors = webColors.map(webColorToRgb);
  for (let i = 0; i < 6; i++) {
    const ellipse = await create_ellipse(frameId, colors[i]);
    results.push(ellipse);
  }
}

/**
 * Main test function for layout scene.
 * @param {Array} results
 */
export async function layoutScene(results) {
  // 1. Create parent container frame
  const parentFrameResult = await create_parent_frame();
  results.push(parentFrameResult);
  const parentFrameId = parentFrameResult.response?.ids?.[0];

  if (!parentFrameId) {
    results.push({ label: "parent frame creation failed", pass: false, reason: "No parentFrameId" });
    return;
  }

  // 2. Apply auto layout to parent frame
  const parentAutoLayoutResult = await apply_parent_autolayout(parentFrameId);
  results.push(parentAutoLayoutResult);

  // 3. Create child frames with layouts: 3x2, 2x3, 1x6
  const layouts = ["3x2", "2x3", "1x6"];
  for (const layoutType of layouts) {
    // Create frame as child of parent
    const frameResult = await create_layout_frame(layoutType, parentFrameId);
    results.push(frameResult);
    const frameId = frameResult.response?.ids?.[0];

    if (!frameId) {
      results.push({ label: `frame creation failed for ${layoutType}`, pass: false, reason: "No frameId" });
      continue;
    }

    // Apply auto layout to child frame
    const autoLayoutResult = await apply_layout_autolayout(frameId);
    results.push(autoLayoutResult);

    // Create 6 ellipses with web colors in child frame
    await create_ellipses_in_frame(frameId, results);
  }
}
