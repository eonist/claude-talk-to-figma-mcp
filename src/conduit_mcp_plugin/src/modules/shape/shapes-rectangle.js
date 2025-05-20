import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates one or more rectangle nodes in the Figma document.
 *
 * @async
 * @function
 * @param {Object} params - Configuration parameters.
 * @param {Object} [params.rectangle] - Single rectangle config (see below).
 * @param {Array<Object>} [params.rectangles] - Array of rectangle configs (see below).
 * @param {number} [params.rectangle.x=0] - X position.
 * @param {number} [params.rectangle.y=0] - Y position.
 * @param {number} [params.rectangle.width=100] - Width of the rectangle.
 * @param {number} [params.rectangle.height=100] - Height of the rectangle.
 * @param {string} [params.rectangle.name="Rectangle"] - Name of the rectangle node.
 * @param {string} [params.rectangle.parentId] - Optional parent node ID to append the rectangle.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.rectangle.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.rectangle.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.rectangle.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ ids: Array<string> }>} Object with array of created rectangle node IDs.
 * @throws {Error} If neither 'rectangle' nor 'rectangles' is provided, or if parent is not found.
 * @example
 * const result = await createRectangle({ rectangle: { x: 0, y: 0, width: 100, height: 100 } });
 * const batchResult = await createRectangle({ rectangles: [{ width: 50 }, { width: 60 }] });
 */
export async function createRectangle(params) {
  console.log("💥 PLUGIN createRectangle params:", params);
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
    console.log("💥 PLUGIN createRectangle cfg:", cfg);
    const {
      x = 0, y = 0, width = 100, height = 100,
      name = "Rectangle", parentId, fillColor, strokeColor, strokeWeight
    } = cfg || {};

    const rect = figma.createRectangle();
    rect.x = x; rect.y = y;
    rect.resize(width, height);
    rect.name = name;

    if (typeof cfg.cornerRadius === "number") {
      console.log("💥 PLUGIN: Applying cornerRadius:", cfg.cornerRadius);
      rect.cornerRadius = cfg.cornerRadius;
    } else {
      console.log("💥 PLUGIN: No valid cornerRadius provided, value is:", cfg.cornerRadius);
    }

    // Fill color validation and application
    if (
      fillColor &&
      typeof fillColor === "object" &&
      typeof fillColor.r === "number" &&
      typeof fillColor.g === "number" &&
      typeof fillColor.b === "number"
    ) {
      console.log("💥 PLUGIN: Applying fillColor:", fillColor);
      setFill(rect, fillColor);
    } else if (fillColor) {
      console.warn("💥 PLUGIN: Invalid fillColor provided:", fillColor);
    }

    // Stroke color and weight validation and application
    if (
      strokeColor &&
      typeof strokeColor === "object" &&
      typeof strokeColor.r === "number" &&
      typeof strokeColor.g === "number" &&
      typeof strokeColor.b === "number"
    ) {
      if (typeof strokeWeight === "number") {
        console.log("💥 PLUGIN: Applying strokeColor and strokeWeight:", strokeColor, strokeWeight);
        setStroke(rect, strokeColor, strokeWeight);
      } else {
        console.log("💥 PLUGIN: Applying strokeColor (no valid strokeWeight):", strokeColor);
        setStroke(rect, strokeColor);
      }
    } else if (strokeColor) {
      console.warn("💥 PLUGIN: Invalid strokeColor provided:", strokeColor);
    }

    const parent = parentId
      ? await figma.getNodeByIdAsync(parentId)
      : figma.currentPage;
    if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
    parent.appendChild(rect);

    ids.push(rect.id);
  }
  return { ids };
}
