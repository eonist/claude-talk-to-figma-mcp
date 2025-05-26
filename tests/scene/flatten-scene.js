import { channel, runStep, ws } from "../test-runner.js";

/**
 * Helper: Create a frame at the root.
 */
async function createFrame({ x, y, width, height, name }, results) {
  const params = {
    x, y, width, height, name,
    fillColor: { r: 1, g: 1, b: 1, a: 1 }
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
 * Helper: Create an ellipse.
 */
async function createEllipse({ x, y, width, height, name, parentId }, results) {
  const params = {
    x, y, width, height, name,
    fillColor: { r: 0.2, g: 0.6, b: 1, a: 1 },
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1
  };
  if (parentId) params.parentId = parentId;
  const result = await runStep({
    ws, channel,
    command: "create_ellipse",
    params: { ellipse: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: `create_ellipse (${name})`
  });
  results.push(result);
  return result.response?.ids?.[0];
}

/**
 * Helper: Create a triangle (polygon with 3 sides).
 */
async function createTriangle({ x, y, width, height, name, parentId }, results) {
  const params = {
    x, y, width, height, sides: 3, name,
    fillColor: { r: 1, g: 0.7, b: 0.2, a: 1 },
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1
  };
  if (parentId) params.parentId = parentId;
  const result = await runStep({
    ws, channel,
    command: "create_polygon",
    params: { polygon: params },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: `create_triangle (${name})`
  });
  results.push(result);
  return result.response?.ids?.[0];
}

/**
 * Helper: Flatten two nodes together by selection.
 */
async function flattenNodesBySelection({ nodeIds }, results) {
  // Set selection to both nodes
  const selResult = await runStep({
    ws, channel,
    command: "set_selection",
    params: { nodeIds },
    assert: (response) => response && response.success !== false,
    label: "set_selection (ellipse + triangle)"
  });
  results.push(selResult);

  // Flatten the selection
  const result = await runStep({
    ws, channel,
    command: "flatten_node",
    params: { selection: true },
    assert: (response) => {
      const ids = response.nodeIds || response.ids;
      const ok = Array.isArray(ids) && ids.length === 1;
      return { pass: ok, reason: ok ? undefined : "Expected a single flattened node", response };
    },
    label: "flatten_node (selection: ellipse + triangle)"
  });
  results.push(result);
  return result.response?.nodeIds?.[0] || result.response?.ids?.[0];
}

/**
 * Main flatten scene test.
 */
export async function flattenScene(results) {
  // 1. Create frame
  const frameId = await createFrame({ x: 0, y: 0, width: 200, height: 200, name: "FlattenTestFrame" }, results);
  if (!frameId) return;

  // 2. Create ellipse in frame
  const ellipseId = await createEllipse({
    x: 20, y: 40, width: 80, height: 60, name: "FlattenEllipse", parentId: frameId
  }, results);
  if (!ellipseId) return;

  // 3. Create triangle in frame
  const triangleId = await createTriangle({
    x: 60, y: 80, width: 70, height: 70, name: "FlattenTriangle", parentId: frameId
  }, results);
  if (!triangleId) return;

  // 4. Flatten both shapes by selection
  await flattenNodesBySelection({ nodeIds: [ellipseId, triangleId] }, results);
}
