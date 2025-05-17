/**
 * Node editing operations for Figma nodes.
 * Exports: deleteNode, deleteNodes, convertRectangleToFrame
 */

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
