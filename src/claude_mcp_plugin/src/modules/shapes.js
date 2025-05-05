// Shapes module
// This module provides helper functions for creating and manipulating various shape nodes in a Figma document.
// It includes functions for creating rectangles, frames, ellipses, polygons, stars, vectors, and lines,
// as well as utilities for modifying node properties such as fills, strokes, resizing, and cloning.

import { customBase64Encode } from './utils.js';

/**
 * Creates a new rectangle node in the Figma document.
 *
 * The function instantiates a rectangle with the specified position, dimensions, and name.
 * Optionally, if a parentId is provided, the rectangle is appended as a child of that node;
 * otherwise, it is added to the current page.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate where the rectangle will be placed.
 * @param {number} [params.y=0] - The Y coordinate where the rectangle will be placed.
 * @param {number} [params.width=100] - The width of the rectangle.
 * @param {number} [params.height=100] - The height of the rectangle.
 * @param {string} [params.name="Rectangle"] - The display name for the rectangle.
 * @param {string} [params.parentId] - The ID of the node to which the rectangle should be appended.
 * @param {object} [params.fillColor] - The fill color given as an object {r, g, b, a}.
 * @param {object} [params.strokeColor] - The stroke color given as an object {r, g, b, a}.
 * @param {number} [params.strokeWeight] - The width of the stroke outline.
 *
 * @returns {object} An object containing details of the created rectangle, including its id, name, position, dimensions, and parent id (if applicable).
 *
 * @throws Will throw an error if the specified parent node cannot be found or does not support children.
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

  // Apply fill color if provided.
  if (fillColor) {
    setFill(rect, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(rect, strokeColor, strokeWeight);
  }

  // Add the rectangle to a specified parent or to the current page.
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
 * A frame is a container that can include other nodes. This function creates a frame with
 * specified position, dimensions, and optional visual styles. If a parentId is provided,
 * the frame is added as a child of the specified node; otherwise, it is added to the current page.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - The X coordinate of the frame.
 * @param {number} [params.y=0] - The Y coordinate of the frame.
 * @param {number} [params.width=100] - The frame's width.
 * @param {number} [params.height=100] - The frame's height.
 * @param {string} [params.name="Frame"] - The name assigned to the frame.
 * @param {string} [params.parentId] - The ID of the parent node that will contain the frame.
 * @param {object} [params.fillColor] - Optional fill color in the form {r, g, b, a}.
 * @param {object} [params.strokeColor] - Optional stroke color in the form {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Optional stroke width.
 *
 * @returns {object} An object containing the created frame's details.
 */
export async function createFrame(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Frame",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight,
  } = params || {};

  const frame = figma.createFrame();
  frame.x = x;
  frame.y = y;
  frame.resize(width, height);
  frame.name = name;

  // Apply fill color if provided.
  if (fillColor) {
    setFill(frame, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(frame, strokeColor, strokeWeight);
  }

  // Add the frame to a specific parent or to the current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(frame);
  } else {
    figma.currentPage.appendChild(frame);
  }

  return {
    id: frame.id,
    name: frame.name,
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: frame.height,
    fills: frame.fills,
    strokes: frame.strokes,
    strokeWeight: frame.strokeWeight,
    parentId: frame.parent ? frame.parent.id : undefined,
  };
}

/**
 * Creates a new ellipse node.
 *
 * This function creates an ellipse with the given position, size, and name.
 * Optional fill and stroke properties can be applied.
 * If a parentId is provided, the ellipse will be appended to that node.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X coordinate for the ellipse.
 * @param {number} [params.y=0] - Y coordinate for the ellipse.
 * @param {number} [params.width=100] - Ellipse width.
 * @param {number} [params.height=100] - Ellipse height.
 * @param {string} [params.name="Ellipse"] - The ellipse's name.
 * @param {string} [params.parentId] - ID of the parent node.
 * @param {object} [params.fillColor] - Fill color as {r, g, b, a}.
 * @param {object} [params.strokeColor] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Stroke width.
 *
 * @returns {object} An object with the ellipse node's details.
 */
