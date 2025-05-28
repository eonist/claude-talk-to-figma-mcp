import { channel, runStep, ws } from "../test-runner.js";

/**
 * Applies horizontal auto-layout to a frame with wrapping and image-optimized spacing.
 * Configures layout specifically for image gallery arrangements.
 * @param {string} frameId - The frame ID to apply auto-layout to
 * @returns {Promise} Test result object
 * @example
 * await apply_autolayout('frame123');
 * // Frame configured for horizontal image flow with wrapping
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
 * Creates a frame container optimized for image display with auto-layout.
 * @param {number} y - Y position for the frame (when parentId not provided)
 * @param {string} name - Display name for the frame
 * @param {string} [parentId] - Optional parent frame ID for hierarchical organization
 * @returns {Promise<string>} The created frame ID
 * @example
 * const frameId = await create_image_frame(100, "Gallery Frame", 'container123');
 */
async function create_image_frame(y, name, parentId) {
  let params;
  if (parentId) {
    params = {
      x: 0,
      y: 0,
      width: 400,
      height: 120,
      name,
      fillColor: { r: 0.98, g: 0.98, b: 0.98, a: 1 },
      strokeColor: { r: 0.8, g: 0.8, b: 0.8, a: 1 },
      strokeWeight: 1,
      parentId
    };
  } else {
    params = {
      x: 50,
      y,
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
    label: `create_image_frame (${name})`
  });
  const frameId = res.response?.ids?.[0];
  if (frameId) {
    await apply_autolayout(frameId);
  }
  return frameId;
}

/**
 * Fetches an image from a remote URL and converts it to base64 data URL.
 * Handles various image formats and maintains proper MIME type information.
 * @param {string} url - The image URL to fetch
 * @returns {Promise<string>} Base64 data URL string (data:image/type;base64,...)
 * @throws {Error} When fetch fails, URL is invalid, or image cannot be processed
 * @example
 * const base64Data = await fetch_image_base64('https://example.com/image.jpg');
 */
