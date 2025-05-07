/**
 * Shapes operations module.
 * Provides functions to create and manipulate geometric nodes in Figma via MCP.
 *
 * Exposed functions:
 * - createRectangle(params): Promise<{ id, name, x, y, width, height }>
 * - createRectangles(params): Promise<{ ids: string[] }>
 * - createFrame(params): Promise<{ id, name, width, height }>
 * - createFrames(params): Promise<{ ids: string[] }>
 * - createEllipse(params): Promise<{ id: string }>
 * - createEllipses(params): Promise<{ ids: string[] }>
 * - createPolygon(params): Promise<{ id: string }>
 * - createPolygons(params): Promise<{ ids: string[] }>
 * - createStar(params): Promise<{ id: string }>
 * - createVector(params): Promise<{ id: string }>
 * - createVectors(params): Promise<{ ids: string[] }>
 * - createLine(params): Promise<{ id: string }>
 * - createLines(params): Promise<{ ids: string[] }>
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
 * Batch creates multiple rectangle nodes.
 * @async
 * @function createRectangles
 * @param {object} params - Parameters object.
 * @param {Array<object>} [params.rectangles] - Array of rectangle configuration objects.
 * @returns {Promise<{ ids: string[] }>} Created rectangle node IDs.
 * @example
 * const { ids } = await createRectangles({ rectangles: [ { x:0, y:0, width:50, height:50 } ] });
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
 * Batch creates multiple frame nodes.
 * @async
 * @function createFrames
 * @param {object} params - Parameters object.
 * @param {Array<object>} [params.frames] - Array of frame configuration objects.
 * @returns {Promise<{ ids: string[] }>} Created frame node IDs.
 * @example
 * const { ids } = await createFrames({ frames: [ { width:100, height:100 } ] });
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
 * @async
 * @function createEllipses
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
/**
 * Batch creates multiple polygon nodes.
 *
 * @async
 * @function createPolygons
 * @param {{ polygons?: Array<object> }} params - Contains array of polygon configs.
 * @returns {Promise<{ ids: string[] }>} Array of created polygon IDs.
 * @example
 * const { ids } = await createPolygons({ polygons: [{ width:50, height:50 }] });
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
/**
 * Batch creates multiple lines.
 *
 * @async
 * @function createLines
 * @param {{ lines?: Array<object> }} params - Contains array of line configs.
 * @returns {Promise<{ ids: string[] }>} Created line IDs.
 * @example
 * const { ids } = await createLines({ lines: [{ x1:0, y1:0, x2:50, y2:50 }] });
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

/**
 * Sets the corner radius of a rectangle node
 * @async
 * @function setCornerRadius
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to modify
 * @param {number} params.radius - Corner radius value
 * @param {Array<boolean>} [params.corners] - Optional array of 4 booleans to specify which corners to round
 * @returns {Promise<{success: boolean}>}
 * @example
 * const result = await setCornerRadius({ nodeId: 'rect-id', radius: 8 });
 */
