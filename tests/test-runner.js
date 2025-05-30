#!/usr/bin/env node
/**
 * MCP/Figma Test Runner: Runs a sequence of scenes (each with steps) and checks responses.
 *
 * Usage:
 *   node scripts/test-runner.js run --channel 9c73ze4s
 */

import WebSocket from 'ws';

let ws;
let channel;

// --- CLI Argument Parsing ---
/**
 * Parses command-line arguments into a structured options object.
 * Handles both flags (--flag) and positional arguments.
 * @returns {{_: string[], [key: string]: string|boolean}} Parsed options with flags and positional arguments
 * @example
 * // Command: node script.js run --channel abc123 --verbose
 * // Returns: { _: ['run'], channel: 'abc123', verbose: true }
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { _: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      opts[key] = value;
      if (value !== true) i++;
    } else {
      opts._.push(args[i]);
    }
  }
  return opts;
}

// Import random helpers from helper.js
import { randomColor, randomFontSize, randomFontWeight } from "./helper.js";

// --- Test Step/Scene/Sequence Definitions ---

import { deepEqual, assertEchoedCommand, runStep } from "./test-runner-core.js";

import { shapeScene } from "./scene/shape-scene.js";
import { textScene } from "./scene/text-scene.js";
import { styleScene } from "./scene/style-scene.js";
import { transformScene } from "./scene/transform-scene.js";
import { booleanScene } from './scene/boolean-scene.js';
import { flattenScene } from './scene/flatten-scene.js';
import { effectScene } from './scene/effect-scene.js';
import { svgScene } from './scene/svg-scene.js';
import { imageScene } from './scene/image-scene.js';
import { maskScene } from './scene/mask-scene.js';
import { layoutScene } from './scene/layout-scene.js';
import { layoutATest } from './layout/layout-a.js';
import { layoutBTest } from './layout/layout-b.js';

// --- Container Frame Config ---
const CONTAINER_FRAME_CONFIG = {
  mode: 'HORIZONTAL',
  layoutWrap: 'WRAP',
  itemSpacing: 32,
  counterAxisSpacing: 32, // vertical gap between rows
  paddingLeft: 32,
  paddingRight: 32,
  paddingTop: 32,
  paddingBottom: 32,
  primaryAxisSizing: 'FIXED', // or 'AUTO' if you want horizontal hug
  counterAxisSizing: 'AUTO'   // hug vertically
};

/**
 * Creates the top-level container frame for organizing all test scenes.
 * Applies horizontal auto-layout with wrapping and consistent spacing.
 * @param {WebSocket} ws - Active WebSocket connection to Figma
 * @param {string} channel - Channel ID for the Figma session
 * @returns {Promise} The container frame ID
 * @throws {Error} When frame creation or auto-layout application fails
 * @example
 * const containerId = await createContainerFrame(ws, 'channel123');
 */
async function createContainerFrame(ws, channel) {
  const res = await runStep({
    ws, channel,
    command: 'create_frame',
    params: {
      frame: {
        x: 0, y: 0,
        width: 1600, // or a large value, or use 'AUTO' for primaryAxisSizing
        height: 900, // initial height, will hug vertically
        name: 'All Scenes Container',
        fillColor: { r: 0.05, g: 0.05, b: 0.05, a: 1 }
        // Do NOT spread autolayout config here; set it explicitly below
      }
    },
    assert: r => Array.isArray(r.ids) && r.ids.length > 0,
    label: 'create_container_frame'
  });
  const containerFrameId = res.response?.ids?.[0];

  // Explicitly apply autolayout to the container frame
  if (containerFrameId) {
    await runStep({
      ws, channel,
      command: 'set_auto_layout',
      params: {
        layout: {
          nodeId: containerFrameId,
          ...CONTAINER_FRAME_CONFIG
        }
      },
      assert: r => r && r["0"] && r["0"].success === true && r["0"].nodeId === containerFrameId,
      label: 'set_auto_layout (container frame)'
    });
  }

  return containerFrameId;
}

// --- Main Runner ---
/**
 * Main entry point for the test runner. Initializes WebSocket connection,
 * joins the specified channel, executes all test scenes, and reports results.
 * @returns {Promise}
 * @throws {Error} When WebSocket connection fails or test execution encounters errors
 * @example
 * // Usage: node scripts/test-runner.js run --channel mychannel
 * await main();
 */
async function main() {
  const opts = parseArgs();
  if (opts._[0] !== 'run') {
    console.error('Usage: node scripts/test-runner.js run --channel mychannel');
    process.exit(1);
  }
  const port = process.env.PORT || 3055;
  channel = opts.channel || Math.random().toString(36).slice(2, 10);

  ws = new WebSocket(`ws://localhost:${port}`);

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    process.exit(1);
  });

  await new Promise((resolve, reject) => {
    ws.on('open', () => {
      console.log(`Joined channel: ${channel}`);
      ws.send(JSON.stringify({ type: 'join', channel }));
      setTimeout(resolve, 1000); // Increased delay to 1 second for join to process
    });
  });

  // Create the container frame for all scenes
  const containerFrameId = await createContainerFrame(ws, channel);

  // Define the sequence of scenes
  const sequence = [
    //shapeScene,
    //textScene, 
    //styleScene,
    //transformScene,
    //booleanScene,
    //flattenScene,
    //svgScene,
    //imageScene,
    //layoutScene,
    //maskScene,
    // layoutATest,
    layoutBTest
  ];
  const results = [];
  for (const scene of sequence) {
    // Pass containerFrameId as the first argument to each scene
    // Each scene function should accept (results, parentFrameId) and use parentFrameId as parentId for its top-level frame
    await scene(results, containerFrameId);
  }

  ws.close();

  // Print results with visual cues
  let passCount = 0;
  let failCount = 0;
  for (const r of results) {
    if (r.pass) {
      console.log(`[PASS ✅] ${r.label}`);
      passCount++;
    } else {
      console.log(`[FAIL 🚫] ${r.label} - ${r.reason}`);
      failCount++;
    }
  }
  const summary = `Test summary: ${passCount} passed, ${failCount} failed, ${results.length} total.`;
  if (failCount === 0) {
    console.log(`${summary} (All tests succeeded ✅)`);
  } else {
    console.log(`${summary} (Some tests failed 🚫)`);
  }
  if (failCount > 0) process.exit(1);
}

main().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});

export {
  runStep,
  assertEchoedCommand,
  ws,
  channel
};
