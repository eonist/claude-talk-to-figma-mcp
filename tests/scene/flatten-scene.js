import { channel, runStep, ws } from "../test-runner.js";

/**
 * Helper: Create a frame, optionally as a child of a parent.
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
 * Helper: Create a rectangle.
 */
async function createRectangle({ x, y, width, height, name, parentId }, results) {
  const params = {
    x, y, width, height, name,
    fillColor: { r: 0.2, g: 0.6, b: 1, a: 1 },
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1
  };
  if (parentId) params.parentId = parentId;
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
 * Helper: Flatten two nodes together by nodeIds.
 */
async function flattenNodes({ nodeIds }, results) {
  const result = await runStep({
    ws, channel,
    command: "flatten_node",
    params: { nodeIds },
    assert: (response) => {
      const ids = response.nodeIds || response.ids;
      const ok = Array.isArray(ids) && ids.length === 1;
      return { pass: ok, reason: ok ? undefined : "Expected a single flattened node", response };
    },
    label: "flatten_node (rect1 + rect2 by nodeIds)"
  });
  results.push(result);
  return result.response?.nodeIds?.[0] || result.response?.ids?.[0];
}

/**
 * Main flatten scene test.
 * @param {Array} results
 * @param {string} [parentFrameId] - Optional parent frame ID for the scene
 */
export async function flattenScene(results, parentFrameId) {
  // 1. Create frame as a child of the all-scenes container
  const frameId = await createFrame({ x: 0, y: 0, width: 200, height: 200, name: "FlattenTestFrame", ...(parentFrameId && { parentId: parentFrameId }) }, results);
  if (!frameId) return;

  // 2. Create first rectangle in frame
  const rect1Id = await createRectangle({
    x: 20, y: 40, width: 80, height: 60, name: "FlattenRect1", parentId: frameId
  }, results);
  if (!rect1Id) return;

  // 3. Create second rectangle in frame
  const rect2Id = await createRectangle({
    x: 60, y: 80, width: 70, height: 70, name: "FlattenRect2", parentId: frameId
  }, results);
  if (!rect2Id) return;

  // 4. Flatten both rectangles by nodeIds
  await flattenNodes({ nodeIds: [rect1Id, rect2Id] }, results);
}
