/**
 * Shapes operations module.
 * Provides functions to create and manipulate geometric nodes in Figma via MCP.
 *
 * Exposed functions:
 * - createRectangle({ rectangle } | { rectangles }): Promise<{ ids: string[] }>
 * - createFrame({ frame } | { frames }): Promise<{ ids: string[] }>
 * - createEllipse({ ellipse } | { ellipses }): Promise<{ ids: string[] }>
 * - createPolygon({ polygon } | { polygons }): Promise<{ ids: string[] }>
 * - createLine({ line } | { lines }): Promise<{ ids: string[] }>
 * - createStar(params): Promise<{ id: string }>
 * - createVector(params): Promise<{ id: string }>
 * - createVectors(params): Promise<{ ids: string[] }>
 * - setCornerRadius(params): Promise<{ success: boolean }> (works on rectangle and frame nodes)
 *
 * @example
 * import { shapeOperations } from './modules/shapes.js';
 * const rect = await shapeOperations.createRectangle({ x: 10, y: 20, width: 50, height: 50 });
 * console.log('Created rectangle', rect);
 */

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

/**
 * Creates a new frame node in the Figma document.
 * @async
 * @function createFrame
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X position.
 * @param {number} [params.y=0] - Y position.
 * @param {number} [params.width=100] - Width of the frame.
 * @param {number} [params.height=100] - Height of the frame.
 * @param {string} [params.name="Frame"] - Name of the frame node.
 * @param {string} [params.parentId] - Optional parent node ID to append the frame.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ id: string, name: string, width: number, height: number }>}
 * @example
 * const frameResult = await createFrame({ x: 10, y: 10, width: 200, height: 150 });
 */
export async function createFrame(params) {
  let framesArr;
  if (params.frames) {
    framesArr = params.frames;
  } else if (params.frame) {
    framesArr = [params.frame];
  } else {
    throw new Error("You must provide either 'frame' or 'frames' as input.");
  }
  const ids = [];
  for (const cfg of framesArr) {
    const {
      x = 0, y = 0, width = 100, height = 100,
      name = "Frame", parentId, fillColor, strokeColor, strokeWeight
    } = cfg || {};

    const frame = figma.createFrame();
    frame.x = x; frame.y = y;
    frame.resize(width, height);
    frame.name = name;

    if (fillColor) setFill(frame, fillColor);
    if (strokeColor) setStroke(frame, strokeColor, strokeWeight);

    const parent = parentId
      ? await figma.getNodeByIdAsync(parentId)
      : figma.currentPage;
    if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
    parent.appendChild(frame);

    ids.push(frame.id);
  }
  return { ids };
}

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

/**
 * Creates a polygon.
 */
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

/**
 * Creates a star.
 */
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

/**
 * Creates a vector node.
 */
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
 * Batch vectors.
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

/**
 * Creates a line.
 */
/**
 * Creates a line in the Figma document.
 *
 * @async
 * @function createLine
 * @param {{ x1?: number, y1?: number, x2?: number, y2?: number, strokeColor?: object, strokeWeight?: number, name?: string, parentId?: string }} params
 * @returns {Promise<{ id: string }>} Created line node ID
 * @example
 * const line = await createLine({ x1:0, y1:0, x2:100, y2:0 });
 * console.log(line.id);
 */
export async function createLine(params) {
  let linesArr;
  if (params.lines) {
    linesArr = params.lines;
  } else if (params.line) {
    linesArr = [params.line];
  } else {
    throw new Error("You must provide either 'line' or 'lines' as input.");
  }
  const ids = [];
  for (const cfg of linesArr) {
    const { x1=0,y1=0,x2=100,y2=0,strokeColor={r:0,g:0,b:0,a:1},strokeWeight=1,name="Line",parentId } = cfg||{};
    const line = figma.createVector();
    line.vectorPaths=[{ windingRule:"NONZERO", data:`M0,0 L${x2-x1},${y2-y1}` }];
    line.strokeCap="NONE";
    if(strokeColor) setStroke(line,strokeColor,strokeWeight);
    const parent= parentId?await figma.getNodeByIdAsync(parentId): figma.currentPage;
    parent.appendChild(line);
    ids.push(line.id);
  }
  return { ids };
}


/**
 * Helper: Applies a solid fill color to a node.
 *
 * @param {SceneNode} node - The Figma node to style.
 * @param {{ r: number, g: number, b: number, a?: number }} color - RGBA color.
 * @example
 * setFill(rect, { r:1, g:0, b:0 });
 */
function setFill(node, color) {
  node.fills=[{ type:"SOLID", color:{ r:color.r, g:color.g, b:color.b }, opacity:color.a||1 }];
}

/**
 * Helper: Applies a solid stroke color and weight to a node.
 *
 * @param {SceneNode} node - The Figma node to style.
 * @param {{ r: number, g: number, b: number, a?: number }} color - RGBA color.
 * @param {number} [weight] - Stroke weight.
 * @example
 * setStroke(rect, { r:0, g:0, b:1 }, 2);
 */
function setStroke(node, color, weight) {
  node.strokes=[{ type:"SOLID", color:{ r:color.r, g:color.g, b:color.b }, opacity:color.a||1 }];
  if(weight!==undefined) node.strokeWeight=weight;
}

export const shapeOperations = {
  createRectangle,
  createFrame,
  createEllipse,
  createPolygon,
  createStar,
  createVector,
  createVectors,
  createLine
  // Note: If any legacy batch/single functions remain, remove them.
};
