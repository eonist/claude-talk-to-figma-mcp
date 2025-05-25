import { ws, channel, assertEchoedCommand, runStep } from "../test-runner.js";
import { randomColor } from "../helper.js";

/**
 * Helper to create a rectangle in Figma for shape tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_rectangle() {
  const params = {
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    name: 'UnitTestRectangle',
    cornerRadius: 12,
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws,
    channel,
    command: 'create_rectangle',
    params: { rectangle: params },
    assert: (response) => { console.log("create_rectangle response:", response); return { pass: !!(response && response.ids && response.ids.length > 0), response }; },
    label: `create_rectangle (${params.name})`
  });
}

/**
 * Helper to create an 8-pointed star in Figma with inner radius 30px and outer radius 60px.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_star() {
  const params = {
    x: 200,
    y: 200,
    points: 8,
    innerRadius: 30,
    outerRadius: 60,
    name: 'UnitTestStar',
    fillColor: { r: 1, g: 0.8431372549019608, b: 0, a: 1 } // gold color
  };
  return runStep({
    ws,
    channel,
    command: 'create_star',
    params: { star: params },
    assert: (response) => { console.log("create_star response:", response); return { pass: !!(response && response.ids && response.ids.length > 0), response }; },
    label: `create_star (${params.name})`
  });
}


/**
 * Helper to create a hexagon with 80px radius and orange fill.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_hexagon() {
  const params = {
    x: 100,
    y: 100,
    sides: 6,
    width: 160,
    height: 160,
    name: 'UnitTestHexagon',
    fillColor: { r: 1, g: 0.6470588235294118, b: 0, a: 1 }
  };
  return runStep({
    ws,
    channel,
    command: 'create_polygon',
    params: { polygon: params },
    assert: (response) => { console.log("create_polygon response:", response); return { pass: !!(response && response.ids && response.ids.length > 0), response }; },
    label: `create_polygon (${params.name})`
  });
}

/**
 * Helper to create an ellipse in Figma for shape tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_ellipse() {
  const params = {
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    name: 'UnitTestEllipse',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws,
    channel,
    command: 'create_ellipse',
    params: { ellipse: params },
    assert: (response) => { console.log("create_ellipse response:", response); return { pass: !!(response && response.ids && response.ids.length > 0), response }; },
    label: `create_ellipse (${params.name})`
  });
}

/**
 * Helper to create a frame in Figma for shape tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>} Test result object.
 */
function create_frame() {
  const params = {
    x: 50,
    y: 100,
    width: 400,
    height: 300,
    name: 'Main Frame',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws,
    channel,
    command: 'create_frame',
    params: { frame: params },
    assert: (response) => { console.log("create_frame response:", response); return { pass: !!(response && response.ids && response.ids.length > 0), response }; },
    label: `create_frame (${params.name})`
  });
}

/**
 * Shape scene: creates rectangle, ellipse, and frame in sequence.
 * @param {Array} results - Collector array for test step results.
 * @returns {Promise<void>}
 */
export async function shapeScene(results) {
  results.push(await create_rectangle());
  results.push(await create_ellipse());
  results.push(await create_frame());
  results.push(await create_hexagon());
  results.push(await create_star());
}

//export { create_rectangle, create_ellipse };
