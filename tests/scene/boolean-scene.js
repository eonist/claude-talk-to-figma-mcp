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
 * Helper: Create a rectangle at the root.
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
 * Helper: Create a star at the root.
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
 * Helper: Apply boolean subtract to two nodes.
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
 * Helper: Insert a node into a frame (single operation).
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
 * Main boolean scene test.
 */
export async function booleanScene(results) {
  // 1. Create frame at root
  const frameId = await createFrame({ x: 0, y: 0, width: 200, height: 200, name: "BooleanTestFrame" }, results);
  if (!frameId) return;

  // 2. Create rectangle inside the frame
  const rectId = await createRectangle({
    x: 0, y: 0, width: 100, height: 100,
    fillColor: { r: 1, g: 0, b: 0, a: 1 },
    name: "BooleanRect",
    parentId: frameId
  }, results);
  if (!rectId) return;

  // 3. Create star inside the frame
  const starId = await createStar({
    x: 25, y: 25, width: 50, height: 50, points: 5,
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
