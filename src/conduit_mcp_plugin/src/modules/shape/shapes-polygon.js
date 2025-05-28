import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates one or more polygon nodes in the Figma document.
 *
 * @async
 * @function
 * @param {Object} params - Configuration parameters.
 * @param {Object} [params.polygon] - Single polygon config (see below).
 * @param {Array<Object>} [params.polygons] - Array of polygon configs (see below).
 * @param {number} [params.polygon.x=0] - X position.
 * @param {number} [params.polygon.y=0] - Y position.
 * @param {number} [params.polygon.width=100] - Width of the polygon.
 * @param {number} [params.polygon.height=100] - Height of the polygon.
 * @param {number} [params.polygon.sides=6] - Number of sides.
 * @param {string} [params.polygon.name="Polygon"] - Name of the polygon node.
 * @param {string} [params.polygon.parentId] - Optional parent node ID to append the polygon.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.polygon.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.polygon.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.polygon.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ ids: Array<string> }>} Object with array of created polygon node IDs.
 * @throws {Error} If neither 'polygon' nor 'polygons' is provided, or if parent is not found.
 * 
 * @example
 * // Create a pentagon
 * const polyRes = await createPolygon({ polygon: { x: 10, y: 10, width: 80, height: 80, sides: 5 } });
 * 
 * // Create multiple polygons
 * const batchRes = await createPolygon({ polygons: [{ sides: 3 }, { sides: 4 }] });
 * 
 * @see {@link MCP_COMMANDS.CREATE_POLYGON}
 * @since 1.0.0
 */
export async function createPolygon(params) {
  let polygonsArr;
  if (params.polygons) {
    polygonsArr = params.polygons;
  } else if (params.polygon) {
    polygonsArr = [params.polygon];
  } else {
    throw new Error("You must provide either 'polygon' or 'polygons' as input.");
  }
  const ids = [];
  for (const cfg of polygonsArr) {
    const {
      x = 0, y = 0, width = 100, height = 100,
      sides = 6, name="Polygon", parentId, fillColor, strokeColor, strokeWeight
    } = cfg || {};
    const poly = figma.createPolygon();
    poly.pointCount = sides;
    poly.x = x; poly.y = y;
    poly.resize(width, height);
    poly.name = name;
    if (fillColor) setFill(poly, fillColor);
    if (strokeColor) setStroke(poly, strokeColor, strokeWeight);
    const parent = parentId
      ? await figma.getNodeByIdAsync(parentId)
      : figma.currentPage;
    parent.appendChild(poly);
    ids.push(poly.id);
  }
  return { ids };
}
