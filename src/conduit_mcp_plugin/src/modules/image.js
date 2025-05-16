/**
 * Image operations module.
 * Provides functions to insert images via URL or local data into Figma via MCP.
 *
 * Exposed functions:
 * - insertImage({ image } | { images }): Promise<{ ids: string[] }>
 * - insertLocalImage({ image } | { images }): Promise<{ ids: string[] }>
 *
 * @module modules/image
 * @example
 * import { imageOperations } from './modules/image.js';
 * // Insert from URL
 * const { id } = await imageOperations.insertImage({
 *   url: 'https://example.com/image.png',
 *   x: 10, y: 10, width: 100, height: 100
 * });
 * console.log('Inserted image node:', id);
 */

/**
 * Inserts a single image into the document.
 * Fetches image bytes from a URL and places them in a new rectangle node.
 *
 * @async
 * @function insertImage
 * @param {{ url: string, x?: number, y?: number, width?: number, height?: number, name?: string, parentId?: string }} params
 *   - url: URL of the image to fetch.
 *   - x: X coordinate for placement (default 0).
 *   - y: Y coordinate for placement (default 0).
 *   - width: Desired width (intrinsic if omitted).
 *   - height: Desired height (intrinsic or equal to width if omitted).
 *   - name: Node name (default "Image").
 *   - parentId: Optional parent node ID for placement.
 * @returns {Promise<{ id: string, name: string }>} Created rectangle node details.
 * @throws {Error} If fetching the image fails or parent node is not found.
 * @example
 * const { id } = await insertImage({ url: 'https://example.com/img.png', x: 10, y: 10 });
 */
export async function insertImage(params) {
  let imagesArr;
  if (params.images) {
    imagesArr = params.images;
  } else if (params.image) {
    imagesArr = [params.image];
  } else {
    // Fallback for legacy single input
    imagesArr = [params];
  }
  // Remove undefined or null configs
  imagesArr = imagesArr.filter(Boolean);
  const ids = [];
  for (const cfg of imagesArr) {
    const { url, x = 0, y = 0, width, height, name = "Image", parentId } = cfg || {};
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
    ids.push(rect.id);
  }
  return { ids };
}

export async function insertLocalImage(params) {
  let imagesArr;
  if (params.images) {
    imagesArr = params.images;
  } else if (params.image) {
    imagesArr = [params.image];
  } else {
    // Fallback for legacy single input
    imagesArr = [params];
  }
  // Remove undefined or null configs
  imagesArr = imagesArr.filter(Boolean);
  const ids = [];
  for (const cfg of imagesArr) {
    const { data, x = 0, y = 0, width, height, name = "Local Image", parentId } = cfg || {};
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
    ids.push(rect.id);
  }
  return { ids };
}

export const imageOperations = {
  insertImage,
  insertLocalImage
};
