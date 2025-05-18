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
 * Deletes a node from the document.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for node deletion.
 * @param {string} params.nodeId - The ID of the node to delete.
 * @returns {Promise<{success: boolean}>} Deletion result.
 * @throws {Error} If nodeId is missing or node cannot be found.
 */
export async function deleteNode(params) {
  const { nodeId } = params;
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  node.remove();
  return { success: true };
}

/**
 * Deletes multiple nodes from the document.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for batch node deletion.
 * @param {Array<string>} params.nodeIds - Array of node IDs to delete.
 * @returns {Promise<{success: Array<string>, failed: Array<string>}>} Object with arrays of successfully deleted and failed node IDs.
 * @throws {Error} If nodeIds is missing.
 */
export async function deleteNodes(params) {
  const { nodeIds } = params;
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
  return { 
    id: frame.id, 
    name: frame.name, 
    width: frame.width, 
    height: frame.height 
  };
}
