import { ws, channel, assertEchoedCommand, runStep } from "./test-runner.js";
import { randomColor } from "./helper.js";

function create_rectangle(params) {
  return runStep({
    ws,
    channel,
    command: 'create_rectangle',
    params: { rectangle: params },
    assert: assertEchoedCommand('create_rectangle', params),
    label: `create_rectangle (${params.name || ''})`
  });
}

function create_ellipse(params) {
  return runStep({
    ws,
    channel,
    command: 'create_ellipse',
    params: { ellipse: params },
    assert: assertEchoedCommand('create_ellipse', params),
    label: `create_ellipse (${params.name || ''})`
  });
}

function create_frame(params) {
  return runStep({
    ws,
    channel,
    command: 'create_frame',
    params: { frame: params },
    assert: assertEchoedCommand('create_frame', params),
    label: `create_frame (${params.name || ''})`
  });
}

export async function shapeScene(results) {
  results.push(await create_rectangle({
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    name: 'UnitTestRectangle',
    cornerRadius: 12,
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  }));
  results.push(await create_ellipse({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    name: 'UnitTestEllipse',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  }));
  results.push(await create_frame({
    x: 50,
    y: 100,
    width: 400,
    height: 300,
    name: 'Main Frame',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  }));
}

//export { create_rectangle, create_ellipse };
