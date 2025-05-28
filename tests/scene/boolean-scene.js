import { channel, runStep, ws } from "../test-runner.js";

/**
 * Creates a frame with specified properties and optional parent containment.
 * @param {Object} config - Frame configuration object
 * @param {number} config.x - X coordinate position
 * @param {number} config.y - Y coordinate position  
 * @param {number} config.width - Frame width in pixels
 * @param {number} config.height - Frame height in pixels
 * @param {string} config.name - Display name for the frame
 * @param {string} [config.parentId] - Optional parent frame ID for hierarchical organization
 * @param {Array} results - Results array to append test outcome
 * @returns {Promise<string|null>} The created frame ID, or null if creation failed
 * @example
 * const frameId = await createFrame({
 *   x: 0, y: 0, width: 200, height: 150,
 *   name: "BooleanTestFrame", parentId: "container123"
 * }, results);
 */
async function createFrame({ x, y, width, height, name, parentId }, results) {
  const params = {
    x, y, width, height, name,
    fillColor: { r: 1, g: 1, b: 1, a: 1 },
    ...(parentId && { parentId })
  };
  const result = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: `create_frame (${name})`
  });
  results.push(result);
  return result.response?.ids?.[0];
}

/**
 * Creates a rectangle shape with specified styling and positioning.
 * @param {Object} config - Rectangle configuration object
 * @param {number} config.x - X coordinate position
 * @param {number} config.y - Y coordinate position
 * @param {number} config.width - Rectangle width in pixels
 * @param {number} config.height - Rectangle height in pixels
 * @param {string} config.name - Display name for the rectangle
 * @param {string} [config.parentId] - Optional parent frame ID for containment
 * @param {Array} results - Results array to append test outcome
 * @returns {Promise<string|null>} The created rectangle ID, or null if creation failed
 * @example
 * const rectId = await createRectangle({
 *   x: 20, y: 40, width: 80, height: 60,
 *   name: "BooleanRect1", parentId: frameId
 * }, results);
 */
