import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates one or more vector nodes in the Figma document.
 *
 * @async
 * @function
 * @param {Object} params - Configuration parameters.
 * @param {Object} [params.vector] - Single vector config (see below).
 * @param {Array<Object>} [params.vectors] - Array of vector configs (see below).
 * @param {number} [params.vector.x=0] - X position.
 * @param {number} [params.vector.y=0] - Y position.
 * @param {number} [params.vector.width=100] - Width of the vector.
 * @param {number} [params.vector.height=100] - Height of the vector.
 * @param {Array<Object>} [params.vector.vectorPaths=[]] - Array of vector path objects.
 * @param {string} [params.vector.name="Vector"] - Name of the vector node.
 * @param {string} [params.vector.parentId] - Optional parent node ID to append the vector.
 * @param {object} [params.vector.fillColor] - Optional RGBA fill color.
 * @param {object} [params.vector.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.vector.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ ids: Array<string> }>} Object with array of created vector node IDs.
 * @throws {Error} If parent is not found.
 * @example
 * const vecRes = await createVector({ vector: { vectorPaths: [{ data: 'M0,0 L10,10' }] } });
 * const batchRes = await createVector({ vectors: [{ vectorPaths: [...] }, { vectorPaths: [...] }] });
 */
export async function createVector(params) {
  // Single vector creation (legacy signature)
  if (!params || (!params.vector && !params.vectors)) {
    // fallback to legacy single config
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
    return { ids: [vec.id] };
  }
  // Batch support
  let vectorsArr;
  if (params.vectors) {
    vectorsArr = params.vectors;
  } else if (params.vector) {
    vectorsArr = [params.vector];
  } else {
    throw new Error("You must provide either 'vector' or 'vectors' as input.");
  }
  const ids = [];
  for (const cfg of vectorsArr) {
    const {
      x=0,y=0,width=100,height=100,
      vectorPaths=[],name="Vector",parentId,fillColor,strokeColor,strokeWeight
    } = cfg||{};
    const vec = figma.createVector();
    vec.x = x; vec.y = y;
    vec.resize(width, height);
    vec.vectorPaths = vectorPaths;
    vec.name = name;
    if (fillColor) setFill(vec, fillColor);
    if (strokeColor) setStroke(vec, strokeColor, strokeWeight);
    const parent = parentId ? await figma.getNodeByIdAsync(parentId) : figma.currentPage;
    if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
    parent.appendChild(vec);
    ids.push(vec.id);
  }
  return { ids };
}

/**
 * Batch create vectors.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for batch vector creation.
 * @param {Array<Object>} params.vectors - Array of vector configs (see createVector for config shape).
 * @returns {Promise<{ ids: Array<string> }>} Object with array of created vector node IDs.
 * @throws {Error} If a vector config is invalid or parent is not found.
 */
export async function createVectors(params) {
  const { vectors = [] } = params||{};
  const ids=[];
  for(const cfg of vectors){
    const res=await createVector(cfg);
    ids.push(...(res.ids || []));
  }
  return { ids };
}
