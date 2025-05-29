/**
 * Node editing operations for Figma nodes.
 * Exports: deleteNode, deleteNodes, convertRectangleToFrame, getNodeStyles
 */

/**
 * Unified handler for get_node_styles (single or batch).
 * Returns all style properties for one or more nodes.
 *
 * @async
 * @function
 * @param {Object} params - { nodeId } or { nodeIds }
 * @returns {Promise<Array<{ nodeId: string, styles: Object }>>}
 */
export async function getNodeStyles(params) {
  let ids = [];
  if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
    ids = params.nodeIds;
  } else if (params.nodeId) {
    ids = [params.nodeId];
  } else {
    throw new Error("getNodeStyles: Provide either nodeId or nodeIds.");
  }
  const results = [];
  for (const nodeId of ids) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      results.push({ nodeId, error: "Node not found" });
      continue;
    }
    // Extract style properties
    const styles = {};
    // Paint styles
    if ("fills" in node) styles.fills = node.fills;
    if ("strokes" in node) styles.strokes = node.strokes;
    if ("fillStyleId" in node) styles.fillStyleId = node.fillStyleId;
    if ("strokeStyleId" in node) styles.strokeStyleId = node.strokeStyleId;
    // Effect styles
    if ("effects" in node) styles.effects = node.effects;
    if ("effectStyleId" in node) styles.effectStyleId = node.effectStyleId;
    // Text styles
    if ("fontName" in node) styles.fontName = node.fontName;
    if ("fontSize" in node) styles.fontSize = node.fontSize;
    if ("fontWeight" in node) styles.fontWeight = node.fontWeight;
    if ("letterSpacing" in node) styles.letterSpacing = node.letterSpacing;
    if ("lineHeight" in node) styles.lineHeight = node.lineHeight;
    if ("paragraphSpacing" in node) styles.paragraphSpacing = node.paragraphSpacing;
    if ("textCase" in node) styles.textCase = node.textCase;
    if ("textDecoration" in node) styles.textDecoration = node.textDecoration;
    if ("textStyleId" in node) styles.textStyleId = node.textStyleId;
    // Add more as needed

    results.push({ nodeId, styles });
  }
  return results;
}

/**
 * Unified handler for get_svg_vector (single or batch).
 * Returns SVG markup for one or more vector nodes.
 *
 * @async
 * @function
 * @param {Object} params - { nodeId } or { nodeIds }
 * @returns {Promise<Array<{ nodeId: string, svg: string }>>}
 */
export async function getSvgVector(params) {
  let ids = [];
  if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
    ids = params.nodeIds;
  } else if (params.nodeId) {
    ids = [params.nodeId];
  } else {
    throw new Error("getSvgVector: Provide either nodeId or nodeIds.");
  }
  const results = [];
  for (const nodeId of ids) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      results.push({ nodeId, error: "Node not found" });
      continue;
    }
    // Check if node is a vector or compatible type
    if (
      node.type !== "VECTOR" &&
      node.type !== "LINE" &&
      node.type !== "ELLIPSE" &&
      node.type !== "POLYGON" &&
      node.type !== "STAR" &&
      node.type !== "RECTANGLE"
    ) {
      results.push({ nodeId, error: `Node type ${node.type} is not a vector-compatible type` });
      continue;
    }
    // Export as SVG using Figma API
    try {
      const svgBytes = await node.exportAsync({ format: "SVG" });
      const svg = new TextDecoder("utf-8").decode(svgBytes);
      results.push({ nodeId, svg });
    } catch (error) {
      results.push({ nodeId, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return results;
}

/**
 * Deletes one or more nodes from the document.
 * Accepts either { nodeId } for single or { nodeIds } for batch.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for node deletion.
 * @param {string} [params.nodeId] - The ID of the node to delete.
 * @param {Array<string>} [params.nodeIds] - Array of node IDs to delete.
 * @returns {Promise<{success: Array<string>, failed: Array<string>}>} Object with arrays of successfully deleted and failed node IDs.
 * @throws {Error} If neither nodeId nor nodeIds is provided.
 */
export async function deleteNode(params) {
  let nodeIds = [];
  if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
    nodeIds = params.nodeIds;
  } else if (params.nodeId) {
    nodeIds = [params.nodeId];
  } else {
    throw new Error("deleteNode: Provide either nodeId or nodeIds.");
  }
  const success = [];
  const failed = [];
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) {
      node.remove();
      success.push(id);
    } else {
      failed.push(id);
    }
  }
  return { success, failed };
}

