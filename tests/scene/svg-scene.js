import { channel, runStep, ws } from "../test-runner.js";

/**
 * Applies horizontal auto-layout to a frame with wrapping and consistent spacing.
 * Configures padding, gaps, and sizing behavior for optimal SVG arrangement.
 * @param {string} frameId - The Figma frame ID to apply auto-layout to
 * @returns {Promise} Test result object
 * @example
 * const result = await apply_autolayout('frame123');
 * if (result.pass) console.log('Auto-layout applied successfully');
 */
async function apply_autolayout(frameId) {
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
      primaryAxisSizing: "AUTO",
      counterAxisSizing: "AUTO",
      layoutWrap: "WRAP"
    }
  };
  await runStep({
    ws,
    channel,
    command: "set_auto_layout",
    params: params,
    assert: (response) =>
      response &&
      response["0"] &&
      response["0"].success === true &&
      response["0"].nodeId === frameId,
    label: `apply_autolayout to frame ${frameId}`
  });
}

/**
 * Creates the main parent container frame for SVGs with vertical flow.
 * @param {string} [parentId] - Optional parent frame ID
 * @returns {Promise<string>} The container frame ID
 * @example
 * const containerId = await create_main_container('parent123');
 */
async function create_main_container(parentId) {
  const params = {
    x: 30,
    y: 50,
    width: 500, // Initial width, will be hugged
    height: 400, // Initial height, will be hugged
    name: "SVG Container",
    fillColor: { r: 0.96, g: 0.96, b: 0.96, a: 1 }, // Light gray background
    strokeColor: { r: 0.7, g: 0.7, b: 0.7, a: 1 },
    strokeWeight: 2,
    ...(parentId && { parentId })
  };
  const res = await runStep({
    ws,
    channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => Array.isArray(response.ids) && response.ids.length > 0,
    label: "create_main_container (SVG Container)"
  });
  const frameId = res.response?.ids?.[0];
  if (frameId) {
    await apply_main_container_autolayout(frameId);
  }
  return frameId;
}

/**
 * Applies vertical auto-layout to the main SVG container frame.
 * @param {string} frameId - The Figma frame ID to apply auto-layout to
 * @returns {Promise} Test result object
 * @example
 * const result = await apply_main_container_autolayout('frame123');
 */
async function apply_main_container_autolayout(frameId) {
  const params = {
    layout: {
      nodeId: frameId,
      mode: "VERTICAL", // Vertical flow
      itemSpacing: 25, // Gap between child frames
      paddingLeft: 25,
      paddingRight: 25,
      paddingTop: 25,
      paddingBottom: 25,
      primaryAxisSizing: "AUTO",   // height: hug content
      counterAxisSizing: "AUTO"    // width: hug content
    }
  };
  await runStep({
    ws,
    channel,
    command: "set_auto_layout",
    params: params,
    assert: (response) =>
      response &&
      response["0"] &&
      response["0"].success === true &&
      response["0"].nodeId === frameId,
    label: `apply_main_container_autolayout to frame ${frameId} (vertical, hug both)`
  });
}

/**
 * Creates a frame for SVGs and immediately applies auto-layout.
 * @param {number|string} yOrParentId - Y position (number) or parent frame ID (string)
 * @param {string} name - Frame name
 * @returns {Promise<string>} The created frame ID
 * @example
 * const frameId = await create_svg_frame(100, 'SVG Frame 1');
 */
async function create_svg_frame(yOrParentId, name) {
  let params;
  if (typeof yOrParentId === "string") {
    // If parentId is provided, use it and set x/y to 0
    params = {
      x: 0,
      y: 0,
      width: 400,
      height: 120,
      name,
      fillColor: { r: 0.98, g: 0.98, b: 0.98, a: 1 },
      strokeColor: { r: 0.8, g: 0.8, b: 0.8, a: 1 },
      strokeWeight: 1,
      parentId: yOrParentId
    };
  } else {
    // Fallback to original behavior (absolute y)
    params = {
      x: 50,
      y: yOrParentId,
      width: 400,
      height: 120,
      name,
      fillColor: { r: 0.98, g: 0.98, b: 0.98, a: 1 },
      strokeColor: { r: 0.8, g: 0.8, b: 0.8, a: 1 },
      strokeWeight: 1
    };
  }
  const res = await runStep({
    ws,
    channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => Array.isArray(response.ids) && response.ids.length > 0,
    label: `create_svg_frame (${name})`
  });
  const frameId = res.response?.ids?.[0];
  if (frameId) {
    await apply_autolayout(frameId);
  }
  return frameId;
}

