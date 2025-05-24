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

function randomColor() {
  return {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    a: 1
  };
}
function randomFontSize() {
  return Math.floor(Math.random() * 32) + 8; // 8 to 40 px
}
function randomFontWeight() {
  const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  return weights[Math.floor(Math.random() * weights.length)];
}

// --- Test Step/Scene/Sequence Definitions ---

/**
 * Assert that the response echoes the command and params as sent.
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

function assertEchoedCommand(expectedCommand, expectedParams) {
  return (response) => {
    if (!response) return { pass: false, reason: 'No response received' };
    if (response.command !== expectedCommand) {
      return { pass: false, reason: `Expected command "${expectedCommand}", got "${response.command}"` };
    }
    // Check params (rectangle, ellipse, or text)
    const actual = response.params && (response.params.rectangle || response.params.ellipse || response.params.text);
    if (expectedParams) {
      for (const key of Object.keys(expectedParams)) {
        if (typeof expectedParams[key] === "object" && expectedParams[key] !== null) {
          if (!deepEqual(actual[key], expectedParams[key])) {
            return { pass: false, reason: `Property "${key}" did not match expected object value` };
          }
        } else {
          if (actual[key] !== expectedParams[key]) {
            return { pass: false, reason: `Property "${key}" expected ${expectedParams[key]}, got ${actual[key]}` };
          }
        }
      }
    }
    return { pass: true };
  };
}


import { shapeScene } from "./shape-scene.js";
import { textScene } from "./text-scene.js";

// --- Step Runner ---
function runStep({ ws, channel, command, params, assert, label }) {
  return new Promise((resolve) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const message = {
      id,
      type: 'message',
      channel,
      message: {
        id,
        command,
        params
      }
    };
    let timeout;
    const onMessage = (data) => {
      try {
        const packet = JSON.parse(data.toString());
        if (packet.message && packet.message.id === id) {
          ws.off('message', onMessage);
          clearTimeout(timeout);
          // Prefer result, then error, then raw
          let resp = packet.message.result ?? packet.message.error ?? packet.message;
          const assertion = assert ? assert(resp) : { pass: true };
          resolve({
            label,
            pass: assertion.pass,
            reason: assertion.reason,
            response: resp
          });
        }
      } catch (err) {
        ws.off('message', onMessage);
        clearTimeout(timeout);
        resolve({
          label,
          pass: false,
          reason: 'Error parsing response: ' + err,
          response: null
        });
      }
    };
    ws.on('message', onMessage);
    ws.send(JSON.stringify(message));
    timeout = setTimeout(() => {
      ws.off('message', onMessage);
      resolve({
        label,
        pass: false,
        reason: 'Timeout waiting for response',
        response: null
      });
    }, 5000);
  });
}

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
  const sequence = [shapeScene, textScene];
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
  randomColor,
  randomFontSize,
  randomFontWeight,
  ws,
  channel
};
