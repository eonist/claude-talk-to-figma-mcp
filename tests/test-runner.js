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

import { shapeScene } from "./shape-scene.js";
import { textScene } from "./text-scene.js";
import { styleScene } from "./style-scene.js";

// --- Main Runner ---
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

  // Define the sequence of scenes
  const sequence = [
    shapeScene, 
    textScene, 
    styleScene
  ];
  const results = [];
  for (const scene of sequence) {
    await scene(results);
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