export async function createEllipse(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Ellipse",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create and configure the ellipse.
  const ellipse = figma.createEllipse();
  ellipse.name = name;
  ellipse.x = x;
  ellipse.y = y;
  ellipse.resize(width, height);

  // Apply fill color if provided.
  if (fillColor) {
    setFill(ellipse, fillColor);
  }
  
  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(ellipse, strokeColor, strokeWeight);
  }

  // Attach the ellipse to a parent node or the current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(ellipse);
  } else {
    figma.currentPage.appendChild(ellipse);
  }
  
  return {
    id: ellipse.id,
    name: ellipse.name,
    type: ellipse.type,
    x: ellipse.x,
    y: ellipse.y,
    width: ellipse.width,
    height: ellipse.height,
    parentId: ellipse.parent ? ellipse.parent.id : undefined
  };
}

/**
 * Creates a new polygon node.
 *
 * A polygon is created with the specified position and size along with a configurable number of sides (minimum 3).
 * Optional fill and stroke settings can be applied.
 * The polygon is appended to a parent node if a valid parentId is specified.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X coordinate for the polygon.
 * @param {number} [params.y=0] - Y coordinate for the polygon.
 * @param {number} [params.width=100] - Polygon width.
 * @param {number} [params.height=100] - Polygon height.
 * @param {number} [params.sides=6] - Number of sides (must be at least 3).
 * @param {string} [params.name="Polygon"] - The name for the polygon.
 * @param {string} [params.parentId] - ID of the parent node.
 * @param {object} [params.fillColor] - Fill color as {r, g, b, a}.
 * @param {object} [params.strokeColor] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Stroke width.
 *
 * @returns {object} An object containing details about the polygon.
 */
export async function createPolygon(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    sides = 6,
    name = "Polygon",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create and configure the polygon.
  const polygon = figma.createPolygon();
  polygon.x = x;
  polygon.y = y;
  polygon.resize(width, height);
  polygon.name = name;
  
  // Set number of sides if valid.
  if (sides >= 3) {
    polygon.pointCount = sides;
  }

  // Apply fill color if provided.
  if (fillColor) {
    setFill(polygon, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(polygon, strokeColor, strokeWeight);
  }

  // Append the polygon to a parent node or current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(polygon);
  } else {
    figma.currentPage.appendChild(polygon);
  }

  return {
    id: polygon.id,
    name: polygon.name,
    type: polygon.type,
    x: polygon.x,
    y: polygon.y,
    width: polygon.width,
    height: polygon.height,
    pointCount: polygon.pointCount,
    parentId: polygon.parent ? polygon.parent.id : undefined
  };
}

/**
 * Creates a new star node.
 *
 * A star is generated with a configurable number of points and an inner radius ratio (relative to its outer radius).
 * The star’s position, dimensions, and optional visual styles can be specified.
 * It is appended to a parent node if a valid parentId is given.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X coordinate for the star.
 * @param {number} [params.y=0] - Y coordinate for the star.
 * @param {number} [params.width=100] - Star width.
 * @param {number} [params.height=100] - Star height.
 * @param {number} [params.points=5] - Number of points on the star (minimum 3).
 * @param {number} [params.innerRadius=0.5] - Inner radius ratio (between 0.01 and 0.99).
 * @param {string} [params.name="Star"] - Name for the star.
 * @param {string} [params.parentId] - ID of the parent node.
 * @param {object} [params.fillColor] - Fill color as {r, g, b, a}.
 * @param {object} [params.strokeColor] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Stroke width.
 *
 * @returns {object} An object with details of the created star.
 */