/**
 * Unified handler for DELETE_NODE plugin command.
 * Accepts { nodeIds }, { nodeId }, or string.
 * @function deleteNodeUnified
 * @param {object|string} params
 * @returns {Promise<any>}
 */
export async function deleteNodeUnified(params) {
  if (params && Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
    return deleteNode({ nodeIds: params.nodeIds });
  } else if (params && typeof params.nodeId === "string") {
    return deleteNode({ nodeId: params.nodeId });
  } else if (params && typeof params === "string") {
    return deleteNode({ nodeId: params });
  } else {
    throw new Error("Invalid parameters for DELETE_NODE");
  }
}

/**
 * Converts a rectangle node to a frame, preserving all properties and optionally placing elements inside it.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for conversion.
 * @param {string} params.nodeId - The ID of the rectangle node to convert.
 * @param {Array<string>} [params.elementsToPlace=[]] - Optional array of element IDs to place inside the new frame.
 * @param {boolean} [params.deleteOriginal=true] - Whether to delete the original rectangle.
 * @returns {Promise<{id: string, name: string, width: number, height: number}>} Info about the new frame.
 * @throws {Error} If nodeId is missing, node cannot be found, or is not a rectangle.
 */
export async function convertRectangleToFrame(params) {
  console.log("💥 convertRectangleToFrame called with params:", params);
  try {
    const { nodeId, elementsToPlace = [], deleteOriginal = true } = params || {};
    if (!nodeId) throw new Error("Missing nodeId parameter");
    const rectangle = await figma.getNodeByIdAsync(nodeId);
    if (!rectangle) throw new Error(`Node not found with ID: ${nodeId}`);
    if (rectangle.type !== "RECTANGLE") throw new Error(`Node with ID ${nodeId} is not a rectangle (found type: ${rectangle.type})`);
    const parent = rectangle.parent;
    const frame = figma.createFrame();
    frame.x = rectangle.x;
    frame.y = rectangle.y;
    frame.resize(rectangle.width, rectangle.height);
    frame.name = rectangle.name + " Frame";
    if ("fills" in rectangle) frame.fills = rectangle.fills;
    if ("strokes" in rectangle) frame.strokes = rectangle.strokes;
    if ("strokeWeight" in rectangle) frame.strokeWeight = rectangle.strokeWeight;
    if ("strokeAlign" in rectangle) frame.strokeAlign = rectangle.strokeAlign;
    if ("strokeCap" in rectangle) frame.strokeCap = rectangle.strokeCap;
    if ("strokeJoin" in rectangle) frame.strokeJoin = rectangle.strokeJoin;
    if ("strokeMiterLimit" in rectangle) frame.strokeMiterLimit = rectangle.strokeMiterLimit;
    if ("dashPattern" in rectangle) frame.dashPattern = rectangle.dashPattern;
    if ("cornerRadius" in rectangle) {
      if (typeof rectangle.cornerRadius === 'number') {
        frame.cornerRadius = rectangle.cornerRadius;
      } else {
        frame.topLeftRadius = rectangle.topLeftRadius;
        frame.topRightRadius = rectangle.topRightRadius;
        frame.bottomLeftRadius = rectangle.bottomLeftRadius;
        frame.bottomRightRadius = rectangle.bottomRightRadius;
      }
    }
    if ("effects" in rectangle) frame.effects = rectangle.effects;
    if ("blendMode" in rectangle) frame.blendMode = rectangle.blendMode;
    if ("opacity" in rectangle) frame.opacity = rectangle.opacity;
    parent.appendChild(frame);
    if (elementsToPlace.length > 0) {
      for (const elementId of elementsToPlace) {
        const element = await figma.getNodeByIdAsync(elementId);
        if (element) {
          const relativeX = element.x - frame.x;
          const relativeY = element.y - frame.y;
          frame.appendChild(element);
          element.x = relativeX;
          element.y = relativeY;
        }
      }
    }
    if (deleteOriginal) {
      rectangle.remove();
    }
    const result = { 
      id: frame.id, 
      name: frame.name, 
      width: frame.width, 
      height: frame.height 
    };
    console.log("💥 convertRectangleToFrame returning:", result);
    return result;
  } catch (err) {
    console.error("💥 convertRectangleToFrame error:", err);
    throw err;
  }
}

