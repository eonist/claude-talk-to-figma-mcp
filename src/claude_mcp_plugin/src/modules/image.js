// Image insertion utilities for the Figma plugin

/**
 * Inserts a single image into the document.
 *
 * @param {object} params - Configuration parameters.
 * @param {string} params.url - URL of the image to fetch.
 * @param {number} [params.x=0] - X coordinate where the image rectangle will be placed.
 * @param {number} [params.y=0] - Y coordinate where the image rectangle will be placed.
 * @param {number} [params.width] - Desired width (if omitted, image's intrinsic size is used).
 * @param {number} [params.height] - Desired height (if omitted, the width is used for a square).
 * @param {string} [params.name="Image"] - Name of the rectangle node.
 * @param {string} [params.parentId] - Optional ID of the parent node to append to.
 * @returns {{id: string, name: string}} Details of the created rectangle node.
 */
export async function insertImage(params) {
  const { url, x = 0, y = 0, width, height, name = "Image", parentId } = params || {};
  // Fetch image data
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image at ${url}: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  // Create Figma image and a rectangle to hold it
  const image = figma.createImage(new Uint8Array(buffer));
  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  if (width !== undefined) {
    // Use provided dimensions or square fallback
    const h = height !== undefined ? height : width;
    rect.resize(width, h);
  }
  rect.name = name;
  rect.fills = [{
    type: "IMAGE",
    scaleMode: "FILL",
    imageHash: image.hash
  }];
  // Append to specified parent or current page
  const parent = parentId
    ? await figma.getNodeByIdAsync(parentId)
    : figma.currentPage;
  if (parentId && !parent) {
    throw new Error(`Parent not found: ${parentId}`);
  }
  parent.appendChild(rect);
  return { id: rect.id, name: rect.name };
}

/**
 * Inserts multiple images in batch.
 *
 * @param {object} params - Batch parameters.
 * @param {Array<object>} params.images - Array of image config objects for insertImage.
 * @returns {{results: Array<{id?: string, success: boolean, error?: string}>}}
 */
export async function insertImages(params) {
  const { images = [] } = params || {};
  const results = [];
  for (const cfg of images) {
    try {
      const res = await insertImage(cfg);
      results.push({ id: res.id, success: true });
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  }
  return { results };
}

export async function insertLocalImage(params) {
  const { data, x = 0, y = 0, width, height, name = "Local Image", parentId } = params || {};
  if (!data) {
    throw new Error("No image data provided");
  }
  const bytes = Array.isArray(data) ? new Uint8Array(data) : data;
  const image = figma.createImage(bytes);
  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  if (width !== undefined) {
    const h = height !== undefined ? height : width;
    rect.resize(width, h);
  }
  rect.name = name;
  rect.fills = [{
    type: "IMAGE",
    scaleMode: "FILL",
    imageHash: image.hash
  }];
  const parent = parentId
    ? await figma.getNodeByIdAsync(parentId)
    : figma.currentPage;
  if (parentId && !parent) {
    throw new Error(`Parent not found: ${parentId}`);
  }
  parent.appendChild(rect);
  return { id: rect.id, name: rect.name };
}

export async function insertLocalImages(params) {
  const { images = [] } = params || {};
  const results = [];
  for (const cfg of images) {
    try {
      const res = await insertLocalImage(cfg);
      results.push({ id: res.id, success: true });
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  }
  return { results };
}

export const imageOperations = {
  insertImage,
  insertImages,
  insertLocalImage,
  insertLocalImages
};