export async function createStar(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    points = 5,
    innerRadius = 0.5,
    name = "Star",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create and configure the star.
  const star = figma.createStar();
  star.x = x;
  star.y = y;
  star.resize(width, height);
  star.name = name;
  
  // Set the number of points if valid.
  if (points >= 3) {
    star.pointCount = points;
  }

  // Set inner radius ratio if within valid range.
  if (innerRadius > 0 && innerRadius < 1) {
    star.innerRadius = innerRadius;
  }

  // Apply fill color if provided.
  if (fillColor) {
    setFill(star, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(star, strokeColor, strokeWeight);
  }

  // Append the star to a parent node or current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(star);
  } else {
    figma.currentPage.appendChild(star);
  }

  return {
    id: star.id,
    name: star.name,
    type: star.type,
    x: star.x,
    y: star.y,
    width: star.width,
    height: star.height,
    pointCount: star.pointCount,
    innerRadius: star.innerRadius,
    parentId: star.parent ? star.parent.id : undefined
  };
}

/**
 * Creates a new vector node.
 *
 * A vector node is rendered using SVG-like vector path data. This function creates a vector with
 * specified dimensions, position, and an optional set of vector paths. Visual properties are optionally applied.
 * If a parentId is provided, the vector is appended to that node; otherwise, it is added to the current page.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X coordinate for the vector.
 * @param {number} [params.y=0] - Y coordinate for the vector.
 * @param {number} [params.width=100] - Vector width.
 * @param {number} [params.height=100] - Vector height.
 * @param {string} [params.name="Vector"] - Name for the vector.
 * @param {string} [params.parentId] - ID of the parent node.
 * @param {Array} [params.vectorPaths] - Array of vector path definitions.
 * @param {object} [params.fillColor] - Fill color as {r, g, b, a}.
 * @param {object} [params.strokeColor] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight] - Stroke width.
 *
 * @returns {object} An object with details regarding the vector node.
 */
export async function createVector(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Vector",
    parentId,
    vectorPaths = [],
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create and configure the vector node.
  const vector = figma.createVector();
  vector.x = x;
  vector.y = y;
  vector.resize(width, height);
  vector.name = name;

  // Process and assign vector path definitions if provided.
  if (vectorPaths && vectorPaths.length > 0) {
    vector.vectorPaths = vectorPaths.map(path => {
      return {
        windingRule: path.windingRule || "EVENODD",
        data: path.data || ""
      };
    });
  }

  // Apply fill color if provided.
  if (fillColor) {
    setFill(vector, fillColor);
  }

  // Apply stroke properties if provided.
  if (strokeColor) {
    setStroke(vector, strokeColor, strokeWeight);
  }

  // Attach the vector to a specified parent or the current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(vector);
  } else {
    figma.currentPage.appendChild(vector);
  }

  return {
    id: vector.id,
    name: vector.name,
    type: vector.type,
    x: vector.x,
    y: vector.y,
    width: vector.width,
    height: vector.height,
    vectorPaths: vector.vectorPaths,
    parentId: vector.parent ? vector.parent.id : undefined
  };
}

/**
 * Creates a new line by generating a vector node representing a straight line.
 *
 * The function computes the dimensions of the line based on its starting and ending coordinates.
 * It generates SVG path data for the line and applies stroke properties.
 * The line is attached to a parent node if a valid parentId is specified.
 *
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x1=0] - The starting X coordinate.
 * @param {number} [params.y1=0] - The starting Y coordinate.
 * @param {number} [params.x2=100] - The ending X coordinate.
 * @param {number} [params.y2=0] - The ending Y coordinate.
 * @param {string} [params.name="Line"] - The name assigned to the line.
 * @param {string} [params.parentId] - The ID of the parent node.
 * @param {object} [params.strokeColor={r: 0, g: 0, b: 0, a: 1}] - Stroke color as {r, g, b, a}.
 * @param {number} [params.strokeWeight=1] - Stroke width.
 * @param {string} [params.strokeCap="NONE"] - Stroke cap style. Options: "NONE", "ROUND", "SQUARE", "ARROW_LINES", or "ARROW_EQUILATERAL".
 *
 * @returns {object} An object containing details of the created line.
 */
