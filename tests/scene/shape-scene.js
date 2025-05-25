import { randomColor } from "../helper.js";
import { channel, runStep, ws } from "../test-runner.js";

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
      { windingRule: "NONE", data: "M 50 15 C 35 0 0 0 0 37.5 C 0 75 50 90 50 90 C 50 90 100 75 100 37.5 C 100 0 65 0 50 15 Z" }
    ],
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_vector',
    params: { vector: params },
    assert: (response) => {
      const ids = Array.isArray(response.nodeIds) ? response.nodeIds : response.ids;
      const ok = Array.isArray(ids) && ids.length > 0;
      return { pass: ok, reason: ok ? undefined : `Expected non-empty ids, got ${ids}`, response };
    },
    label: `create_vector (${params.name})`
  });
}

/**
 * Shape scene: creates rectangle, ellipse, frame, hexagon, star, and heart in sequence.
 * @param {Array} results - Collector array for test step results.
 * @returns {Promise<void>}
 */
/**
 * Helper to create a right-pointing arrow with curved tail.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_arrow() {
  const params = {
    x: 200, y: 100, width: 120, height: 60,
    name: 'UnitTestArrow',
    vectorPaths: [
      { windingRule: "NONE", data: "M 0 20 C 0 0 40 0 40 20 L 60 20 L 60 10 L 100 30 L 60 50 L 60 40 L 40 40 C 40 60 0 60 0 20 Z" }
    ],
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_vector',
    params: { vector: params },
    assert: (response) => {
      const ids = Array.isArray(response.nodeIds) ? response.nodeIds : response.ids;
      const ok = Array.isArray(ids) && ids.length > 0;
      return { pass: ok, reason: ok ? undefined : `Expected non-empty ids, got ${ids}`, response };
    },
    label: `create_vector (${params.name})`
  });
}

/**
 * Helper to create a lightning bolt icon using angular vector paths.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_lightning_bolt() {
  const params = {
    x: 250, y: 150, width: 80, height: 120,
    name: 'UnitTestLightningBolt',
    vectorPaths: [
      { windingRule: "NONE", data: "M 40 0 L 60 0 L 20 70 L 50 70 L 10 140 L 30 140 L 65 80 L 35 80 Z" }
    ],
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_vector',
    params: { vector: params },
    assert: (response) => {
      const ids = Array.isArray(response.nodeIds) ? response.nodeIds : response.ids;
      const ok = Array.isArray(ids) && ids.length > 0;
      return { pass: ok, reason: ok ? undefined : `Expected non-empty ids, got ${ids}`, response };
    },
    label: `create_vector (${params.name})`
  });
}

/**
 * Helper to create a leaf shape with organic curves and natural flow.
 * @returns {Promise<{label:string, pass:boolean, reason?:string, response:any}>}
 */
function create_leaf() {
  const params = {
    x: 300, y: 100, width: 100, height: 140,
    name: 'UnitTestLeaf',
    vectorPaths: [
      { windingRule: "NONE", data: "M 50 0 C 20 20 0 60 50 140 C 100 60 80 20 50 0 Z" }
    ],
    fillColor: randomColor(),
    strokeColor: randomColor(),
    strokeWeight: Math.floor(Math.random() * 8) + 1
  };
  return runStep({
    ws, channel,
    command: 'create_vector',
    params: { vector: params },
    assert: (response) => {
      const ids = Array.isArray(response.nodeIds) ? response.nodeIds : response.ids;
      const ok = Array.isArray(ids) && ids.length > 0;
      return { pass: ok, reason: ok ? undefined : `Expected non-empty ids, got ${ids}`, response };
    },
    label: `create_vector (${params.name})`
  });
}

export async function shapeScene(results) {
  // results.push(await create_rectangle());
  // results.push(await create_ellipse());
  // results.push(await create_frame());
  // results.push(await create_hexagon());
  // results.push(await create_star());
  results.push(await create_heart());
  results.push(await create_arrow());
  results.push(await create_lightning_bolt());
  results.push(await create_leaf());
}
