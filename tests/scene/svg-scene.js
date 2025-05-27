import { channel, runStep, ws } from "../test-runner.js";

/**
 * Helper to apply autolayout to a frame with horizontal flow, wrapping, and specific gaps and padding.
 * @param {string} frameId
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
      primaryAxisSizing: "FIXED",
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
 * Helper to create a frame for SVGs and immediately apply autolayout.
 * @param {number} y - Y position for the frame
 * @param {string} name - Frame name
 * @returns {Promise<string>} frameId
 */
async function create_svg_frame(y, name) {
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
 * Helper to fetch SVG text from a URL.
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetch_svg(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch SVG: ${url}`);
  return await res.text();
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
    // Get current node dimensions to maintain aspect ratio
    const nodeInfoRes = await runStep({
      ws,
      channel,
      command: "get_node_info",
      params: { nodeId },
      assert: (response) => response && response.id === nodeId,
      label: `get_node_info for resize (${nodeId})`
    });
    
    const nodeInfo = nodeInfoRes.response;
    if (nodeInfo && nodeInfo.width && nodeInfo.height) {
      const currentWidth = nodeInfo.width;
      const currentHeight = nodeInfo.height;
      const aspectRatio = currentWidth / currentHeight;
      
      // Calculate new dimensions to fit within targetSize x targetSize box
      let newWidth, newHeight;
      if (currentWidth > currentHeight) {
        // Wider than tall - scale width to targetSize
        newWidth = targetSize;
        newHeight = (currentHeight / currentWidth) * targetSize;
      } else {
        // Taller than wide - scale height to targetSize  
        newHeight = targetSize;
        newWidth = (currentWidth / currentHeight) * targetSize;
      }
      
      // Resize the node maintaining aspect ratio
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
 * Helper to set the fill color on a node's children recursively (for SVG groups).
 * @param {string} nodeId
 * @param {string} color - CSS color string (e.g. "#ff0000")
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
  
  // Recursive function to apply fill to all vector children
  async function applyFillRecursively(currentNodeId) {
    // Get node info to find children
    const nodeInfoRes = await runStep({
      ws,
      channel,
      command: "get_node_info",
      params: { nodeId: currentNodeId },
      assert: (response) => response && response.id === currentNodeId,
      label: `get_node_info for fill (${currentNodeId})`
    });
    
    const nodeInfo = nodeInfoRes.response;
    if (nodeInfo && nodeInfo.children && nodeInfo.children.length > 0) {
      // Apply fill to all direct children
      for (const child of nodeInfo.children) {
        // Apply fill to this child
        await runStep({
          ws,
          channel,
          command: "set_fill_and_stroke",
          params: {
            nodeId: child.id,
            fillColor: rgba
          },
          assert: (response) => true,
          label: `set_fill_color child (${child.id}) type:${child.type}`
        });
        
        // If child has children, recurse
        if (child.children && child.children.length > 0) {
          await applyFillRecursively(child.id);
        }
      }
    }
  }
  
  // Start recursive fill application
  await applyFillRecursively(nodeId);
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
  // Test SVG URL support
  const url = "https://simpleicons.org/icons/instagram.svg";
  const name = "Instagram Logo";
  const color = COLORS.green;
  const nodeId = await create_svg_from_url(frameId, url, name);
  if (nodeId) await set_fill_color(nodeId, color);
}

export async function createLogoSVG3(frameId) {
  // Test SVG URL support
  const url = "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg";
  const name = "GitHub Logo";
  const color = COLORS.blue;
  const nodeId = await create_svg_from_url(frameId, url, name);
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
 * Main test function for SVG scene.
 * Comment out any calls below to toggle creation of individual SVGs for debugging.
 */
export async function svgScene() {
  const logoFrameId = await create_svg_frame(100, "SVG Frame 1");
  //const iconFrameId = await create_svg_frame(240, "SVG Frame 2");

  // Add logo SVGs to logo frame
  await createLogoSVG1(logoFrameId);
  // await createLogoSVG2(logoFrameId);
  // await createLogoSVG3(logoFrameId);

  // Add icon SVGs to icon frame
  //await createIconSVG1(iconFrameId);
  // await createIconSVG2(iconFrameId);
  // await createIconSVG3(iconFrameId);
}
