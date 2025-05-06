#!/usr/bin/env node
/**
 * Integration test for batch local image insertion via WebSocket MCP server.
 *
 * Usage:
 *   node scripts/test-local-images.js /absolute/path/to/image1.png /absolute/path/to/image2.jpg
 */

import WebSocket from 'ws';

async function main() {
  const imagePaths = process.argv.slice(2);
  if (imagePaths.length === 0) {
    console.error('Error: Provide at least one image path as argument.');
    process.exit(1);
  }

  const port = process.env.PORT || 3055;
  const socket = new WebSocket(`ws://localhost:${port}`);

  socket.on('open', () => {
    // Generate a random channel name
    const channel = Math.random().toString(36).slice(2, 10);
    console.log(`Joining channel: ${channel}`);
    socket.send(JSON.stringify({ type: 'join', channel }));

    // Send the batch local-image command after joining
    setTimeout(() => {
      const id = Date.now().toString(36);
      const message = {
        id,
        type: 'message',
        channel,
        message: {
          id,
          command: 'insert_local_images',
          params: {
            images: imagePaths.map((filePath, idx) => ({
              imagePath: filePath,
              x: 10 + idx * 30,
              y: 20 + idx * 30
            }))
          }
        }
      };
      console.log('Sending command:', JSON.stringify(message, null, 2));
      socket.send(JSON.stringify(message));
    }, 200);
  });

  socket.on('message', (data) => {
    try {
      const packet = JSON.parse(data.toString());
      if (packet.message && packet.message.id) {
        console.log('Response received:', JSON.stringify(packet.message.result || packet.message.error, null, 2));
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
  console.error('Test script failed:', err);
  process.exit(1);
});