async function createRectangle({ x, y, width, height, fillColor, name, parentId }, results) {
  const params = {
    x, y, width, height, name, fillColor,
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1,
    cornerRadius: 0
  };
  if (parentId) {
    params.parentId = parentId;
  }
  const result = await runStep({
    ws, channel,
    command: "create_rectangle",
    params: { rectangle: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: `create_rectangle (${name})`
  });
  results.push(result);
  return result.response?.ids?.[0];
}

/**
 * Creates a star shape with specified styling and positioning.
 * @param {Object} config - Star configuration object
 * @param {number} config.x - X coordinate position
 * @param {number} config.y - Y coordinate position
 * @param {number} config.width - Star width in pixels
 * @param {number} config.height - Star height in pixels
 * @param {number} config.points - Number of points on the star
 * @param {string} config.name - Display name for the star
 * @param {string} [config.parentId] - Optional parent frame ID for containment
 * @param {Array} results - Results array to append test outcome
 * @returns {Promise<string|null>} The created star ID, or null if creation failed
 * @example
 * const starId = await createStar({
 *   x: 25, y: 25, width: 50, height: 50, points: 5,
 *   name: "BooleanStar", parentId: frameId
 * }, results);
 */
async function createStar({ x, y, width, height, points, fillColor, name, parentId }, results) {
  const params = {
    x, y, width, height, points, name, fillColor,
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1
  };
  if (parentId) {
    params.parentId = parentId;
  }
  const result = await runStep({
    ws, channel,
    command: "create_star",
    params: { star: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: `create_star (${name})`
  });
  results.push(result);
  return result.response?.ids?.[0];
}

/**
 * Performs boolean operations (union, subtract, intersect, exclude) on multiple nodes.
 * Creates a new combined shape based on the specified operation type.
 * @param {Object} config - Boolean operation configuration
 * @param {string[]} config.nodeIds - Array of node IDs to combine (minimum 2 required)
 * @param {string} config.operation - Boolean operation type: "UNION", "SUBTRACT", "INTERSECT", or "EXCLUDE"
 * @param {Array} results - Results array to append test outcome
 * @returns {Promise<string|null>} The resulting boolean operation node ID, or null if operation failed
 * @throws {Error} When fewer than 2 nodes provided or invalid operation type
 * @example
 * const unionId = await performBooleanOperation({
 *   nodeIds: [rect1Id, rect2Id],
 *   operation: "UNION"
 * }, results);
 */
async function booleanSubtract({ nodeIds }, results) {
  const result = await runStep({
    ws, channel,
    command: "boolean",
    params: { operation: "subtract", nodeIds },
    assert: (response) => ({
      pass: response && !!response.resultNodeId,
      response
    }),
    label: "boolean subtract"
  });
  results.push(result);
  return result.response?.resultNodeId;
}

/**
 * Helper: Flatten a node.
 */
// async function flattenNode({ nodeId }, results) {
//   const result = await runStep({
//     ws, channel,
//     command: "flatten_node",
//     params: { nodeId },
//     assert: (response) => ({
//       pass: !!response.nodeId,
//       response
//     }),
//     label: "flatten_node"
//   });
//   results.push(result);
//   return result.response?.nodeId;
// }

/**
 * Inserts a node into a frame (single operation).
 * @param {Object} config - Insert operation configuration
 * @param {string} config.parentId - Parent frame ID
 * @param {string} config.childId - Child node ID to insert
 * @param {Array} results - Results array to append test outcome
 * @returns {Promise<void>}
 * @example
 * await insertNodeIntoFrame({ parentId: frameId, childId: booleanId }, results);
 */
async function insertNodeIntoFrame({ parentId, childId }, results) {
  const result = await runStep({
    ws, channel,
    command: "set_node",
    params: { parentId, childId, maintainPosition: true },
    assert: (response) => {
      const ok =
        response &&
        response.results &&
        response.results.some(r => r.childId === childId && r.parentId === parentId && r.success === true);
      return { pass: ok, reason: ok ? undefined : `Expected set_node to succeed for ${childId} in ${parentId}`, response };
    },
    label: "set_node (insert boolean result into frame)"
  });
  results.push(result);
}

/**
 * Main entry point for boolean operations scene testing.
 * Creates overlapping rectangles and demonstrates all four boolean operations.
 * @param {Array} results - Array to collect test results
 * @param {string} [parentFrameId] - Optional parent frame ID for scene organization
 * @example
 * const results = [];
 * await booleanScene(results, 'container123');
 * console.log(`Performed ${results.length} boolean operations`);
 */
export async function booleanScene(results, parentFrameId) {
  // 1. Create frame as a child of the all-scenes container
  // Use padding and fit frame to content
  const padding = 20;
  // Rectangle: x: 0, y: 0, width: 100, height: 100
  // Star: x: 25, y: 25, width: 50, height: 50
  const minX = Math.min(0, 25);
  const minY = Math.min(0, 25);
  const maxX = Math.max(0 + 100, 25 + 50);
  const maxY = Math.max(0 + 100, 25 + 50);
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const frameWidth = contentWidth + 2 * padding;
  const frameHeight = contentHeight + 2 * padding;

  const frameId = await createFrame({
    x: 0, y: 0,
    width: frameWidth,
    height: frameHeight,
    name: "BooleanTestFrame",
    ...(parentFrameId && { parentId: parentFrameId })
  }, results);
  if (!frameId) return;

  // 2. Create rectangle inside the frame (offset by padding)
  const rectId = await createRectangle({
    x: 0 - minX + padding,
    y: 0 - minY + padding,
    width: 100,
    height: 100,
    fillColor: { r: 1, g: 0, b: 0, a: 1 },
    name: "BooleanRect",
    parentId: frameId
  }, results);
  if (!rectId) return;

  // 3. Create star inside the frame (offset by padding)
  const starId = await createStar({
    x: 25 - minX + padding,
    y: 25 - minY + padding,
    width: 50,
    height: 50,
    points: 5,
    fillColor: { r: 0, g: 0, b: 1, a: 1 },
    name: "BooleanStar",
    parentId: frameId
  }, results);
  if (!starId) return;

  // 4. Boolean subtract (rect - star)
  const booleanId = await booleanSubtract({ nodeIds: [rectId, starId] }, results);
  if (!booleanId) return;

  // 5. Insert the boolean result node into the frame
  await insertNodeIntoFrame({ parentId: frameId, childId: booleanId }, results);

}
