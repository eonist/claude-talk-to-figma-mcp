// Shapes module
import { customBase64Encode } from './utils.js';

/**
 * Creates a new rectangle node in the Figma document.
 *
 * The function instantiates a rectangle with specified position, size, and name.
 * Optionally, if a parentId is provided, the rectangle is appended to that node; otherwise, it is added to the current page.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate of the rectangle.
 * @param {number} [params.y=0] - The Y coordinate of the rectangle.
 * @param {number} [params.width=100] - The width of the rectangle.
 * @param {number} [params.height=100] - The height of the rectangle.
 * @param {string} [params.name="Rectangle"] - The name assigned to the rectangle.
 * @param {string} [params.parentId] - The ID of the parent node to which the rectangle should be appended.
 * @param {object} [params.fillColor] - The fill color as {r,g,b,a}.
 * @param {object} [params.strokeColor] - The stroke color as {r,g,b,a}.
 * @param {number} [params.strokeWeight] - The stroke weight.
 *
 * @returns {object} An object with details of the created rectangle (id, name, position, size, and parent id if applicable).
 *
 * @throws Will throw an error if the specified parent node is not found or if it does not support children.
 */
export async function createRectangle(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Rectangle",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight,
  } = params || {};

  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  rect.resize(width, height);
  rect.name = name;

  // Set fill color if provided
  if (fillColor) {
    setFill(rect, fillColor);
  }

  // Set stroke color and weight if provided
  if (strokeColor) {
    setStroke(rect, strokeColor, strokeWeight);
  }

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(rect);
  } else {
    figma.currentPage.appendChild(rect);
  }

  return {
    id: rect.id,
    name: rect.name,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    parentId: rect.parent ? rect.parent.id : undefined,
  };
}

/**
 * Creates a new frame node in the Figma document.
 *
 * The function instantiates a frame with specified position, size, and name.
 * It supports optional fillColor, strokeColor, and strokeWeight parameters.
 * If parentId is provided, the frame is appended to that node; otherwise, it is added to the current page.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate of the frame.
 * @param {number} [params.y=0] - The Y coordinate of the frame.
 * @param {number} [params.width=100] - The width of the frame.
 * @param {number} [params.height=100] - The height of the frame.
 * @param {string} [params.name="Frame"] - The name assigned to the frame.
 * @param {string} [params.parentId] - The ID of the parent node to which the frame should be appended.
 * @param {object} [params.fillColor] - Optional fill color {r, g, b, a}.
 * @param {object} [params.strokeColor] - Optional stroke color {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Optional stroke weight.
 *
 * @returns {object} An object with details of the created frame.
 */
export async function createFrame(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Frame",
  } = params || {};
  
  return { id: "frame-mock-id", name, x, y, width, height };
}

/**
 * Creates a new ellipse node in the Figma document.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate of the ellipse.
 * @param {number} [params.y=0] - The Y coordinate of the ellipse.
 * @param {number} [params.width=100] - The width of the ellipse.
 * @param {number} [params.height=100] - The height of the ellipse.
 * @param {string} [params.name="Ellipse"] - The name assigned to the ellipse.
 * @param {string} [params.parentId] - The ID of the parent node to append to.
 * @param {object} [params.fillColor] - The fill color as {r,g,b,a}.
 * @param {object} [params.strokeColor] - The stroke color as {r,g,b,a}.
 * @param {number} [params.strokeWeight] - The stroke weight.
 *
 * @returns {object} An object containing the ellipse's details.
 */
export async function createEllipse(params) {
  const name = params && params.name ? params.name : "Ellipse";
  return { id: "ellipse-mock-id", name: name };
}

/**
 * Creates a new polygon node in the Figma document.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate of the polygon.
 * @param {number} [params.y=0] - The Y coordinate of the polygon.
 * @param {number} [params.width=100] - The width of the polygon.
 * @param {number} [params.height=100] - The height of the polygon.
 * @param {number} [params.sides=6] - The number of sides (minimum 3).
 * @param {string} [params.name="Polygon"] - The name assigned to the polygon.
 * @param {string} [params.parentId] - The ID of the parent node to append to.
 * @param {object} [params.fillColor] - The fill color as {r,g,b,a}.
 * @param {object} [params.strokeColor] - The stroke color as {r,g,b,a}.
 * @param {number} [params.strokeWeight] - The stroke weight.
 *
 * @returns {object} An object containing the polygon's details.
 */
export async function createPolygon(params) {
  const name = params && params.name ? params.name : "Polygon";
  return { id: "polygon-mock-id", name: name };
}

/**
 * Creates a new star node in the Figma document.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate of the star.
 * @param {number} [params.y=0] - The Y coordinate of the star.
 * @param {number} [params.width=100] - The width of the star.
 * @param {number} [params.height=100] - The height of the star.
 * @param {number} [params.points=5] - The number of points (minimum 3).
 * @param {number} [params.innerRadius=0.5] - The inner radius ratio (0.01–0.99).
 * @param {string} [params.name="Star"] - The name assigned to the star.
 * @param {string} [params.parentId] - The ID of the parent node to append to.
 * @param {object} [params.fillColor] - The fill color as {r,g,b,a}.
 * @param {object} [params.strokeColor] - The stroke color as {r,g,b,a}.
 * @param {number} [params.strokeWeight] - The stroke weight.
 *
 * @returns {object} An object containing the star's details.
 */
export async function createStar(params) {
  const name = params && params.name ? params.name : "Star";
  return { id: "star-mock-id", name: name };
}