/**
 * Unified handler for get_image (single or batch).
 * Returns image data for one or more nodes.
 *
 * @async
 * @function
 * @param {Object} params - { nodeId }, { nodeIds }, or both, plus optional fillIndex.
 * @returns {Promise<Array<{ nodeId: string, imageData?: string, mimeType?: string, fillIndex?: number, error?: string }>>}
 */
export async function getImage(params) {
  let ids = [];
  const fillIndex = typeof params.fillIndex === "number" ? params.fillIndex : 0;
  if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
    ids = params.nodeIds;
  } else if (params.nodeId) {
    ids = [params.nodeId];
  } else {
    throw new Error("getImage: Provide either nodeId or nodeIds.");
  }

  const results = [];
  for (const nodeId of ids) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        results.push({ nodeId, error: "Node not found" });
        continue;
      }

      // Check for image fill
      if ("fills" in node && Array.isArray(node.fills) && node.fills.length > 0) {
        const fills = node.fills;
        const fill = fills[fillIndex] || fills[0];
        if (fill && fill.type === "IMAGE" && fill.imageHash) {
          try {
            const imageBytes = await figma.getImageByHash(fill.imageHash).getBytesAsync();
            // Encode as base64 data URI
            const mimeType = fill.scaleMode === "CROP" ? "image/png" : "image/png"; // Figma always returns PNG for getBytesAsync
            const base64 = base64ArrayBuffer(imageBytes);
            results.push({
              nodeId,
              imageData: `data:${mimeType};base64,${base64}`,
              mimeType,
              fillIndex
            });
            continue;
          } catch (err) {
            results.push({ nodeId, fillIndex, error: "Failed to extract image fill: " + (err && err.message ? err.message : String(err)) });
            continue;
          }
        }
      }

      // If node is an IMAGE node (rare, but possible)
      if (node.type === "IMAGE" && node.imageHash) {
        try {
          const imageBytes = await figma.getImageByHash(node.imageHash).getBytesAsync();
          const mimeType = "image/png";
          const base64 = base64ArrayBuffer(imageBytes);
          results.push({
            nodeId,
            imageData: `data:${mimeType};base64,${base64}`,
            mimeType
          });
          continue;
        } catch (err) {
          results.push({ nodeId, error: "Failed to extract IMAGE node: " + (err && err.message ? err.message : String(err)) });
          continue;
        }
      }

      // Fallback: export node as PNG
      try {
        const pngBytes = await node.exportAsync({ format: "PNG" });
        const mimeType = "image/png";
        const base64 = base64ArrayBuffer(pngBytes);
        results.push({
          nodeId,
          imageData: `data:${mimeType};base64,${base64}`,
          mimeType,
          error: "No image fill found, node rasterized"
        });
      } catch (err) {
        results.push({ nodeId, error: "Failed to export node as PNG: " + (err && err.message ? err.message : String(err)) });
      }
    } catch (err) {
      results.push({ nodeId, error: "Unexpected error: " + (err && err.message ? err.message : String(err)) });
    }
  }
  return results;

  // Helper: ArrayBuffer to base64
  function base64ArrayBuffer(arrayBuffer) {
    let base64 = '';
    const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    const bytes = new Uint8Array(arrayBuffer);
    const byteLength = bytes.byteLength;
    const byteRemainder = byteLength % 3;
    const mainLength = byteLength - byteRemainder;

    let a, b, c, d;
    let chunk;

    // Main loop deals with bytes in chunks of 3
    for (let i = 0; i < mainLength; i += 3) {
      // Combine the three bytes into a single integer
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

      // Use bitmasks to extract 6-bit segments from the triplet
      a = (chunk & 16515072) >> 18;
      b = (chunk & 258048) >> 12;
      c = (chunk & 4032) >> 6;
      d = chunk & 63;

      // Convert the raw binary segments to the appropriate ASCII encoding
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder === 1) {
      chunk = bytes[mainLength];

      a = (chunk & 252) >> 2;
      b = (chunk & 3) << 4;

      base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder === 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

      a = (chunk & 64512) >> 10;
      b = (chunk & 1008) >> 4;
      c = (chunk & 15) << 2;

      base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }

    return base64;
  }
}

