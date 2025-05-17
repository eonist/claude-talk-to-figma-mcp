import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates one or more ellipse nodes in the Figma document.
 *
 * @async
 * @function
 * @param {Object} params - Configuration parameters.
 * @param {Object} [params.ellipse] - Single ellipse config (see below).
 * @param {Array<Object>} [params.ellipses] - Array of ellipse configs (see below).
 * @param {number} [params.ellipse.x=0] - X position.
 * @param {number} [params.ellipse.y=0] - Y position.
 * @param {number} [params.ellipse.width=100] - Width of the ellipse.
 * @param {number} [params.ellipse.height=100] - Height of the ellipse.
 * @param {string} [params.ellipse.name="Ellipse"] - Name of the ellipse node.
 * @param {string} [params.ellipse.parentId] - Optional parent node ID to append the ellipse.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.ellipse.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.ellipse.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.ellipse.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ ids: Array<string> }>} Object with array of created ellipse node IDs.
 * @throws {Error} If neither 'ellipse' nor 'ellipses' is provided, or if parent is not found.
 * @example
 * const ellipseRes = await createEllipse({ ellipse: { width: 80, height: 80 } });
 * const batchRes = await createEllipse({ ellipses: [{ width: 50 }, { width: 60 }] });
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
