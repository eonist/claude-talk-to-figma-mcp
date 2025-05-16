import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/conduit_mcp_server/server.ts',
    'src/socket.ts',
    'src/conduit_mcp_server/utils/figma/is-valid-node-id.ts'
  ],
  format: ['cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'node18',
  sourcemap: true,
  minify: false,
  splitting: false,
  bundle: false,
  banner: {
    js: '#!/usr/bin/env node'
  }
});
