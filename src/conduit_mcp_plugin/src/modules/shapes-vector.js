import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates a vector node with specified vectorPaths.
 *
 * @async
 * @function createVector
 * @param {{ x?: number, y?: number, width?: number, height?: number, vectorPaths?: Array<object>, name?: string, parentId?: string, fillColor?: object, strokeColor?: object, strokeWeight?: number }} params
 * @returns {Promise<{ id: string }>} Created vector node ID
 * @example
 * const vec = await createVector({ vectorPaths: [{ data: 'M0,0 L10,10' }] });
 * console.log(vec.id);
 */
export async function createVector(params) {
  const {
    x=0,y=0,width=100,height=100,
    vectorPaths=[],name="Vector",parentId,fillColor,strokeColor,strokeWeight
  } = params||{};
  const vec = figma.createVector();
  vec.x = x; vec.y = y;
  vec.resize(width, height);
  vec.vectorPaths = vectorPaths;
  vec.name = name;
  if (fillColor) setFill(vec, fillColor);
  if (strokeColor) setStroke(vec, strokeColor, strokeWeight);
  const parent = parentId ? await figma.getNodeByIdAsync(parentId) : figma.currentPage;
  parent.appendChild(vec);
  return { id: vec.id };
}

/**
 * Batch create vectors.
 */
export async function createVectors(params) {
  const { vectors = [] } = params||{};
  const ids=[];
  for(const cfg of vectors){
    const res=await createVector(cfg);
    ids.push(res.id);
  }
  return { ids };
}
