import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/claude_mcp_plugin/src/code.ts'],
  format: ['iife'], // Important for Figma plugins
  outDir: 'src/claude_mcp_plugin',
  clean: false,
  minify: true,
  sourcemap: false,
  external: ['figma'],
  dts: false,
  outExtension() {
    return {
      js: '.js',
    };
  },
  onSuccess: 'echo "Build successful!"',
});
