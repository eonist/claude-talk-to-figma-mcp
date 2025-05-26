import { channel, runStep, ws } from "../test-runner.js";

/**
 * Helper: Create a rectangle at the root.
 */
async function createRectangle({ x, y, width, height, name }, results) {
  const params = {
    x, y, width, height, name,
    fillColor: { r: 0.2, g: 0.6, b: 1, a: 1 },
    strokeColor: { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight: 1
  };
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
 */
export async function flattenScene(results) {
  // 1. Create first rectangle at root
  const rect1Id = await createRectangle({
    x: 20, y: 40, width: 80, height: 60, name: "FlattenRect1"
  }, results);
  if (!rect1Id) return;

  // 2. Create second rectangle at root
  const rect2Id = await createRectangle({
    x: 60, y: 80, width: 70, height: 70, name: "FlattenRect2"
  }, results);
  if (!rect2Id) return;

  // 3. Wait before flattening to ensure nodes are registered
  await new Promise(resolve => setTimeout(resolve, 300));

  // 4. Flatten both rectangles by nodeIds
  await flattenNodes({ nodeIds: [rect1Id, rect2Id] }, results);
}
