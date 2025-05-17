/**
 * Helper functions for shape styling in Figma.
 * Provides setFill and setStroke utilities for geometric nodes.
 */

/**
 * Applies a solid fill color to a node.
 *
 * @param {SceneNode} node - The Figma node to style.
 * @param {{ r: number, g: number, b: number, a?: number }} color - RGBA color.
 * @example
 * setFill(rect, { r:1, g:0, b:0 });
 */
export function setFill(node, color) {
  node.fills = [{
    type: "SOLID",
    color: { r: color.r, g: color.g, b: color.b },
    opacity: color.a || 1
  }];
}

/**
 * Applies a solid stroke color and weight to a node.
 *
 * @param {SceneNode} node - The Figma node to style.
 * @param {{ r: number, g: number, b: number, a?: number }} color - RGBA color.
 * @param {number} [weight] - Stroke weight.
 * @example
 * setStroke(rect, { r:0, g:0, b:1 }, 2);
 */
export function setStroke(node, color, weight) {
  node.strokes = [{
    type: "SOLID",
    color: { r: color.r, g: color.g, b: color.b },
    opacity: color.a || 1
  }];
  if (weight !== undefined) node.strokeWeight = weight;
}
