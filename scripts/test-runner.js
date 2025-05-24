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

// Steps (DRY: pass params once, used for both command and assertion)
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

function create_text(params) {
  return runStep({
    ws,
    channel,
    command: 'set_text',
    params: { text: params },
    assert: assertEchoedCommand('set_text', params),
    label: `set_text (${params.name || ''})`
  });
}

// Scenes
async function shapeScene(results) {
  results.push(await create_rectangle({
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    name: 'UnitTestRectangle',
    cornerRadius: 12,
    fillColor: { r: 0.2, g: 0.6, b: 0.9, a: 1 }
  }));
  results.push(await create_ellipse({ x: 50, y: 50, width: 100, height: 100, name: 'UnitTestEllipse' }));
}

async function textScene(results) {
  results.push(await create_text({ x: 100, y: 200, text: 'UnitTestText', name: 'UnitTestTextNode' }));
}

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
