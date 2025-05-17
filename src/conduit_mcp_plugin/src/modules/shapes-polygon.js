import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates a polygon node in the Figma document.
 *
 * @async
 * @function createPolygon
 * @param {{ x?: number, y?: number, width?: number, height?: number, sides?: number, name?: string, parentId?: string, fillColor?: {r:number,g:number,b:number,a?:number}, strokeColor?: {r:number,g:number,b:number,a?:number}, strokeWeight?: number }} params
 *   - x: X position (default 0)
 *   - y: Y position (default 0)
 *   - width: Width of polygon (default 100)
 *   - height: Height of polygon (default 100)
 *   - sides: Number of sides (default 6)
 *   - name: Node name (default "Polygon")
 *   - parentId: Optional parent node ID
 *   - fillColor: Optional fill color
 *   - strokeColor: Optional stroke color
 *   - strokeWeight: Optional stroke weight
 * @returns {Promise<{ id: string }>} Created polygon node ID
 * @example
 * const poly = await createPolygon({ x:10, y:10, width:80, height:80, sides:5 });
 * console.log(poly.id);
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