export async function setCornerRadius(params) {
  const { nodeId, radius, corners } = params;
  const node = figma.getNodeById(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  if (node.type !== 'RECTANGLE') {
    throw new Error('Corner radius can only be set on rectangle nodes');
  }
  
  if (corners && corners.length === 4) {
    // Set individual corners
    node.topLeftRadius = corners[0] ? radius : 0;
    node.topRightRadius = corners[1] ? radius : 0;
    node.bottomRightRadius = corners[2] ? radius : 0;
    node.bottomLeftRadius = corners[3] ? radius : 0;
  } else {
    // Set all corners uniformly
    node.cornerRadius = radius;
  }
  
  return { success: true };
}

/**
 * Resizes a node to the specified dimensions
 * @async
 * @function resizeNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to resize
 * @param {number} params.width - New width
 * @param {number} params.height - New height
 * @returns {Promise<{success: boolean}>}
 */
export async function resizeNode(params) {
  const { nodeId, width, height } = params;
  const node = figma.getNodeById(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  node.resize(width, height);
  return { success: true };
}

/**
 * Resizes multiple nodes to the same dimensions
 * @async
 * @function resizeNodes
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to resize
 * @param {object} params.targetSize - Target dimensions
 * @param {number} params.targetSize.width - New width
 * @param {number} params.targetSize.height - New height
 * @returns {Promise<{success: boolean, resized: number}>}
 */
export async function resizeNodes(params) {
  const { nodeIds, targetSize } = params;
  let resized = 0;
  
  for (const id of nodeIds) {
    const node = figma.getNodeById(id);
    if (node) {
      node.resize(targetSize.width, targetSize.height);
      resized++;
    }
  }
  
  return { success: true, resized };
}

/**
 * Deletes a node from the document
 * @async
 * @function deleteNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to delete
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteNode(params) {
  const { nodeId } = params;
  const node = figma.getNodeById(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  node.remove();
  return { success: true };
}

/**
 * Deletes multiple nodes from the document
 * @async
 * @function deleteNodes
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to delete
 * @returns {Promise<{success: string[], failed: string[]}>}
 */
export async function deleteNodes(params) {
  const { nodeIds } = params;
  const success = [];
  const failed = [];
  
  for (const id of nodeIds) {
    const node = figma.getNodeById(id);
    if (node) {
      node.remove();
      success.push(id);
    } else {
      failed.push(id);
    }
  }
  
  return { success, failed };
}

/**
 * Moves a node to a new position
 * @async
 * @function moveNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to move
 * @param {number} params.x - New X position
 * @param {number} params.y - New Y position
 * @returns {Promise<{success: boolean}>}
 */
export async function moveNode(params) {
  const { nodeId, x, y } = params;
  const node = figma.getNodeById(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  node.x = x;
  node.y = y;
  return { success: true };
}

/**
 * Moves multiple nodes to a new position
 * @async
 * @function moveNodes
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to move
 * @param {number} params.x - New X position
 * @param {number} params.y - New Y position
 * @returns {Promise<{success: boolean, moved: number}>}
 */
export async function moveNodes(params) {
  const { nodeIds, x, y } = params;
  let moved = 0;
  
  for (const id of nodeIds) {
    const node = figma.getNodeById(id);
    if (node) {
      node.x = x;
      node.y = y;
      moved++;
    }
  }
  
  return { success: true, moved };
}

/**
 * Flattens a node
 * @async
 * @function flattenNode
 * @param {object} params - Parameters
 * @param {string} params.nodeId - ID of the node to flatten
 * @returns {Promise<{success: boolean, nodeId: string}>}
 */
export async function flattenNode(params) {
  const { nodeId } = params;
  const node = figma.getNodeById(nodeId);
  
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  figma.currentPage.selection = [node];
  const flattened = figma.flatten();
  return { success: true, nodeId: flattened.id };
}

/**
 * Applies union boolean operation to selected nodes
 * @async
 * @function union_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to union
 * @returns {Promise<{success: boolean}>}
 */
export async function union_selection(params) {
  const { nodeIds } = params;
  const nodes = nodeIds.map(id => figma.getNodeById(id)).filter(Boolean);
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.union();
  return { success: true };
}

/**
 * Applies subtract boolean operation to selected nodes
 * @async
 * @function subtract_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs (first is bottom shape, rest are subtracted)
 * @returns {Promise<{success: boolean}>}
 */
export async function subtract_selection(params) {
  const { nodeIds } = params;
  const nodes = nodeIds.map(id => figma.getNodeById(id)).filter(Boolean);
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.subtract();
  return { success: true };
}

/**
 * Applies intersect boolean operation to selected nodes
 * @async
 * @function intersect_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to intersect
 * @returns {Promise<{success: boolean}>}
 */
export async function intersect_selection(params) {
  const { nodeIds } = params;
  const nodes = nodeIds.map(id => figma.getNodeById(id)).filter(Boolean);
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.intersect();
  return { success: true };
}

/**
 * Applies exclude boolean operation to selected nodes
 * @async
 * @function exclude_selection
 * @param {object} params - Parameters
 * @param {string[]} params.nodeIds - Array of node IDs to exclude
 * @returns {Promise<{success: boolean}>}
 */
export async function exclude_selection(params) {
  const { nodeIds } = params;
  const nodes = nodeIds.map(id => figma.getNodeById(id)).filter(Boolean);
  
  if (nodes.length < 2) {
    throw new Error('Need at least 2 nodes for boolean operation');
  }
  
  figma.currentPage.selection = nodes;
  figma.exclude();
  return { success: true };
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
  createLines,
  setCornerRadius,
  resizeNode,
  resizeNodes,
  deleteNode,
  deleteNodes,
  moveNode,
  moveNodes,
  flattenNode,
  union_selection,
  subtract_selection,
  intersect_selection,
  exclude_selection
};
