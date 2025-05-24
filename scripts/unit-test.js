#!/usr/bin/env node
/**
 * Minimal MCP unit test: join a channel and create a rectangle in Figma via MCP server.
 *
 * Usage:
 *   node scripts/unit-test.js [--channel mychannel] [--x 100] [--y 100] [--width 200] [--height 100]
 */

import WebSocket from 'ws';

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      opts[key] = value;
      if (value !== true) i++;
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs();
  const port = process.env.PORT || 3055;
  const channel = opts.channel || Math.random().toString(36).slice(2, 10);
  const x = Number(opts.x) || 100;
  const y = Number(opts.y) || 100;
  const width = Number(opts.width) || 200;
  const height = Number(opts.height) || 100;

  const socket = new WebSocket(`ws://localhost:${port}`);

  socket.on('open', () => {
    console.log(`Joining channel: ${channel}`);
    socket.send(JSON.stringify({ type: 'join', channel }));

    setTimeout(() => {
      const id = Date.now().toString(36);
      const message = {
        id,
        type: 'message',
        channel,
        message: {
          id,
          command: 'create_rectangle',
          params: {
            rectangle: {
              x,
              y,
              width,
              height,
              name: 'UnitTestRectangle'
            }
          }
        }
      };
      console.log('Sending create_rectangle command:', JSON.stringify(message, null, 2));
      socket.send(JSON.stringify(message));
    }, 200);
  });

  socket.on('message', (data) => {
    try {
      const packet = JSON.parse(data.toString());
      if (packet.message && packet.message.id) {
        if (typeof packet.message.result !== "undefined") {
          console.log('Response received (result):', JSON.stringify(packet.message.result, null, 2));
        } else if (typeof packet.message.error !== "undefined") {
          console.log('Response received (error):', JSON.stringify(packet.message.error, null, 2));
        } else {
          console.log('Response received (raw message):', JSON.stringify(packet.message, null, 2));
          console.warn('Warning: No "result" or "error" field in response. Check MCP server/plugin implementation.');
        }
        socket.close();
        process.exit(0);
      }
    } catch (err) {
      console.error('Error parsing response:', err);
    }
  });

  socket.on('error', (err) => {
    console.error('WebSocket error:', err);
    process.exit(1);
  });
}

main().catch(err => {
  console.error('Unit test script failed:', err);
  process.exit(1);
});
