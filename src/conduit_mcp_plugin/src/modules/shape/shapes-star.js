import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates a star-shaped node in the Figma document.
 *
 * @async
 * @function createStar
 * @param {{ x?: number, y?: number, width?: number, height?: number, points?: number, innerRadius?: number, name?: string, parentId?: string, fillColor?: object, strokeColor?: object, strokeWeight?: number }} params
 *   - points: Number of star points (default 5)
 *   - innerRadius: Inner radius ratio (default 0.5)
 * @returns {Promise<{ id: string }>} Created star node ID
 * @example
 * const star = await createStar({ points:7, innerRadius:0.4 });
 * console.log(star.id);
 */
export async function createStar(params) {
  const {
    x=0,y=0,width=100,height=100,
    points=5,innerRadius=0.5,name="Star",parentId,fillColor,strokeColor,strokeWeight
  } = params||{};
  const star = figma.createStar();
  star.pointCount = points;
  star.innerRadius = innerRadius;
  star.x = x; star.y = y;
  star.resize(width,height);
  star.name=name;
  if(fillColor) setFill(star,fillColor);
  if(strokeColor) setStroke(star,strokeColor,strokeWeight);
  const parent= parentId?await figma.getNodeByIdAsync(parentId):figma.currentPage;
  parent.appendChild(star);
  return { id: star.id };
}
