import { channel, runStep, ws } from "../test-runner.js";

/**
 * Helper to create a rectangle with explicit color, size, and initial position (0,0).
 * @param {object} fillColor - RGBA color object
 * @param {number} width
 * @param {number} height
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_frame() {
  const params = {
    x: 50, y: 100, width: 400, height: 300,
    name: 'Main Frame',
    fillColor: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
    strokeColor: { r: 0.7, g: 0.7, b: 0.7, a: 1 },
    strokeWeight: 1
  };
  return runStep({
    ws, channel,
    command: 'create_frame',
    params: { frame: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_frame (${params.name})`
  });
}

function create_rectangle(fillColor, width, height, parentId = null) {
  const params = {
    x: parentId ? 20 : 0,
    y: parentId ? 20 : 0,
    width,
    height,
    name: 'TransformRectangle',
    fillColor,
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1,
    cornerRadius: 0
  };
  if (parentId) {
    params.parentId = parentId;
  }
  return runStep({
    ws, channel,
    command: 'create_rectangle',
    params: { rectangle: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_rectangle (${width}x${height})`
  });
}

/**
 * Helper to set the position of a node.
 * @param {string} nodeId
 * @param {number} x
 * @param {number} y
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function set_position(nodeId, x, y) {
  return runStep({
    ws, channel,
    command: 'move_node',
    params: { nodeId, x, y },
    assert: (response) => {
      const ok =
        Array.isArray(response.results) &&
        response.results.some(r => r.nodeId === nodeId && r.success === true);
      return { pass: ok, reason: ok ? undefined : `Expected results to include success for ${nodeId}`, response };
    },
    label: `set_position (${x},${y}) for ${nodeId}`
  });
}

/**
 * Helper to set the size of a node.
 * @param {string} nodeId
 * @param {number} width
 * @param {number} height
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function set_size(nodeId, width, height) {
  return runStep({
    ws, channel,
    command: 'resize_node',
    params: { nodeId, width, height },
    assert: (response) => {
      const ok = Array.isArray(response.ids) && response.ids.includes(nodeId);
      return { pass: ok, reason: ok ? undefined : `Expected ids to include ${nodeId}`, response };
    },
    label: `set_size (${width}x${height}) for ${nodeId}`
  });
}

/**
 * Main test: create 3 rectangles in a horizontal row (red, green, blue) with specified sizes and positions.
 * @param {Array} results
 */
export async function transformScene(results) {
  // Create frame first and store its ID
  const frameResult = await create_frame();
  results.push(frameResult);
  const frameId = frameResult.response?.ids?.[0];

  // Rectangle 1: Red, 100x100, at (0,0)
  const red = { r: 1, g: 0, b: 0, a: 1 };
  const res1 = await create_rectangle(red, 100, 100, frameId);
  results.push(res1);
  const rect1Id = res1.response?.ids?.[0];
  if (rect1Id) {
    results.push(await set_position(rect1Id, 0, 0));
    results.push(await set_size(rect1Id, 100, 100));
  }

  // Rectangle 2: Green, 150x100, at (100,0)
  const green = { r: 0, g: 1, b: 0, a: 1 };
  const res2 = await create_rectangle(green, 150, 100, frameId);
  results.push(res2);
  const rect2Id = res2.response?.ids?.[0];
  if (rect2Id) {
    results.push(await set_position(rect2Id, 100, 0));
    results.push(await set_size(rect2Id, 150, 100));
  }

  // Rectangle 3: Blue, 100x150, at (250,0)
  const blue = { r: 0, g: 0, b: 1, a: 1 };
  const res3 = await create_rectangle(blue, 100, 150, frameId);
  results.push(res3);
  const rect3Id = res3.response?.ids?.[0];
  if (rect3Id) {
    results.push(await set_position(rect3Id, 250, 0));
    results.push(await set_size(rect3Id, 100, 150));
  }
}
