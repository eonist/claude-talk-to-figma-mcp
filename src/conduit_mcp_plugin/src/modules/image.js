/**
 * Image operations module.
 * Provides functions to insert images via URL or local data into Figma via MCP.
 *
 * Exposed functions:
 * - insertImage({ image } | { images }): Promise<{ ids: string[] }>
 * - insertLocalImage({ image } | { images }): Promise<{ ids: string[] }>
 *
 * @module modules/image
 * @see {@link https://help.figma.com/hc/en-us/articles/360040451373-Images-in-Figma}
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
    const { url, imageData, x = 0, y = 0, width, height, name = "Image", parentId } = cfg || {};
    let imageBytes;
    if (url) {
      // Fetch image data from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image at ${url}: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      imageBytes = new Uint8Array(buffer);
    } else if (imageData) {
      // Decode base64 data URI
      let base64 = imageData;
      if (imageData.startsWith("data:")) {
        base64 = imageData.split(",")[1];
      }
      imageBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    } else {
      throw new Error("Must provide either 'url' or 'imageData' for each image.");
    }
    // Create Figma image and a rectangle to hold it
    const image = figma.createImage(imageBytes);
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

/**
 * Inserts a single local image into the document.
 * Accepts image data as a Uint8Array or array of bytes, and places it in a new rectangle node.
 *
 * @async
 * @function insertLocalImage
 * @param {{ data: Uint8Array|Array<number>, x?: number, y?: number, width?: number, height?: number, name?: string, parentId?: string }|{ images: Array<object> }} params
 *   - data: Image data as Uint8Array or array of bytes.
 *   - x: X coordinate for placement (default 0).
 *   - y: Y coordinate for placement (default 0).
 *   - width: Desired width (intrinsic if omitted).
 *   - height: Desired height (intrinsic or equal to width if omitted).
 *   - name: Node name (default "Local Image").
 *   - parentId: Optional parent node ID for placement.
 *   - images: Array of image configs for batch insert.
 * @returns {Promise<{ ids: string[] }>} Array of created rectangle node IDs.
 * @throws {Error} If image data is missing or parent node is not found.
 * @example
 * const { ids } = await insertLocalImage({ data: myImageBytes, x: 10, y: 10 });
 */
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

/**
 * Collection of image operation functions for Figma.
 * @namespace imageOperations
 * @property {function} insertImage - Insert image from URL.
 * @property {function} insertLocalImage - Insert image from local data.
 */
export const imageOperations = {
  insertImage,
  insertLocalImage
};