async function fetch_image_base64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  // Convert to base64
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${contentType};base64,${base64}`;
}

/**
 * Creates an image node from base64 data with automatic aspect-ratio-preserving resize.
 * Maintains image quality while fitting within specified dimensions.
 * @param {string} parentId - Parent frame ID to contain the image
 * @param {string} base64Data - Base64 encoded image data with MIME type prefix
 * @param {string} name - Display name for the image node
 * @param {number} [targetSize=200] - Target size in pixels for the longest dimension
 * @returns {Promise<string|null>} The created image node ID, or null if creation failed
 * @example
 * const imageId = await create_image_from_base64(
 *   'frame123',
 *   'data:image/jpeg;base64,/9j/4AAQ...',
 *   'Profile Photo',
 *   100
 * );
 */
async function create_image_from_base64(parentId, base64Data, name, targetSize = 100) {
  // Insert image node
  const res = await runStep({
    ws,
    channel,
    command: "set_image",
    params: {
      image: {
        imageData: base64Data,
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
    label: `create_image_from_base64 (${name})`
  });
  // Get the nodeId of the created image node
  console.log(`[TEST] set_image response for ${name}:`, JSON.stringify(res.response, null, 2));
  const ids = Array.isArray(res.response?.ids) ? res.response.ids : res.response?.nodeIds;
  console.log(`[TEST] Extracted ids for ${name}:`, ids);
  const nodeId = ids && ids.length > 0 ? ids[0] : null;
  console.log(`[TEST] Final nodeId for ${name}:`, nodeId);
  if (nodeId) {
    console.log(`[TEST] Starting resize process for ${name} (nodeId: ${nodeId})`);
    
    // Get current node dimensions to calculate proper aspect ratio
    const nodeInfoRes = await runStep({
      ws,
      channel,
      command: "get_node_info",
      params: { nodeId },
      assert: (response) => response && response.id === nodeId,
      label: `get_node_info for resize (${nodeId})`
    });

    console.log(`[TEST] get_node_info response for ${name}:`, JSON.stringify(nodeInfoRes.response, null, 2));
    
    const nodeInfo = nodeInfoRes.response;
    console.log(`[TEST] nodeInfo exists:`, !!nodeInfo);
    console.log(`[TEST] nodeInfo.document exists:`, !!(nodeInfo && nodeInfo.document));
    console.log(`[TEST] nodeInfo.document.absoluteBoundingBox exists:`, !!(nodeInfo && nodeInfo.document && nodeInfo.document.absoluteBoundingBox));
    
    if (nodeInfo && nodeInfo.document && nodeInfo.document.absoluteBoundingBox) {
      const currentWidth = nodeInfo.document.absoluteBoundingBox.width;
      const currentHeight = nodeInfo.document.absoluteBoundingBox.height;
      console.log(`[TEST] Current dimensions for ${name}: ${currentWidth}x${currentHeight}`);

      // Calculate scale to fit within targetSize x targetSize box without stretching
      // (Preserve aspect ratio, do not force square)
      const scale = Math.min(targetSize / currentWidth, targetSize / currentHeight);
      const newWidth = currentWidth * scale;
      const newHeight = currentHeight * scale;
      console.log(`[TEST] Calculated scale for ${name}: ${scale}`);
      console.log(`[TEST] New dimensions for ${name}: ${newWidth}x${newHeight}`);

      // Only resize if the new size is different (avoid unnecessary resize)
      const widthDiff = Math.abs(newWidth - currentWidth);
      const heightDiff = Math.abs(newHeight - currentHeight);
      console.log(`[TEST] Size differences for ${name}: width=${widthDiff}, height=${heightDiff}`);
      
      if (widthDiff > 0.1 || heightDiff > 0.1) {
        console.log(`[TEST] Proceeding with resize for ${name} (differences exceed 0.1)`);
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
          label: `resize_image_node (${name}) to ${newWidth.toFixed(1)}x${newHeight.toFixed(1)}`
        });
        console.log(`[TEST] Resize completed for ${name}`);
      } else {
        console.log(`[TEST] Skipping resize for ${name} (differences too small)`);
      }
    } else {
      console.log(`[TEST] Cannot resize ${name} - missing nodeInfo structure`);
      if (nodeInfo) {
        console.log(`[TEST] Available nodeInfo keys for ${name}:`, Object.keys(nodeInfo));
        if (nodeInfo.document) {
          console.log(`[TEST] Available document keys for ${name}:`, Object.keys(nodeInfo.document));
        }
      }
    }
  } else {
    console.log(`[TEST] No nodeId returned for ${name}`);
  }
  return nodeId;
}

// --- Image URLs ---
const IMAGE_URLS = {
  cat: "https://i.imgur.com/CzXTtJV.jpg",
  bird: "https://farm4.staticflickr.com/3075/3168662394_7d7103de7d_z_d.jpg",
  fox: "https://farm4.staticflickr.com/3852/14447103450_2d0ff8802b_z_d.jpg",
  bridge: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Golden_Gate_Bridge_as_seen_from_Battery_East.jpg/2560px-Golden_Gate_Bridge_as_seen_from_Battery_East.jpg"
};

// --- Image creation functions for debugging ---
export async function create_img1(frameId) {
  const url = IMAGE_URLS.cat;
  const name = "Cat";
  let base64Data;
  try {
    base64Data = await fetch_image_base64(url);
  } catch (e) {
    console.warn(`fetch_image_base64 (${name}): ${e.message}`);
    return;
  }
  console.log("image-scene: base64Data length", base64Data.length);
  await create_image_from_base64(frameId, base64Data, name);
}

export async function create_img2(frameId) {
  const url = IMAGE_URLS.bird;
  const name = "Bird";
  let base64Data;
  try {
    base64Data = await fetch_image_base64(url);
  } catch (e) {
    console.warn(`fetch_image_base64 (${name}): ${e.message}`);
    return;
  }
  console.log("image-scene: base64Data length", base64Data.length);
  await create_image_from_base64(frameId, base64Data, name);
}

export async function create_img3(frameId) {
  const url = IMAGE_URLS.fox;
  const name = "Fox";
  let base64Data;
  try {
    base64Data = await fetch_image_base64(url);
  } catch (e) {
    console.warn(`fetch_image_base64 (${name}): ${e.message}`);
    return;
  }
  console.log("image-scene: base64Data length", base64Data.length);
  await create_image_from_base64(frameId, base64Data, name);
}

export async function create_img4(frameId) {
  const url = IMAGE_URLS.bridge;
  const name = "Golden Gate Bridge";
  let base64Data;
  try {
    base64Data = await fetch_image_base64(url);
  } catch (e) {
    console.warn(`fetch_image_base64 (${name}): ${e.message}`);
    return;
  }
  console.log("image-scene: base64Data length", base64Data.length);
  await create_image_from_base64(frameId, base64Data, name);
}

/**
 * Main entry point for image scene demonstration.
 * Creates a gallery of test images from various remote sources.
 * @param {Array} results - Array to collect test results
 * @param {string} [parentFrameId] - Optional parent frame ID for scene organization
 * Comment out any calls below to toggle creation of individual images for debugging.
 * @example
 * const results = [];
 * await imageScene(results, 'container123');
 * console.log('Image gallery created successfully');
 */
export async function imageScene(results, parentFrameId) {
  const frameId = await create_image_frame(100, "Image Frame", parentFrameId);
  await create_img1(frameId);
  await create_img2(frameId);
  await create_img3(frameId);
  //await create_img4(frameId);
  
  // Add delay for large image processing
  console.log("[TEST] Waiting for large image processing to complete...");
  await new Promise(resolve => setTimeout(resolve, 3000));
}
