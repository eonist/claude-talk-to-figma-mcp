import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates one or more star-shaped nodes in the Figma document.
 *
 * @async
 * @function
 * @param {Object} params - Configuration parameters.
 * @param {Object} [params.star] - Single star config (see below).
 * @param {Array<Object>} [params.stars] - Array of star configs (see below).
 * @param {number} [params.star.x=0] - X position.
 * @param {number} [params.star.y=0] - Y position.
 * @param {number} [params.star.width=100] - Width of the star.
 * @param {number} [params.star.height=100] - Height of the star.
 * @param {number} [params.star.points=5] - Number of star points.
 * @param {number} [params.star.innerRadius=0.5] - Inner radius ratio.
 * @param {string} [params.star.name="Star"] - Name of the star node.
 * @param {string} [params.star.parentId] - Optional parent node ID to append the star.
 * @param {object} [params.star.fillColor] - Optional RGBA fill color.
 * @param {object} [params.star.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.star.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ ids: Array<string> }>} Object with array of created star node IDs.
 * @throws {Error} If neither 'star' nor 'stars' is provided, or if parent is not found.
 * @example
 * const starRes = await createStar({ star: { points:7, innerRadius:0.4 } });
 * const batchRes = await createStar({ stars: [{ points:5 }, { points:6 }] });
 */
export async function createStar(params) {
  let starsArr;
  if (params.stars) {
    starsArr = params.stars;
  } else if (params.star) {
    starsArr = [params.star];
  } else {
    throw new Error("You must provide either 'star' or 'stars' as input.");
  }
  const ids = [];
  for (const cfg of starsArr) {
    const {
      x=0, y=0, width=100, height=100,
      points=5, innerRadius=0.5, name="Star", parentId, fillColor, strokeColor, strokeWeight
    } = cfg||{};
    const star = figma.createStar();
    star.pointCount = points;
    star.innerRadius = innerRadius;
    star.x = x; star.y = y;
    star.resize(width, height);
    star.name = name;
    if (fillColor) setFill(star, fillColor);
    if (strokeColor) setStroke(star, strokeColor, strokeWeight);
    const parent = parentId ? await figma.getNodeByIdAsync(parentId) : figma.currentPage;
    if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
    parent.appendChild(star);
    ids.push(star.id);
  }
  return { ids };
}
