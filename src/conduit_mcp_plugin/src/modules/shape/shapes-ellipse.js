import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates a new ellipse node in the Figma document.
 * @async
 * @function createEllipse
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X position.
 * @param {number} [params.y=0] - Y position.
 * @param {number} [params.width=100] - Width of the ellipse.
 * @param {number} [params.height=100] - Height of the ellipse.
 * @param {string} [params.name="Ellipse"] - Name of the ellipse node.
 * @param {string} [params.parentId] - Optional parent node ID to append the ellipse.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ id: string }>}
 * @example
 * const ellipseRes = await createEllipse({ width: 80, height: 80 });
 */
export async function createEllipse(params) {
  let ellipsesArr;
  if (params.ellipses) {
    ellipsesArr = params.ellipses;
  } else if (params.ellipse) {
    ellipsesArr = [params.ellipse];
  } else {
    throw new Error("You must provide either 'ellipse' or 'ellipses' as input.");
  }
  const ids = [];
  for (const cfg of ellipsesArr) {
    const {
      x = 0, y = 0, width = 100, height = 100,
      name = "Ellipse", parentId, fillColor, strokeColor, strokeWeight
    } = cfg || {};

    const ellipse = figma.createEllipse();
    ellipse.x = x; ellipse.y = y;
    ellipse.resize(width, height);
    ellipse.name = name;

    if (fillColor) setFill(ellipse, fillColor);
    if (strokeColor) setStroke(ellipse, strokeColor, strokeWeight);

    const parent = parentId
      ? await figma.getNodeByIdAsync(parentId)
      : figma.currentPage;
    if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
    parent.appendChild(ellipse);

    ids.push(ellipse.id);
  }
  return { ids };
}
