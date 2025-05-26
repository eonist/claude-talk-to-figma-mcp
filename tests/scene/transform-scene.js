import { channel, runStep, ws } from "../test-runner.js";

/**
 * Helper to create a frame.
 */
function create_frame({ x, y, width, height, name }) {
  const params = {
    x, y, width, height,
    name,
    fillColor: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
    strokeColor: { r: 0.7, g: 0.7, b: 0.7, a: 1 },
    strokeWeight: 1
  };
  return runStep({
    ws, channel,
    command: 'create_frame',
    params: { frame: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_frame (${name})`
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

function set_autolayout(frameId) {
  // Horizontal, wrap, padding, gaps
  const params = {
    layout: {
      nodeId: frameId,
      mode: 'HORIZONTAL',
      itemSpacing: 20,
      counterAxisSpacing: 30,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 15,
      paddingBottom: 15,
      primaryAxisSizing: 'FIXED',
      layoutWrap: 'WRAP'
    }
  };
  return runStep({
    ws, channel,
    command: 'set_auto_layout',
    params,
    assert: (response) => ({ pass: response && response['0'] && response['0'].success === true && response['0'].nodeId === frameId, response }),
    label: `apply_autolayout to frame ${frameId}`
  });
}

function reorder_z(parentId, nodeIds, order) {
  // order: array of nodeIds in desired z-order (index 0 = back, last = front)
  // We'll set each node's index in the parent's children array
  return Promise.all(order.map((nodeId, idx) =>
    runStep({
      ws, channel,
      command: 'reorder_node',
      params: { reorder: { nodeId, index: idx } },
      assert: (response) => ({ pass: response && response.success === true, response }),
      label: `reorder_node (${nodeId}) to index ${idx}`
    })
  ));
}

function rotate_node(nodeId, angle) {
  return runStep({
    ws, channel,
    command: 'rotate_node',
    params: { nodeId, angle },
    assert: (response) => ({ pass: response && response.success === true, response }),
    label: `rotate_node (${nodeId}) by ${angle}deg`
  });
}

function set_matrix_transform(nodeId, matrix) {
  return runStep({
    ws, channel,
    command: 'set_matrix_transform',
    params: { entry: { nodeId, matrix } },
    assert: (response) => ({ pass: Array.isArray(response.results) && response.results.some(r => r.nodeId === nodeId && r.success), response }),
    label: `set_matrix_transform (${nodeId})`
  });
}

export async function transformScene(results) {
  // --- First frame and rectangles (as before) ---
  const frameResult = await create_frame({ x: 50, y: 100, width: 400, height: 300, name: 'Main Frame' });
  results.push(frameResult);
  const frameId = frameResult.response?.ids?.[0];

  const red = { r: 1, g: 0, b: 0, a: 1 };
  const green = { r: 0, g: 1, b: 0, a: 1 };
  const blue = { r: 0, g: 0, b: 1, a: 1 };

  const res1 = await create_rectangle(red, 100, 100, frameId);
  results.push(res1);
  const rect1Id = res1.response?.ids?.[0];
  if (rect1Id) {
    results.push(await set_position(rect1Id, 0, 0));
    results.push(await set_size(rect1Id, 100, 100));
  }

  const res2 = await create_rectangle(green, 150, 100, frameId);
  results.push(res2);
  const rect2Id = res2.response?.ids?.[0];
  if (rect2Id) {
    results.push(await set_position(rect2Id, 100, 0));
    results.push(await set_size(rect2Id, 150, 100));
  }

  const res3 = await create_rectangle(blue, 100, 150, frameId);
  results.push(res3);
  const rect3Id = res3.response?.ids?.[0];
  if (rect3Id) {
    results.push(await set_position(rect3Id, 250, 0));
    results.push(await set_size(rect3Id, 100, 150));
  }

  // --- Second frame below the first ---
  const frame2Result = await create_frame({ x: 50, y: 450, width: 400, height: 300, name: 'AutoLayout Frame' });
  results.push(frame2Result);
  const frame2Id = frame2Result.response?.ids?.[0];

  // Create 3 rectangles with different w,h (red,green,blue) inside frame2
  const resA = await create_rectangle(red, 120, 80, frame2Id);
  results.push(resA);
  const rectAId = resA.response?.ids?.[0];

  const resB = await create_rectangle(green, 90, 120, frame2Id);
  results.push(resB);
  const rectBId = resB.response?.ids?.[0];

  const resC = await create_rectangle(blue, 140, 60, frame2Id);
  results.push(resC);
  const rectCId = resC.response?.ids?.[0];

  // Apply horizontal autolayout with wrap, padding, gaps
  if (frame2Id) {
    results.push(await set_autolayout(frame2Id));
  }

  // Reorder z position: blue, green, red (rectC, rectB, rectA)
  if (rectAId && rectBId && rectCId) {
    // Desired order: blue (rectC), green (rectB), red (rectA)
    const reorderResults = await reorder_z(frame2Id, [rectAId, rectBId, rectCId], [rectCId, rectBId, rectAId]);
    reorderResults.forEach(r => results.push(r));
  }

  // Rotate 45deg rectA (red)
  if (rectAId) {
    results.push(await rotate_node(rectAId, 45));
  }
  // Resize 200x100 rectB (green)
  if (rectBId) {
    results.push(await set_size(rectBId, 200, 100));
  }
  // Matrix skew 45deg rectC (blue)
  if (rectCId) {
    // Skew X by 45deg: [1, 0, tan(45deg), 1, 0, 0]
    const tan45 = Math.tan(Math.PI / 4);
    results.push(await set_matrix_transform(rectCId, [1, 0, tan45, 1, 0, 0]));
  }
}
