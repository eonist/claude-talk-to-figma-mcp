// Simple build script for bundling the Figma plugin
import * as esbuild from 'esbuild';

async function runBuild() {
  try {
    await esbuild.build({
      entryPoints: ['src/claude_mcp_plugin/src/code.js'],
      outfile: 'src/claude_mcp_plugin/code.js',
      bundle: true,
      format: 'iife',
      // Use minimal minification for better compatibility
      minify: false,
      loader: { '.js': 'jsx' },
      // Keep figma as an external global
      external: ['figma'],
      // Target ES2015 for better browser compatibility
      target: ['es2015'],
      // Ensure sourcemap is off for production
      sourcemap: false,
      // Add a banner to identify the bundled file
      banner: {
        js: '// Bundled Figma plugin code - Do not edit directly',
      },
    });
    console.log('✅ Figma plugin built successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

runBuild();
