import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/conduit_mcp_server/server.ts', 'src/socket.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'node18',
  sourcemap: true,
  minify: false,
  splitting: false,
  bundle: true,
});