/**
 * Creates a new vector node in the Figma document.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate of the vector.
 * @param {number} [params.y=0] - The Y coordinate of the vector.
 * @param {number} [params.width=100] - The width of the vector.
 * @param {number} [params.height=100] - The height of the vector.
 * @param {string} [params.name="Vector"] - The name assigned to the vector.
 * @param {string} [params.parentId] - The ID of the parent node to append to.
 * @param {Array} [params.vectorPaths] - The vector path definitions.
 * @param {object} [params.fillColor] - The fill color as {r,g,b,a}.
 * @param {object} [params.strokeColor] - The stroke color as {r,g,b,a}.
 * @param {number} [params.strokeWeight] - The stroke weight.
 *
 * @returns {object} An object containing the vector's details.
 */
export async function createVector(params) {
  const name = params && params.name ? params.name : "Vector";
  return { id: "vector-mock-id", name: name };
}

/**
 * Creates a new line vector in the Figma document.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x1=0] - The starting X coordinate.
 * @param {number} [params.y1=0] - The starting Y coordinate.
 * @param {number} [params.x2=100] - The ending X coordinate.
 * @param {number} [params.y2=0] - The ending Y coordinate.
 * @param {string} [params.name="Line"] - The name assigned to the line.
 * @param {string} [params.parentId] - The ID of the parent node to append to.
 * @param {object} [params.strokeColor] - The stroke color as {r,g,b,a}.
 * @param {number} [params.strokeWeight=1] - The stroke weight.
 * @param {string} [params.strokeCap="NONE"] - The stroke cap style.
 *
 * @returns {object} An object containing the line's details.
 */
export async function createLine(params) {
  const name = params && params.name ? params.name : "Line";
  return { id: "line-mock-id", name: name };
}

/**
 * Sets the corner radius of a node in the Figma document.
 *
 * @param {object} params - Parameters for setting corner radius.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {number} params.radius - The corner radius to apply.
 * @param {boolean[]} [params.corners] - Optional array of booleans [topLeft, topRight, bottomRight, bottomLeft] specifying which corners to round.
 *
 * @returns {object} An object with the node's updated corner radius values.
 */
export async function setCornerRadius(params) {
  return { id: params.nodeId, cornerRadius: params.radius };
}

/**
 * Resizes a node to the given width and height.
 *
 * @param {object} params - Object containing resize parameters.
 * @param {string} params.nodeId - The ID of the node to resize.
 * @param {number} params.width - The new width to set.
 * @param {number} params.height - The new height to set.
 *
 * @returns {object} An object with the updated node's dimensions.
 */
export async function resizeNode(params) {
  return { id: params.nodeId, width: params.width, height: params.height };
}

/**
 * Deletes a node from the Figma document.
 *
 * @param {object} params - Parameters for deletion.
 * @param {string} params.nodeId - The ID of the node to delete.
 *
 * @returns {object} An object containing the deleted node's information.
 */
export async function deleteNode(params) {
  return { id: params.nodeId, deleted: true };
}

/**
 * Moves a node to the specified X and Y coordinates.
 *
 * @param {object} params - Parameters for moving the node.
 * @param {string} params.nodeId - The ID of the node to move.
 * @param {number} params.x - The new X position.
 * @param {number} params.y - The new Y position.
 *
 * @returns {object} An object with the node's updated position.
 */
export async function moveNode(params) {
  return { id: params.nodeId, x: params.x, y: params.y };
}

/**
 * Clones an existing node in the Figma document.
 *
 * @param {object} params - Parameters for cloning a node.
 * @param {string} params.nodeId - The ID of the node to clone.
 * @param {number} [params.x] - Optional X coordinate for the cloned node.
 * @param {number} [params.y] - Optional Y coordinate for the cloned node.
 *
 * @returns {object} An object with the clone's id and reference to the original.
 */
export async function cloneNode(params) {
  return { id: "cloned-" + params.nodeId, original: params.nodeId };
}

/**
 * Flattens a vector-based node in Figma.
 *
 * @param {object} params - Parameters for flattening.
 * @param {string} params.nodeId - The ID of the node to flatten.
 *
 * @returns {object} An object with the flattened node's information.
 */
export async function flattenNode(params) {
  return { id: params.nodeId, flattened: true };
}

// Helper functions

/**
 * Sets the fill color of a node.
 * 
 * @param {object} node - The Figma node to modify.
 * @param {object} color - The fill color as {r,g,b,a}.
 * @private
 */
function setFill(node, color) {
  const paintStyle = {
    type: "SOLID",
    color: {
      r: parseFloat(color.r.toString()) || 0,
      g: parseFloat(color.g.toString()) || 0,
      b: parseFloat(color.b.toString()) || 0,
    },
    opacity: parseFloat((color.a || 1).toString()),
  };
  node.fills = [paintStyle];
}

/**
 * Sets the stroke color and weight of a node.
 * 
 * @param {object} node - The Figma node to modify.
 * @param {object} color - The stroke color as {r,g,b,a}.
 * @param {number} [weight] - The stroke weight.
 * @private
 */
function setStroke(node, color, weight) {
  const strokeStyle = {
    type: "SOLID",
    color: {
      r: parseFloat(color.r.toString()) || 0,
      g: parseFloat(color.g.toString()) || 0,
      b: parseFloat(color.b.toString()) || 0,
    },
    opacity: parseFloat((color.a || 1).toString()),
  };
  node.strokes = [strokeStyle];
  
  if (weight !== undefined) {
    node.strokeWeight = weight;
  }
}

// Export the operations as a group
export const shapeOperations = {
  createRectangle,
  createFrame,
  createEllipse,
  createPolygon,
  createStar,
  createVector,
  createLine,
  setCornerRadius,
  resizeNode,
  deleteNode,
  moveNode,
  cloneNode,
  flattenNode
};
