// Shapes module
// Helper functions for creating and manipulating shape nodes in a Figma document

/**
 * Creates a new rectangle node in the Figma document.
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0]
 * @param {number} [params.y=0]
 * @param {number} [params.width=100]
 * @param {number} [params.height=100]
 * @param {string} [params.name="Rectangle"]
 * @param {string} [params.parentId]
 * @param {object} [params.fillColor]
 * @param {object} [params.strokeColor]
 * @param {number} [params.strokeWeight]
 * @returns {object}
 */
export async function createRectangle(params) {
  const {
    x = 0, y = 0, width = 100, height = 100,
    name = "Rectangle", parentId, fillColor, strokeColor, strokeWeight
  } = params || {};

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

  return { id: rect.id, name: rect.name, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

/**
 * Batch create rectangles.
 */
export async function createRectangles(params) {
  const { rectangles = [] } = params || {};
  const ids = [];
  for (const cfg of rectangles) {
    const res = await createRectangle(cfg);
    ids.push(res.id);
  }
  return { ids };
}

/**
 * Creates a new frame node.
 */
export async function createFrame(params) {
  const {
    x = 0, y = 0, width = 100, height = 100,
    name = "Frame", parentId, fillColor, strokeColor, strokeWeight
  } = params || {};

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

  return { id: frame.id, name: frame.name, width: frame.width, height: frame.height };
}

/**
 * Batch create frames.
 */
export async function createFrames(params) {
  const { frames = [] } = params || {};
  const ids = [];
  for (const cfg of frames) {
    const res = await createFrame(cfg);
    ids.push(res.id);
  }
  return { ids };
}

/**
 * Creates an ellipse.
 */
export async function createEllipse(params) {
  const {
    x = 0, y = 0, width = 100, height = 100,
    name = "Ellipse", parentId, fillColor, strokeColor, strokeWeight
  } = params || {};

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

  return { id: ellipse.id };
}

/**
 * Batch ellipses.
 */
export async function createEllipses(params) {
  const { ellipses = [] } = params || {};
  const ids = [];
  for (const cfg of ellipses) {
    const res = await createEllipse(cfg);
    ids.push(res.id);
  }
  return { ids };
}

/**
 * Creates a polygon.
 */
export async function createPolygon(params) {
  const {
    x = 0, y = 0, width = 100, height = 100,
    sides = 6, name="Polygon", parentId, fillColor, strokeColor, strokeWeight
  } = params || {};
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
  return { id: poly.id };
}

/**
 * Batch polygons.
 */
export async function createPolygons(params) {
  const { polygons = [] } = params || {};
  const ids = [];
  for (const cfg of polygons) {
    const res = await createPolygon(cfg);
    ids.push(res.id);
  }
  return { ids };
}

/**
 * Creates a star.
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
 * Creates a line.
 */
export async function createLine(params) {
  const { x1=0,y1=0,x2=100,y2=0,strokeColor={r:0,g:0,b:0,a:1},strokeWeight=1,name="Line",parentId } = params||{};
  const line = figma.createVector();
  line.vectorPaths=[{ windingRule:"NONZERO", data:`M0,0 L${x2-x1},${y2-y1}` }];
  line.strokeCap="NONE";
  if(strokeColor) setStroke(line,strokeColor,strokeWeight);
  const parent= parentId?await figma.getNodeByIdAsync(parentId): figma.currentPage;
  parent.appendChild(line);
  return { id: line.id };
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
 * Batch lines.
 */
export async function createLines(params) {
  const { lines=[] } = params||{};
  const ids=[];
  for(const cfg of lines){
    const res=await createLine(cfg);
    ids.push(res.id);
  }
  return { ids };
}


// Helper functions

function setFill(node, color) {
  node.fills=[{ type:"SOLID", color:{ r:color.r, g:color.g, b:color.b }, opacity:color.a||1 }];
}

function setStroke(node, color, weight) {
  node.strokes=[{ type:"SOLID", color:{ r:color.r, g:color.g, b:color.b }, opacity:color.a||1 }];
  if(weight!==undefined) node.strokeWeight=weight;
}

/**
 * Registry of available shape operations for the plugin.
 */
export const shapeOperations = {
  createRectangle,
  createRectangles,
  createFrame,
  createFrames,
  createEllipse,
  createEllipses,
  createPolygon,
  createPolygons,
  createStar,
  createVector,
  createVectors,
  createLine,
  createLines
};
