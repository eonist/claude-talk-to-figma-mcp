import { ws, channel, runStep } from "../test-runner.js";
import { randomColor } from "../helper.js";

/**
 * Helper to create a rectangle in Figma for shape tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_rectangle() {
  const params = {
    x: 0, y: 0, width: 200, height: 100,
    name: 'UnitTestRectangle',
    cornerRadius: 12,
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_rectangle',
    params: { rectangle: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_rectangle (${params.name})`
  });
}

/**
 * Helper to create an ellipse in Figma for shape tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_ellipse() {
  const params = {
    x: 50, y: 50, width: 100, height: 100,
    name: 'UnitTestEllipse',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_ellipse',
    params: { ellipse: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_ellipse (${params.name})`
  });
}

/**
 * Helper to create a frame in Figma for shape tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_frame() {
  const params = {
    x: 50, y: 100, width: 400, height: 300,
    name: 'Main Frame',
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_frame',
    params: { frame: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_frame (${params.name})`
  });
}

/**
 * Helper to create a hexagon in Figma for shape tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_hexagon() {
  const params = {
    x: 100, y: 100, width: 160, height: 160,
    sides: 6,
    name: 'UnitTestHexagon',
    fillColor: { r:1, g:0.6470588, b:0, a:1 },
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_polygon',
    params: { polygon: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_polygon (${params.name})`
  });
}

/**
 * Helper to create an 8-pointed star in Figma for shape tests.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_star() {
  const params = {
    x: 200, y: 200,
    points: 8,
    innerRadius: 0.5,
    outerRadius: 1,
    name: 'UnitTestStar',
    fillColor: { r:1, g:0.8431373, b:0, a:1 },
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_star',
    params: { star: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_star (${params.name})`
  });
}

/**
 * Helper to create a heart shape in Figma using vector paths and bezier curves.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_heart() {
  const params = {
    x: 150, y: 150,
    width: 100, height: 90,
    name: 'UnitTestHeart',
    vectorPaths: [
      { data: "M50 15 C35 0 0 0 0 37.5 C0 75 50 90 50 90 C50 90 100 75 100 37.5 C100 0 65 0 50 15 Z" }
    ],
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_vector',
    params: { vector: params },
    assert: (response) => ({ pass: Array.isArray(response.ids) && response.ids.length > 0, response }),
    label: `create_vector (${params.name})`
  });
}

/**
 * Shape scene: creates rectangle, ellipse, frame, hexagon, star, and heart in sequence.
 * @param {Array} results - Collector array for test step results.
 * @returns {Promise<void>}
 */
export async function shapeScene(results) {
  results.push(await create_rectangle());
  results.push(await create_ellipse());
  results.push(await create_frame());
  results.push(await create_hexagon());
  results.push(await create_star());
  results.push(await create_heart());
}
