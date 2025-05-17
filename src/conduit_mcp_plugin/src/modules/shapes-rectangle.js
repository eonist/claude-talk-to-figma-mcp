import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates a new rectangle node in the Figma document.
 * @async
 * @function createRectangle
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X position.
 * @param {number} [params.y=0] - Y position.
 * @param {number} [params.width=100] - Width of the rectangle.
 * @param {number} [params.height=100] - Height of the rectangle.
 * @param {string} [params.name="Rectangle"] - Name of the rectangle node.
 * @param {string} [params.parentId] - Optional parent node ID to append the rectangle.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ id: string, name: string, x: number, y: number, width: number, height: number }>}
 * @example
 * const result = await createRectangle({ x: 0, y: 0, width: 100, height: 100 });
 */
export async function createRectangle(params) {
  let rectanglesArr;
  if (params.rectangles) {
    rectanglesArr = params.rectangles;
  } else if (params.rectangle) {
    rectanglesArr = [params.rectangle];
  } else {
    throw new Error("You must provide either 'rectangle' or 'rectangles' as input.");
  }
  const ids = [];
  for (const cfg of rectanglesArr) {
    const {
      x = 0, y = 0, width = 100, height = 100,
      name = "Rectangle", parentId, fillColor, strokeColor, strokeWeight
    } = cfg || {};

    const rect = figma.createRectangle();
    rect.x = x; rect.y = y;
    rect.resize(width, height);
    rect.name = name;

    if (fillColor) setFill(rect, fillColor);
    if (strokeColor) setStroke(rect, strokeColor, strokeWeight);

    const parent = parentId
      ? await figma.getNodeByIdAsync(parentId)
      : figma.currentPage;
    if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
    parent.appendChild(rect);

    ids.push(rect.id);
  }
  return { ids };
}