/**
 * Unified handler for get_text_style (single or batch).
 * Returns text style properties for one or more nodes.
 *
 * @async
 * @function
 * @param {Object} params - { nodeId } or { nodeIds }
 * @returns {Promise<Array<{ nodeId: string, textStyle?: Object, error?: string }>>}
 */
export async function getTextStyle(params) {
  let ids = [];
  if (Array.isArray(params.nodeIds) && params.nodeIds.length > 0) {
    ids = params.nodeIds;
  } else if (params.nodeId) {
    ids = [params.nodeId];
  } else {
    throw new Error("getTextStyle: Provide either nodeId or nodeIds.");
  }
  const results = [];
  for (const nodeId of ids) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        results.push({ nodeId, error: "Node not found" });
        continue;
      }
      if (node.type !== "TEXT") {
        results.push({ nodeId, error: "Node is not a text node" });
        continue;
      }
      // Extract text style properties
      const textStyle = {};
      if ("fontName" in node) textStyle.fontName = node.fontName;
      if ("fontSize" in node) textStyle.fontSize = node.fontSize;
      if ("fontWeight" in node) textStyle.fontWeight = node.fontWeight;
      if ("letterSpacing" in node) textStyle.letterSpacing = node.letterSpacing;
      if ("lineHeight" in node) textStyle.lineHeight = node.lineHeight;
      if ("paragraphSpacing" in node) textStyle.paragraphSpacing = node.paragraphSpacing;
      if ("textCase" in node) textStyle.textCase = node.textCase;
      if ("textDecoration" in node) textStyle.textDecoration = node.textDecoration;
      if ("textStyleId" in node) textStyle.textStyleId = node.textStyleId;
      // Add more as needed

      results.push({ nodeId, textStyle });
    } catch (err) {
      results.push({ nodeId, error: "Unexpected error: " + (err && err.message ? err.message : String(err)) });
    }
  }
  return results;
}

/**
 * Unified handler for GET_ANNOTATION plugin command.
 * Handles single and batch annotation retrieval.
 * @async
 * @function getAnnotationUnified
 * @param {object} params
 * @returns {Promise<any>}
 */
export async function getAnnotationUnified(params) {
  // Single node
  if (params.nodeId) {
    const node = await figma.getNodeByIdAsync(params.nodeId);
    return {
      nodeId: params.nodeId,
      annotations: node && node.annotations ? node.annotations : []
    };
  }
  // Batch
  if (Array.isArray(params.nodeIds)) {
    const results = await Promise.all(params.nodeIds.map(async nodeId => {
      const node = await figma.getNodeByIdAsync(nodeId);
      return {
        nodeId,
        annotations: node && node.annotations ? node.annotations : []
      };
    }));
    return results;
  }
  throw new Error("Must provide nodeId or nodeIds");
}

/**
 * Unified handler for SET_ANNOTATION plugin command.
 * Handles single and batch annotation setting/deletion.
 * @async
 * @function setAnnotationUnified
 * @param {object} params
 * @returns {Promise<any>}
 */
export async function setAnnotationUnified(params) {
  // Helper to set or delete annotation for a node
  async function setOrDelete(entry) {
    const node = await figma.getNodeByIdAsync(entry.nodeId);
    if (!node) return { nodeId: entry.nodeId, success: false, error: "Node not found" };
    if (entry.delete) {
      node.annotations = [];
      return { nodeId: entry.nodeId, deleted: true };
    }
    if (entry.annotation) {
      node.annotations = [entry.annotation];
      return { nodeId: entry.nodeId, updated: true, annotation: entry.annotation };
    }
    return { nodeId: entry.nodeId, success: false, error: "No annotation or delete flag provided" };
  }

  // Single
  if (params.entry) {
    return await setOrDelete(params.entry);
  }
  // Batch
  if (Array.isArray(params.entries)) {
    const results = [];
    for (const entry of params.entries) {
      results.push(await setOrDelete(entry));
    }
    return results;
  }
  throw new Error("Must provide entry or entries");
}
