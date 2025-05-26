import { channel, runStep, ws } from "../test-runner.js";

/**
 * Helper to apply autolayout to a frame with horizontal flow, wrapping, and specific gaps and padding.
 * @param {string} frameId
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function apply_autolayout(frameId) {
  const params = {
    layout: {
      nodeId: frameId,
      mode: "HORIZONTAL",
      itemSpacing: 20,
      counterAxisSpacing: 30,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 15,
      paddingBottom: 15,
      primaryAxisSizing: "FIXED",
      layoutWrap: "WRAP"
    }
  };
  return runStep({
    ws,
    channel,
    command: "set_auto_layout",
    params: params,
    assert: (response) => ({
      pass:
        response &&
        response["0"] &&
        response["0"].success === true &&
        response["0"].nodeId === frameId,
      response
    }),
    label: `apply_autolayout to frame ${frameId}`
  });
}

/**
 * Helper to create a frame for SVGs.
 * @param {number} y - Y position for the frame
 * @param {string} name - Frame name
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_svg_frame(y, name) {
  const params = {
    x: 50,
    y,
    width: 400,
    height: 120,
    name,
    fillColor: { r: 0.98, g: 0.98, b: 0.98, a: 1 },
    strokeColor: { r: 0.8, g: 0.8, b: 0.8, a: 1 },
    strokeWeight: 1
  };
  return runStep({
    ws,
    channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: `create_svg_frame (${name})`
  });
}

/**
 * Helper to fetch SVG text from a URL.
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetch_svg(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch SVG: ${url}`);
  return await res.text();
}

/**
 * Helper to inject fill color into SVG markup.
 * @param {string} svgText
 * @param {string} fillColor - CSS color string (e.g. "#ff0000" or "rgb(255,0,0)")
 * @returns {string}
 */
function inject_fill(svgText, fillColor) {
  let replaced = svgText.replace(/fill="[^"]*"/gi, `fill="${fillColor}"`);
  replaced = replaced.replace(/<svg([^>]*)>/i, (m, attrs) => {
    if (/fill=/.test(attrs)) return `<svg${attrs}>`;
    return `<svg${attrs} fill="${fillColor}">`;
  });
  replaced = replaced.replace(/<path([^>]*)>/gi, (m, attrs) => {
    if (/fill=/.test(attrs)) return `<path${attrs}>`;
    return `<path${attrs} fill="${fillColor}">`;
  });
  return replaced;
}