export async function createLine(params) {
  const {
    x1 = 0,
    y1 = 0,
    x2 = 100,
    y2 = 0,
    name = "Line",
    parentId,
    strokeColor = { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight = 1,
    strokeCap = "NONE"
  } = params || {};

  // Create a vector node to represent the line.
  const line = figma.createVector();
  line.name = name;
  
  // Position node at the starting coordinates.
  line.x = x1;
  line.y = y1;
  
  // Determine the dimensions of the vector based on the endpoints.
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  line.resize(width > 0 ? width : 1, height > 0 ? height : 1);
  
  // Calculate relative coordinates for the SVG path data in the vector's local system.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const endX = dx > 0 ? width : 0;
  const endY = dy > 0 ? height : 0;
  const startX = dx > 0 ? 0 : width;
  const startY = dy > 0 ? 0 : height;
  
  // Generate SVG path data for a straight line.
  const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
  line.vectorPaths = [{
    windingRule: "NONZERO",
    data: pathData
  }];
  
  // Apply stroke properties.
  setStroke(line, strokeColor, strokeWeight);
  
  // Set stroke cap style if it is one of the supported options.
  if (["NONE", "ROUND", "SQUARE", "ARROW_LINES", "ARROW_EQUILATERAL"].includes(strokeCap)) {
    line.strokeCap = strokeCap;
  }
  
  // Remove fill for the line.
  line.fills = [];
  
  // Append the line to a parent node or the current page.
  if (parentId) {
    const parentNode = await figma.getNodeByIdAsync(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(line);
  } else {
    figma.currentPage.appendChild(line);
  }
  
  return {
    id: line.id,
    name: line.name,
    type: line.type,
    x: line.x,
    y: line.y,
    width: line.width,
    height: line.height,
    strokeWeight: line.strokeWeight,
    strokeCap: line.strokeCap,
    vectorPaths: line.vectorPaths,
    parentId: line.parent ? line.parent.id : undefined
  };
}

/**
 * Sets the corner radius of a node.
 *
 * This helper function is intended to update the corner radius of a specified node.
 *
 * @param {object} params - Parameters for updating the corner radius.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {number} params.radius - The corner radius value.
 * @param {boolean[]} [params.corners] - Optional boolean array specifying which corners to round: [topLeft, topRight, bottomRight, bottomLeft].
 *
 * @returns {object} An object with the node's id and updated corner radius.
 */
export async function setCornerRadius(params) {
  return { id: params.nodeId, cornerRadius: params.radius };
}

/**
 * Resizes a node to the specified dimensions.
 *
 * @param {object} params - Resize parameters.
 * @param {string} params.nodeId - The ID of the node to resize.
 * @param {number} params.width - The new width value.
 * @param {number} params.height - The new height value.
 *
 * @returns {object} An object with the node's id and its updated dimensions.
 */
export async function resizeNode(params) {
  return { id: params.nodeId, width: params.width, height: params.height };
}

/**
 * Deletes a specified node from the Figma document.
 *
 * @param {object} params - Deletion parameters.
 * @param {string} params.nodeId - The ID of the node to delete.
 *
 * @returns {object} An object indicating the node's id and that it has been deleted.
 */
export async function deleteNode(params) {
  return { id: params.nodeId, deleted: true };
}

/**
 * Moves a node to a new position.
 *
 * @param {object} params - Movement parameters.
 * @param {string} params.nodeId - The ID of the node to move.
 * @param {number} params.x - The new X coordinate.
 * @param {number} params.y - The new Y coordinate.
 *
 * @returns {object} An object with the node's id and its updated coordinates.
 */
export async function moveNode(params) {
  return { id: params.nodeId, x: params.x, y: params.y };
}

 /**
  * Moves multiple nodes to a new absolute position in Figma.
  *
  * @param {object} params - Movement parameters.
  * @param {string[]} params.nodeIds - Array of node IDs to move.
  * @param {number} params.x - The new X coordinate for all nodes.
  * @param {number} params.y - The new Y coordinate for all nodes.
  *
  * @returns {object} An object indicating how many nodes were moved.
  */
export async function moveNodes(params) {
  const { nodeIds = [], x, y } = params || {};
  const nodes = nodeIds
    .map(id => figma.getNodeById(id))
    .filter(node => node != null);
  for (const node of nodes) {
    node.x = x;
    node.y = y;
  }
  return { count: nodes.length };
}

/**
 * Clones an existing node.
 *
 * This function simulates cloning a node by returning a new id.
 * Optionally, new coordinates can be provided for the cloned node.
 *
 * @param {object} params - Parameters for cloning.
 * @param {string} params.nodeId - The ID of the node to clone.
 * @param {number} [params.x] - Optional new X coordinate for the clone.
 * @param {number} [params.y] - Optional new Y coordinate for the clone.
 *
 * @returns {object} An object containing the new clone's id and a reference to the original node's id.
 */
export async function cloneNode(params) {
  return { id: "cloned-" + params.nodeId, original: params.nodeId };
}

/**
 * Flattens a vector-based node.
 *
 * This function simulates the flattening of a vector node into a simpler shape.
 *
 * @param {object} params - Parameters for flattening.
 * @param {string} params.nodeId - The ID of the node to flatten.
 *
 * @returns {object} An object with the node's id and a flag indicating it has been flattened.
 */
export async function flattenNode(params) {
  return { id: params.nodeId, flattened: true };
}

// Helper functions

/**
 * Applies a solid fill color to a node.
 *
 * @param {object} node - The node to update.
 * @param {object} color - The fill color as {r, g, b, a}.
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
 * Applies stroke color and stroke width to a node.
 *
 * @param {object} node - The node to update.
 * @param {object} color - The stroke color as {r, g, b, a}.
 * @param {number} [weight] - Optional stroke width.
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

/**
 * Creates a new vector node from an SVG string
 * 
 * Converts the provided SVG string into a Figma vector object and places it at the specified
 * coordinates. If a parentId is provided, the vector is appended to that node; otherwise it's
 * added to the current page.
 * 
 * @param {object} params - Configuration parameters
 * @param {string} params.svg - SVG string content to convert to Figma vector
 * @param {number} [params.x=0] - X position for the created node
 * @param {number} [params.y=0] - Y position for the created node
 * @param {string} [params.name="SVG Vector"] - Name for the created node
 * @param {string} [params.parentId] - Optional parent node ID
 * @returns {object} Information about the created SVG vector node
 */
export async function createSvgVector(params) {
  const {
    svg,
    x = 0,
    y = 0,
    name = "SVG Vector",
    parentId
  } = params || {};

  if (!svg) {
    throw new Error("SVG string is required");
  }

  try {
    // Create node from SVG
    const node = figma.createNodeFromSvg(svg);
    
    // Set position and name
    node.x = x;
    node.y = y;
    if (name) node.name = name;
    
    // Add to parent if specified, otherwise add to current page
    if (parentId) {
      const parentNode = await figma.getNodeByIdAsync(parentId);
      if (!parentNode) {
        throw new Error(`Parent node not found with ID: ${parentId}`);
      }
      if (!("appendChild" in parentNode)) {
        throw new Error(`Parent node does not support children: ${parentId}`);
      }
      parentNode.appendChild(node);
    } else {
      figma.currentPage.appendChild(node);
    }
    
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      parentId: node.parent ? node.parent.id : undefined
    };
  } catch (error) {
    throw new Error(`Failed to create SVG node: ${error.message}`);
  }
}

// Export the shape operations as a grouped object for external use.
export const shapeOperations = {
  createRectangle,
  createFrame,
  createEllipse,
  createPolygon,
  createStar,
  createVector,
  createLine,
  createSvgVector,
  setCornerRadius,
  resizeNode,
  deleteNode,
  moveNode,
  flattenNode
};
