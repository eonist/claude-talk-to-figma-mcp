// Shapes module
import { customBase64Encode } from './utils.js';

/**
 * Creates a new rectangle in the Figma document.
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

// Other shape operations (simplified with mock responses for some)
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

export async function createEllipse(params) {
  const name = params && params.name ? params.name : "Ellipse";
  return { id: "ellipse-mock-id", name: name };
}

export async function createPolygon(params) {
  const name = params && params.name ? params.name : "Polygon";
  return { id: "polygon-mock-id", name: name };
}

export async function createStar(params) {
  const name = params && params.name ? params.name : "Star";
  return { id: "star-mock-id", name: name };
}

export async function createVector(params) {
  const name = params && params.name ? params.name : "Vector";
  return { id: "vector-mock-id", name: name };
}

export async function createLine(params) {
  const name = params && params.name ? params.name : "Line";
  return { id: "line-mock-id", name: name };
}

export async function setCornerRadius(params) {
  return { id: params.nodeId, cornerRadius: params.radius };
}

export async function resizeNode(params) {
  return { id: params.nodeId, width: params.width, height: params.height };
}

export async function deleteNode(params) {
  return { id: params.nodeId, deleted: true };
}

export async function moveNode(params) {
  return { id: params.nodeId, x: params.x, y: params.y };
}

export async function cloneNode(params) {
  return { id: "cloned-" + params.nodeId, original: params.nodeId };
}

export async function flattenNode(params) {
  return { id: params.nodeId, flattened: true };
}

// Helper functions
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
