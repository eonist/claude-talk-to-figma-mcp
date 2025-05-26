import { channel, runStep, ws } from "../test-runner.js";

/**
 * Toggle creation of logo SVGs (Apple, Instagram, GitHub) and direct SVGs (Airplay, Alert Circle, Anchor).
 * Set to false to skip creation for debugging.
 */
const ENABLE = {
  logos: true, // Apple, Instagram, GitHub
  svgs: true   // Airplay, Alert Circle, Anchor
};

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
      itemSpacing: 20,
      counterAxisSpacing: 30,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 15,
      paddingBottom: 15,
      primaryAxisSizing: 'FIXED',
      layoutWrap: 'WRAP'
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
 * Helper to create a frame for SVGs.
 * @param {number} y - Y position for the frame
 * @param {string} name - Frame name
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_svg_frame(y, name) {
  const params = {
    x: 50, y,
    width: 400, height: 120,
    name,
    fillColor: { r: 0.98, g: 0.98, b: 0.98, a: 1 },
    strokeColor: { r: 0.8, g: 0.8, b: 0.8, a: 1 },
    strokeWeight: 1
  };
  return runStep({
    ws, channel,
    command: 'create_frame',
    params: { frame: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_svg_frame (${name})`
  });
}

/**
 * Helper to fetch SVG text from a URL.
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetch_svg(url) {
  // Node.js fetch is available in modern environments
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
  // Replace any fill="..." or add fill to <svg> or <path> if missing
  // This is a simple approach; for robust handling, use an SVG parser.
  // 1. Try to replace fill on <svg> and <path>
  let replaced = svgText.replace(/fill="[^"]*"/gi, `fill="${fillColor}"`);
  // 2. If no fill attribute, add to <svg> and <path>
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
 * Helper to create an SVG node from a URL.
 * @param {string} parentId
 * @param {string} url
 * @param {string} name
 * @param {string} fillColor - CSS color string
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
async function create_svg_from_url(parentId, url, name, fillColor) {
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    return { label: `create_svg_from_url (${name})`, pass: false, reason: e.message, response: null };
  }
  const coloredSvg = inject_fill(svgText, fillColor);
  return create_svg_from_raw(parentId, coloredSvg, name);
}

/**
 * Helper to create an SVG node from raw SVG markup.
 * @param {string} parentId
 * @param {string} svgText
 * @param {string} name
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_svg_from_raw(parentId, svgText, name) {
  // Figma will auto-size, but we want to fit inside 50x50, so set width/height on SVG root
  let svgWithSize = svgText.replace(
    /<svg([^>]*)>/i,
    (m, attrs) => {
      // Remove width/height if present, then add width/height 50
      let newAttrs = attrs
        .replace(/\swidth="[^"]*"/i, "")
        .replace(/\sheight="[^"]*"/i, "");
      return `<svg${newAttrs} width="50" height="50">`;
    }
  );
  const params = {
    svg: {
      svg: svgWithSize,
      x: 0, y: 0,
      name,
      parentId
    }
  };
  return runStep({
    ws, channel,
    command: 'set_svg_vector',
    params,
    assert: (response) => {
      const ids = Array.isArray(response.ids) ? response.ids : response.nodeIds;
      const ok = Array.isArray(ids) && ids.length > 0;
      return { pass: ok, reason: ok ? undefined : `Expected non-empty ids, got ${ids}`, response };
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

// SVG URLs for logos
const LOGO_SVGS = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    name: "Apple Logo",
    color: COLORS.red
  },
  {
    url: "https://simpleicons.org/icons/instagram.svg",
    name: "Instagram Logo",
    color: COLORS.green
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    name: "GitHub Logo",
    color: COLORS.blue
  }
];

// Raw SVGs for feather icons
const RAW_SVGS = [
  {
    url: "https://raw.githubusercontent.com/feathericons/feather/master/icons/airplay.svg",
    name: "Airplay",
    color: COLORS.orange
  },
  {
    url: "https://raw.githubusercontent.com/feathericons/feather/master/icons/alert-circle.svg",
    name: "Alert Circle",
    color: COLORS.purple
  },
  {
    url: "https://raw.githubusercontent.com/feathericons/feather/master/icons/anchor.svg",
    name: "Anchor",
    color: COLORS.pink
  }
];

/**
 * Main test function for SVG scene.
 * @param {Array} results
 */
export async function svgScene(results) {
  // --- First frame: Logos from URLs ---
  let frame1Id = null;
  if (ENABLE.logos) {
    const frame1 = await create_svg_frame(100, "SVG Frame 1");
    results.push(frame1);
    frame1Id = frame1.response?.ids?.[0];
    if (frame1Id) {
      for (const { url, name, color } of LOGO_SVGS) {
        const res = await create_svg_from_url(frame1Id, url, name, color);
        results.push(res);
      }
      results.push(await apply_autolayout(frame1Id));
    }
  }

  // --- Second frame: Raw SVGs ---
  let frame2Id = null;
  if (ENABLE.svgs) {
    const frame2 = await create_svg_frame(240, "SVG Frame 2");
    results.push(frame2);
    frame2Id = frame2.response?.ids?.[0];
    if (frame2Id) {
      for (const { url, name, color } of RAW_SVGS) {
        let svgText;
        try {
          svgText = await fetch_svg(url);
        } catch (e) {
          results.push({ label: `fetch_svg (${name})`, pass: false, reason: e.message, response: null });
          continue;
        }
        const coloredSvg = inject_fill(svgText, color);
        const res = await create_svg_from_raw(frame2Id, coloredSvg, name);
        results.push(res);
      }
      results.push(await apply_autolayout(frame2Id));
    }
  }
}
