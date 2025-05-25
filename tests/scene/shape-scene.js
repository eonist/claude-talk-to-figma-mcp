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
      { windingRule: "EVENODD", data: "M 50 15 C 35 0 0 0 0 37.5 C 0 75 50 90 50 90 C 50 90 100 75 100 37.5 C 100 0 65 0 50 15 Z" }
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
      { windingRule: "EVENODD", data: "M 10 30 Q 10 10 50 10 L 50 0 L 110 30 L 50 60 L 50 50 Q 20 50 20 30 Z" }
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
    x: 250, y: 150, width: 160, height: 240,
    name: 'UnitTestLightningBolt',
    vectorPaths: [
      {
        windingRule: "EVENODD",
        // Lightning bolt (based on SVG polygon points, scaled to fit a 16x16 grid)
        data: "M 18.5 3.5 L 5.5 18.5 L 14.5 19.5 L 13.5 28.5 L 26.5 13.5 L 17.5 12.5 Z"
      }
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

function create_speech_bubble() {
  const params = {
    x: 70, y: 60, width: 100, height: 80,
    name: 'UnitTestSpeechBubble',
    vectorPaths: [
      { windingRule: "EVENODD", data: "M 20 30 Q 20 20 30 20 L 80 20 Q 90 20 90 30 L 90 60 Q 90 70 80 70 L 40 70 L 30 80 L 32 70 Q 20 70 20 60 Z" }
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
 
function create_bookmark() {
  const params = {
    x: 130, y: 120, width: 80, height: 100,
    name: 'UnitTestBookmark',
    vectorPaths: [
      { windingRule: "EVENODD", data: "M 30 20 L 70 20 Q 75 20 75 25 L 75 85 L 50 70 L 25 85 L 25 25 Q 25 20 30 20 Z" }
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
  results.push(await create_speech_bubble());
  results.push(await create_bookmark());
  results.push(await create_heart());
  results.push(await create_lightning_bolt());
}