/**
 * Helper to create an SVG node from raw SVG markup.
 * @param {string} parentId
 * @param {string} svgText
 * @param {string} name
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_svg_from_raw(parentId, svgText, name) {
  let svgWithSize = svgText.replace(
    /<svg([^>]*)>/i,
    (m, attrs) => {
      let newAttrs = attrs
        .replace(/\swidth="[^"]*"/i, "")
        .replace(/\sheight="[^"]*"/i, "");
      return `<svg${newAttrs} width="50" height="50">`;
    }
  );
  const params = {
    svg: {
      svg: svgWithSize,
      x: 0,
      y: 0,
      name,
      parentId
    }
  };
  return runStep({
    ws,
    channel,
    command: "set_svg_vector",
    params,
    assert: (response) => {
      const ids = Array.isArray(response.ids) ? response.ids : response.nodeIds;
      const ok = Array.isArray(ids) && ids.length > 0;
      return {
        pass: ok,
        reason: ok ? undefined : `Expected non-empty ids, got ${ids}`,
        response
      };
    },
    label: `create_svg_from_raw (${name})`
  });
}

// Color definitions
const COLORS = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
  orange: "#ff8000",
  purple: "#800080",
  pink: "#ff0080"
};

// --- Frame IDs (to be created once and reused) ---
let frame1Id = null;
let frame2Id = null;

// --- Logo SVGs (Apple, Instagram, GitHub) ---
export async function createLogoSVG1(results) {
  if (!frame1Id) {
    const frame1 = await create_svg_frame(100, "SVG Frame 1");
    results.push(frame1);
    frame1Id = frame1.response?.ids?.[0];
  }
  const url = "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg";
  const name = "Apple Logo";
  const color = COLORS.red;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    results.push({ label: `fetch_svg (${name})`, pass: false, reason: e.message, response: null });
    return;
  }
  const coloredSvg = inject_fill(svgText, color);
  results.push(await create_svg_from_raw(frame1Id, coloredSvg, name));
}

export async function createLogoSVG2(results) {
  if (!frame1Id) {
    const frame1 = await create_svg_frame(100, "SVG Frame 1");
    results.push(frame1);
    frame1Id = frame1.response?.ids?.[0];
  }
  const url = "https://simpleicons.org/icons/instagram.svg";
  const name = "Instagram Logo";
  const color = COLORS.green;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    results.push({ label: `fetch_svg (${name})`, pass: false, reason: e.message, response: null });
    return;
  }
  const coloredSvg = inject_fill(svgText, color);
  results.push(await create_svg_from_raw(frame1Id, coloredSvg, name));
}

export async function createLogoSVG3(results) {
  if (!frame1Id) {
    const frame1 = await create_svg_frame(100, "SVG Frame 1");
    results.push(frame1);
    frame1Id = frame1.response?.ids?.[0];
  }
  const url = "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg";
  const name = "GitHub Logo";
  const color = COLORS.blue;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    results.push({ label: `fetch_svg (${name})`, pass: false, reason: e.message, response: null });
    return;
  }
  const coloredSvg = inject_fill(svgText, color);
  results.push(await create_svg_from_raw(frame1Id, coloredSvg, name));
}

export async function finalizeLogoFrame(results) {
  if (frame1Id) {
    results.push(await apply_autolayout(frame1Id));
  }
}

// --- Icon SVGs (Airplay, Alert Circle, Anchor) ---
export async function createIconSVG1(results) {
  if (!frame2Id) {
    const frame2 = await create_svg_frame(240, "SVG Frame 2");
    results.push(frame2);
    frame2Id = frame2.response?.ids?.[0];
  }
  const url = "https://raw.githubusercontent.com/feathericons/feather/master/icons/airplay.svg";
  const name = "Airplay";
  const color = COLORS.orange;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    results.push({ label: `fetch_svg (${name})`, pass: false, reason: e.message, response: null });
    return;
  }
  const coloredSvg = inject_fill(svgText, color);
  results.push(await create_svg_from_raw(frame2Id, coloredSvg, name));
}

export async function createIconSVG2(results) {
  if (!frame2Id) {
    const frame2 = await create_svg_frame(240, "SVG Frame 2");
    results.push(frame2);
    frame2Id = frame2.response?.ids?.[0];
  }
  const url = "https://raw.githubusercontent.com/feathericons/feather/master/icons/alert-circle.svg";
  const name = "Alert Circle";
  const color = COLORS.purple;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    results.push({ label: `fetch_svg (${name})`, pass: false, reason: e.message, response: null });
    return;
  }
  const coloredSvg = inject_fill(svgText, color);
  results.push(await create_svg_from_raw(frame2Id, coloredSvg, name));
}

export async function createIconSVG3(results) {
  if (!frame2Id) {
    const frame2 = await create_svg_frame(240, "SVG Frame 2");
    results.push(frame2);
    frame2Id = frame2.response?.ids?.[0];
  }
  const url = "https://raw.githubusercontent.com/feathericons/feather/master/icons/anchor.svg";
  const name = "Anchor";
  const color = COLORS.pink;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    results.push({ label: `fetch_svg (${name})`, pass: false, reason: e.message, response: null });
    return;
  }
  const coloredSvg = inject_fill(svgText, color);
  results.push(await create_svg_from_raw(frame2Id, coloredSvg, name));
}

export async function finalizeIconFrame(results) {
  if (frame2Id) {
    results.push(await apply_autolayout(frame2Id));
  }
}

/**
 * Main test function for SVG scene.
 * Comment out any calls below to toggle creation of individual SVGs for debugging.
 * @param {Array} results
 */
export async function svgScene(results) {
  await createLogoSVG1(results);
  await createLogoSVG2(results);
  await createLogoSVG3(results);
  await finalizeLogoFrame(results);

  await createIconSVG1(results);
  await createIconSVG2(results);
  await createIconSVG3(results);
  await finalizeIconFrame(results);
}
