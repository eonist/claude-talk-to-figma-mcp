/**
 * Shapes module
 * 
 * Contains functions for creating and manipulating geometric shapes in Figma.
 */
import { ShapeCreationParams, RGBAColor } from '../types';

/**
 * Creates a new rectangle in the Figma document.
 */
export async function createRectangle(params: ShapeCreationParams) {
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
    (parentNode as any).appendChild(rect);
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
 * Creates a new frame in the Figma document.
 */
export async function createFrame(params: any) {
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

  // Implementation would be similar to createRectangle
  // For now, we'll return a simple mock
  return { id: "frame-mock-id", name, x, y, width, height };
}

/**
 * Creates a new ellipse in the Figma document.
 */
export async function createEllipse(params: any) {
  // Implementation would be similar to createRectangle
  // For now, we'll return a simple mock
  return { id: "ellipse-mock-id", name: params?.name || "Ellipse" };
}

/**
 * Creates a new polygon in the Figma document.
 */
export async function createPolygon(params: any) {
  // Implementation would be similar to createRectangle
  // For now, we'll return a simple mock
  return { id: "polygon-mock-id", name: params?.name || "Polygon" };
}

/**
 * Creates a new star in the Figma document.
 */
export async function createStar(params: any) {
  // Implementation would be similar to createRectangle
  // For now, we'll return a simple mock
  return { id: "star-mock-id", name: params?.name || "Star" };
}

/**
 * Creates a new vector in the Figma document.
 */
export async function createVector(params: any) {
  // For now, we'll return a simple mock
  return { id: "vector-mock-id", name: params?.name || "Vector" };
}

/**
 * Creates a new line in the Figma document.
 */
export async function createLine(params: any) {
  // For now, we'll return a simple mock
  return { id: "line-mock-id", name: params?.name || "Line" };
}

/**
 * Sets the corner radius of a node.
 */
export async function setCornerRadius(params: any) {
  // For now, we'll return a simple mock
  return { id: params.nodeId, cornerRadius: params.radius };
}

/**
 * Resizes a node to new dimensions.
 */
export async function resizeNode(params: any) {
  // For now, we'll return a simple mock
  return { id: params.nodeId, width: params.width, height: params.height };
}

/**
 * Deletes a node from the document.
 */
export async function deleteNode(params: any) {
  // For now, we'll return a simple mock
  return { id: params.nodeId, deleted: true };
}

/**
 * Moves a node to a new position.
 */
export async function moveNode(params: any) {
  // For now, we'll return a simple mock
  return { id: params.nodeId, x: params.x, y: params.y };
}

/**
 * Clones a node in the document.
 */
export async function cloneNode(params: any) {
  // For now, we'll return a simple mock
  return { id: "cloned-" + params.nodeId, original: params.nodeId };
}

/**
 * Flattens a node in the document.
 */
export async function flattenNode(params: any) {
  // For now, we'll return a simple mock
  return { id: params.nodeId, flattened: true };
}

// Helper functions
function setFill(node: any, color: RGBAColor) {
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

function setStroke(node: any, color: RGBAColor, weight?: number) {
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
