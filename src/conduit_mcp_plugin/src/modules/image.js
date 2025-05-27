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
 * Extract image dimensions from image bytes.
 * Supports JPEG, PNG, WebP, and GIF formats.
 * @param {Uint8Array} bytes - The image bytes
 * @returns {{ width: number, height: number } | null} Dimensions or null if unable to parse
 */
function getImageDimensions(bytes) {
  try {
    // PNG format check
    if (bytes.length >= 24 && 
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      // PNG header: bytes 16-19 = width, bytes 20-23 = height (big-endian)
      const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
      const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
      return { width, height };
    }
    
    // JPEG format check
    if (bytes.length >= 4 && bytes[0] === 0xFF && bytes[1] === 0xD8) {
      let offset = 2;
      while (offset < bytes.length - 8) {
        if (bytes[offset] === 0xFF) {
          const marker = bytes[offset + 1];
          // SOF0, SOF1, SOF2 markers contain dimensions
          if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
            const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
            const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
            return { width, height };
          }
          // Skip to next segment
          const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
          offset += segmentLength + 2;
        } else {
          offset++;
        }
      }
    }
    
    // WebP format check
    if (bytes.length >= 30 && 
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      // Simple WebP format
      if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x20) {
        const width = ((bytes[26] | (bytes[27] << 8) | (bytes[28] << 16)) & 0x3FFF) + 1;
        const height = ((bytes[28] >> 6) | (bytes[29] << 2) | ((bytes[30] & 0x3F) << 10)) + 1;
        return { width, height };
      }
    }
    
    // GIF format check
    if (bytes.length >= 10 && 
        bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      // GIF header: bytes 6-7 = width, bytes 8-9 = height (little-endian)
      const width = bytes[6] | (bytes[7] << 8);
      const height = bytes[8] | (bytes[9] << 8);
      return { width, height };
    }
    
    return null;
  } catch (error) {
    console.warn('Error parsing image dimensions:', error);
    return null;
  }
}

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
      // Decode base64 data URI for Figma plugin (Figma plugin environment does NOT provide atob)
      // We use a pure JS polyfill for atob to ensure compatibility.
      let base64 = imageData;
      if (imageData.startsWith("data:")) {
        base64 = imageData.split(",")[1];
      }
      function atobPolyfill(input) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let str = input.replace(/=+$/, "");
        let output = "";
        if (str.length % 4 === 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        for (
          let bc = 0, bs = 0, buffer, i = 0;
          (buffer = str.charAt(i++));
          ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4)
            ? output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))
            : 0
        ) {
          buffer = chars.indexOf(buffer);
        }
        return output;
      }
      const binaryStr = (typeof atob === "function" ? atob : atobPolyfill)(base64);
      const len = binaryStr.length;
      imageBytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        imageBytes[i] = binaryStr.charCodeAt(i);
      }
    } else {
      throw new Error("Must provide either 'url' or 'imageData' for each image.");
    }
    // Extract image dimensions from bytes
    const imageDimensions = getImageDimensions(imageBytes);
    console.log('Parsed image dimensions:', imageDimensions);
    
    // Create Figma image and a rectangle to hold it
    const image = figma.createImage(imageBytes);
    console.log('Image created - API dimensions:', image.width, 'x', image.height);
    
    const rect = figma.createRectangle();
    rect.x = x;
    rect.y = y;
    
    console.log('Input parameters - width:', width, 'height:', height);
    
    if (width !== undefined) {
      // Use provided dimensions or square fallback
      const h = height !== undefined ? height : width;
      console.log('Using provided dimensions:', width, 'x', h);
      rect.resize(width, h);
    } else if (imageDimensions) {
      // Use image's natural dimensions when no width/height provided
      console.log('Using parsed image dimensions:', imageDimensions.width, 'x', imageDimensions.height);
      rect.resize(imageDimensions.width, imageDimensions.height);
    } else {
      // Fallback to a reasonable default if we can't parse dimensions
      console.log('Could not parse image dimensions, using fallback size: 200x200');
      rect.resize(200, 200);
    }
    
    console.log('Final rectangle size:', rect.width, 'x', rect.height);
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