/**
 * Fetches SVG content from a remote URL and returns it as text.
 * Handles network errors and validates response status.
 * @param {string} url - The URL to fetch SVG content from
 * @returns {Promise<string>} The SVG markup as a string
 * @throws {Error} When the fetch request fails or returns non-OK status
 * @example
 * const svgContent = await fetch_svg('https://example.com/icon.svg');
 */
async function fetch_svg(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch SVG: ${url}`);
  return await res.text();
}

/**
 * Helper to scale stroke weight for all children recursively
 * @param {object} nodeInfo - Node info response
 * @param {number} scale - Scale factor to apply
 */
async function scale_stroke_weights(nodeInfo, scale) {
  if (nodeInfo.document && nodeInfo.document.children) {
    for (const child of nodeInfo.document.children) {
      // If child has stroke weight, scale it
      if (child.strokeWeight && child.strokeWeight > 0) {
        const originalWeight = child.strokeWeight;
        const newWeight = Math.max(0.1, originalWeight * scale); // Minimum 0.1
        console.log(`Scaling stroke weight for ${child.id}: ${originalWeight} → ${newWeight.toFixed(2)}`);
        
        await runStep({
          ws,
          channel,
          command: "set_fill_and_stroke",
          params: {
            nodeId: child.id,
            strokeWeight: newWeight
          },
          assert: (response) => true,
          label: `scale_stroke_weight (${child.id})`
        });
      }
      
      // Recursively handle grandchildren
      if (child.children && child.children.length > 0) {
        await scale_stroke_weights({ document: child }, scale);
      }
    }
  }
}

// Helper to create an SVG node from raw SVG markup and return its nodeId (tests raw SVG support)
async function create_svg_from_raw(parentId, svgText, name, targetSize = 50) {
  const res = await runStep({
    ws,
    channel,
    command: "set_svg_vector",
    params: {
      svg: {
        svg: svgText,
        x: 0,
        y: 0,
        name,
        parentId
      }
    },
    assert: (response) => {
      const ids = Array.isArray(response.ids) ? response.ids : response.nodeIds;
      return Array.isArray(ids) && ids.length > 0;
    },
    label: `create_svg_from_raw (${name})`
  });
  // Get the nodeId of the created SVG node
  const ids = Array.isArray(res.response?.ids) ? res.response.ids : res.response?.nodeIds;
  const nodeId = ids && ids.length > 0 ? ids[0] : null;
  if (nodeId) {
    // Get current node dimensions to calculate proper aspect ratio
    const nodeInfoRes = await runStep({
      ws,
      channel,
      command: "get_node_info",
      params: { nodeId },
      assert: (response) => response && response.id === nodeId,
      label: `get_node_info for resize (${nodeId})`
    });
    
    const nodeInfo = nodeInfoRes.response;
    if (nodeInfo && nodeInfo.document && nodeInfo.document.absoluteBoundingBox) {
      const currentWidth = nodeInfo.document.absoluteBoundingBox.width;
      const currentHeight = nodeInfo.document.absoluteBoundingBox.height;
      
      console.log(`Original dimensions for ${name}: ${currentWidth}x${currentHeight}`);
      
      // Calculate scale to fit within targetSize x targetSize box without stretching
      const scale = Math.min(targetSize / currentWidth, targetSize / currentHeight);
      const newWidth = currentWidth * scale;
      const newHeight = currentHeight * scale;
      
      console.log(`Scale factor: ${scale.toFixed(3)}`);
      console.log(`New dimensions for ${name}: ${newWidth.toFixed(1)}x${newHeight.toFixed(1)}`);
      
      // Scale stroke weights BEFORE resizing (using original nodeInfo)
      await scale_stroke_weights(nodeInfo, scale);
      
      // Resize with proper aspect ratio
      await runStep({
        ws,
        channel,
        command: "resize_node",
        params: { nodeId, width: newWidth, height: newHeight },
        assert: (response) =>
          response &&
          response["0"] &&
          response["0"].success === true &&
          response["0"].nodeId === nodeId,
        label: `resize_svg_node (${name}) to ${newWidth.toFixed(1)}x${newHeight.toFixed(1)}`
      });
    } else {
      console.warn(`Could not get dimensions for ${name}, skipping resize`);
    }
  }
  return nodeId;
}

// Helper to create an SVG node from a URL (tests URL support)
async function create_svg_from_url(parentId, url, name, width = 50, height = 50) {
  const res = await runStep({
    ws,
    channel,
    command: "set_svg_vector",
    params: {
      svg: {
        svg: url, // Pass the URL as the 'svg' property
        x: 0,
        y: 0,
        name,
        parentId
      }
    },
    assert: (response) => {
      const ids = Array.isArray(response.ids) ? response.ids : response.nodeIds;
      return Array.isArray(ids) && ids.length > 0;
    },
    label: `create_svg_from_url (${name})`
  });
  // Get the nodeId of the created SVG node
  const ids = Array.isArray(res.response?.ids) ? res.response.ids : res.response?.nodeIds;
  const nodeId = ids && ids.length > 0 ? ids[0] : null;
  if (nodeId) {
    // Resize the node after creation using MCP
    await runStep({
      ws,
      channel,
      command: "resize_node",
      params: { nodeId, width, height },
      assert: (response) =>
        response &&
        response["0"] &&
        response["0"].success === true &&
        response["0"].nodeId === nodeId,
      label: `resize_svg_node (${name})`
    });
  }
  return nodeId;
}

/**
 * Intelligently applies fill and stroke colors to SVG child elements.
 * Only modifies existing fills/strokes, preserving the original SVG structure.
 * @param {string} nodeId - The SVG node ID to modify
 * @param {string} color - CSS hex color string (e.g., '#ff0000')
 * @example
 * await set_fill_color('svg123', '#ff0000'); // Apply red color
 */
async function set_fill_color(nodeId, color) {
  // Convert hex to Figma RGBA with alpha
  function hexToRgbaObj(hex) {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    const num = parseInt(c, 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255,
      a: 1
    };
  }
  const rgba = hexToRgbaObj(color);
  
  // Get node info to see the structure
  const nodeInfoRes = await runStep({
    ws,
    channel,
    command: "get_node_info",
    params: { nodeId },
    assert: (response) => response && response.id === nodeId,
    label: `get_node_info for fill (${nodeId})`
  });
  
  const nodeInfo = nodeInfoRes.response;
  console.log(`Node structure for ${nodeId}:`, JSON.stringify(nodeInfo, null, 2));
  
  // Apply smart fill/stroke ONLY to children (NOT to main node as specifically requested)
  if (nodeInfo && nodeInfo.document && nodeInfo.document.children && nodeInfo.document.children.length > 0) {
    console.log(`Found ${nodeInfo.document.children.length} children, checking for existing fills/strokes`);
    for (const child of nodeInfo.document.children) {
      const hasFill = child.fills && Array.isArray(child.fills) && child.fills.length > 0;
      const hasStroke = child.strokes && Array.isArray(child.strokes) && child.strokes.length > 0;
      
      console.log(`Child ${child.id} (${child.type}): hasFill=${hasFill}, hasStroke=${hasStroke}`);
      
      const params = { nodeId: child.id };
      
      // Only set fill if child already has a fill
      if (hasFill) {
        params.fillColor = rgba;
        console.log(`Replacing existing fill with ${color}`);
      } else {
        console.log(`No existing fill, skipping fill replacement`);
      }
      
      // Only set stroke if child already has a stroke
      if (hasStroke) {
        params.strokeColor = rgba;
        console.log(`Replacing existing stroke with ${color}`);
      } else {
        console.log(`No existing stroke, skipping stroke replacement`);
      }
      
      // Only make API call if we have something to update
      if (params.fillColor || params.strokeColor) {
        await runStep({
          ws,
          channel,
          command: "set_fill_and_stroke",
          params,
          assert: (response) => true,
          label: `smart_fill_stroke (${child.id})`
        });
      } else {
        console.log(`No fills or strokes to replace for ${child.id}`);
      }
    }
  } else {
    console.warn(`No children found for ${nodeId}, cannot apply fill/stroke`);
  }
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

// --- Logo SVGs (Apple, Instagram, GitHub) ---
export async function createLogoSVG1(frameId) {
  const url = "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg";
  const name = "Apple Logo";
  const color = COLORS.red;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    console.warn(`fetch_svg (${name}): ${e.message}`);
    return;
  }
  const nodeId = await create_svg_from_raw(frameId, svgText, name);
  if (nodeId) await set_fill_color(nodeId, color);
}

export async function createLogoSVG2(frameId) {
  const url = "https://simpleicons.org/icons/instagram.svg";
  const name = "Instagram Logo";
  const color = COLORS.green;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    console.warn(`fetch_svg (${name}): ${e.message}`);
    return;
  }
  const nodeId = await create_svg_from_raw(frameId, svgText, name);
  if (nodeId) await set_fill_color(nodeId, color);
}

export async function createLogoSVG3(frameId) {
  const url = "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg";
  const name = "GitHub Logo";
  const color = COLORS.blue;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    console.warn(`fetch_svg (${name}): ${e.message}`);
    return;
  }
  const nodeId = await create_svg_from_raw(frameId, svgText, name);
  if (nodeId) await set_fill_color(nodeId, color);
}

// --- Icon SVGs (Airplay, Alert Circle, Anchor) ---
export async function createIconSVG1(frameId) {
  const url = "https://raw.githubusercontent.com/feathericons/feather/master/icons/airplay.svg";
  const name = "Airplay";
  const color = COLORS.orange;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    console.warn(`fetch_svg (${name}): ${e.message}`);
    return;
  }
  const nodeId = await create_svg_from_raw(frameId, svgText, name);
  if (nodeId) await set_fill_color(nodeId, color);
}

export async function createIconSVG2(frameId) {
  const url = "https://raw.githubusercontent.com/feathericons/feather/master/icons/alert-circle.svg";
  const name = "Alert Circle";
  const color = COLORS.purple;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    console.warn(`fetch_svg (${name}): ${e.message}`);
    return;
  }
  const nodeId = await create_svg_from_raw(frameId, svgText, name);
  if (nodeId) await set_fill_color(nodeId, color);
}

export async function createIconSVG3(frameId) {
  const url = "https://raw.githubusercontent.com/feathericons/feather/master/icons/anchor.svg";
  const name = "Anchor";
  const color = COLORS.pink;
  let svgText;
  try {
    svgText = await fetch_svg(url);
  } catch (e) {
    console.warn(`fetch_svg (${name}): ${e.message}`);
    return;
  }
  const nodeId = await create_svg_from_raw(frameId, svgText, name);
  if (nodeId) await set_fill_color(nodeId, color);
}

/**
 * Main entry point for the SVG scene test.
 * Creates containers and populates with various SVG logos and icons.
 * @param {Array} results - Array to collect test results
 * @param {string} [parentFrameId] - Optional parent frame ID for scene organization
 * Comment out any calls below to toggle creation of individual SVGs for debugging.
 * @example
 * const results = [];
 * await svgScene(results, 'container123');
 */
export async function svgScene(results, parentFrameId) {
  // 1. Create main parent container with vertical flow as a child of the all-scenes container
  const mainContainerId = await create_main_container(parentFrameId);

  if (!mainContainerId) {
    console.error("Failed to create main container");
    return;
  }

  // 2. Create child frames as children of the main container
  const logoFrameId = await create_svg_frame(mainContainerId, "SVG Frame 1");
  const iconFrameId = await create_svg_frame(mainContainerId, "SVG Frame 2");

  // 3. Add logo SVGs to logo frame
  await createLogoSVG1(logoFrameId);
  await createLogoSVG2(logoFrameId);
  await createLogoSVG3(logoFrameId);

  // 4. Add icon SVGs to icon frame
  await createIconSVG1(iconFrameId);
  await createIconSVG2(iconFrameId);
  await createIconSVG3(iconFrameId);
}
