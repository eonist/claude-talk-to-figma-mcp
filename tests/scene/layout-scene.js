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
  // Manual conversion from hex to RGB object
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
 * Helper to create a frame for a given layout type.
 * @param {"3x2"|"2x3"|"1x6"} layoutType
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_layout_frame(layoutType) {
  // Width calculations per feedback:
  // 3x2: (3 × 50) + (2 × 10) + (2 × 20) = 210px
  // 2x3: (2 × 50) + (1 × 10) + (2 × 20) = 150px
  // 1x6: (1 × 50) + (0 × 10) + (2 × 20) = 90px
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
    x: 50, y: 100, width, height: 200,
    name,
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
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
 * Helper to apply auto layout to a frame.
 * @param {string} frameId
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function apply_layout_autolayout(frameId) {
  const params = {
    layout: {
      nodeId: frameId,
      mode: "HORIZONTAL",
      itemSpacing: 10, // gap between items
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
      // Accept array of results, check for success and nodeId
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
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
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
  // Use 6 web colors, convert to RGB
  const colors = webColors.map(webColorToRgb);
  // Create 6 ellipses directly, each with its own color
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
  // Layouts: 3x2, 2x3, 1x6
  const layouts = ["3x2", "2x3", "1x6"/**/];
  for (const layoutType of layouts) {
    // 1. Create frame
    const frameResult = await create_layout_frame(layoutType);
    results.push(frameResult);
    const frameId = frameResult.response?.ids?.[0];
    if (!frameId) {
      results.push({ label: `frame creation failed for ${layoutType}`, pass: false, reason: "No frameId" });
      continue;
    }
    // 2. Apply auto layout
    const autoLayoutResult = await apply_layout_autolayout(frameId);
    results.push(autoLayoutResult);
    // 3. Create 6 ellipses with web colors
    await create_ellipses_in_frame(frameId, results);
  }
}
