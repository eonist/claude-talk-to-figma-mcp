import { channel, runStep, ws } from "../test-runner.js";

/**
 * Boolean scene test:
 * 1. Add 100x100 red rectangle at (0,0)
 * 2. Add 50x50 blue star at (25,25)
 * 3. Apply boolean subtract (rectangle - star)
 * 4. Flatten the result
 */
export async function booleanScene(results) {
  // 1. Create a frame to contain the shapes
  const frameParams = {
    x: 50, y: 100, width: 200, height: 200,
    name: "BooleanTestFrame",
    fillColor: { r: 1, g: 1, b: 1, a: 1 }
  };
  const frameResult = await runStep({
    ws, channel,
    command: "create_frame",
    params: { frame: frameParams },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "create_frame (BooleanTestFrame)"
  });
  results.push(frameResult);
  const frameId = frameResult.response?.ids?.[0];
  if (!frameId) {
    results.push({ label: "frameId missing", pass: false, reason: "Could not create frame" });
    return;
  }

  // 2. Create 100x100 red rectangle at (0,0)
  const rectParams = {
    x: 0, y: 0, width: 100, height: 100,
    name: "BooleanRect",
    fillColor: { r: 1, g: 0, b: 0, a: 1 },
    parentId: frameId
  };
  const rectResult = await runStep({
    ws, channel,
    command: "create_rectangle",
    params: { rectangle: rectParams },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "create_rectangle (BooleanRect)"
  });
  results.push(rectResult);
  const rectId = rectResult.response?.ids?.[0];
  if (!rectId) {
    results.push({ label: "rectId missing", pass: false, reason: "Could not create rectangle" });
    return;
  }

  // 3. Create 50x50 blue star at (25,25)
  const starParams = {
    x: 25, y: 25, width: 50, height: 50,
    points: 5,
    name: "BooleanStar",
    fillColor: { r: 0, g: 0, b: 1, a: 1 },
    parentId: frameId
  };
  const starResult = await runStep({
    ws, channel,
    command: "create_star",
    params: { star: starParams },
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "create_star (BooleanStar)"
  });
  results.push(starResult);
  const starId = starResult.response?.ids?.[0];
  if (!starId) {
    results.push({ label: "starId missing", pass: false, reason: "Could not create star" });
    return;
  }

  // 4. Apply boolean subtract (rectangle - star)
  const booleanParams = {
    operation: "subtract",
    nodeIds: [rectId, starId]
  };
  const booleanResult = await runStep({
    ws, channel,
    command: "boolean",
    params: booleanParams,
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "boolean subtract (rect - star)"
  });
  results.push(booleanResult);
  const booleanId = booleanResult.response?.ids?.[0];
  if (!booleanId) {
    results.push({ label: "booleanId missing", pass: false, reason: "Boolean subtract failed" });
    return;
  }

  // 5. Ensure boolean result is parented to the frame
  const setNodeParams = {
    parentId: frameId,
    childId: booleanId
  };
  const setNodeResult = await runStep({
    ws, channel,
    command: "set_node",
    params: setNodeParams,
    assert: (response) => ({
      pass: response && response[0] && response[0].success === true,
      response
    }),
    label: "set_node (add boolean result to frame)"
  });
  results.push(setNodeResult);

  // 6. Flatten the result
  const flattenParams = {
    nodeId: booleanId
  };
  const flattenResult = await runStep({
    ws, channel,
    command: "flatten_node",
    params: flattenParams,
    assert: (response) => ({
      pass: Array.isArray(response.ids) && response.ids.length > 0,
      response
    }),
    label: "flatten_node (boolean result)"
  });
  results.push(flattenResult);
}
