/**
 * @file Enhanced build script for the AI Agent Figma plugin.
 * Compiles TypeScript and inlines it directly into ui.html.
 * 
 * This script:
 * - Compiles TypeScript sources for the plugin UI
 * - Combines and inlines the resulting JavaScript into the HTML template
 * - Handles backup, cleanup, and error reporting
 * 
 * Usage: Run directly with Node.js (ESM).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

/**
 * Convert ESM module URL to filesystem path for __dirname support in ESM
 * @constant {string} __filename - Absolute path to this file
 * @constant {string} __dirname - Directory containing this file
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @constant {string} SRC_DIR - Path to the TypeScript source directory
 * @constant {string} TEMP_DIST_DIR - Path to the temporary build output directory
 * @constant {string} UI_TEMPLATE_PATH - Path to the HTML template file
 * @constant {string} UI_OUTPUT_PATH - Path to the final output HTML file
 */
const SRC_DIR = path.join(__dirname, 'src');
const TEMP_DIST_DIR = path.join(__dirname, 'temp-dist');
const UI_TEMPLATE_PATH = path.join(__dirname, 'ui-template.html');
const UI_OUTPUT_PATH = path.join(__dirname, 'dist', 'ui.html');

/**
 * Compiles TypeScript files, combines the result, and inlines into ui.html.
 * 
 * Steps:
 * 1. Compiles TypeScript sources using a plugin-specific tsconfig.
 * 2. Reads and combines the resulting JavaScript files.
 * 3. Inlines the combined JS into the HTML template, replacing the external script tag.
 * 4. Backs up the previous output, writes the new HTML, and cleans up temp files.
 * 
 * @throws {Error} If compilation or file operations fail.
 * @returns {void}
 */
function buildTypeScript() {
  console.log('Building TypeScript files for Figma plugin UI...');
  
  try {
    // Create temporary directory if it doesn't exist
    if (!fs.existsSync(TEMP_DIST_DIR)) {
      fs.mkdirSync(TEMP_DIST_DIR, { recursive: true });
    }
    
    // Compile TypeScript files using our plugin-specific tsconfig
    console.log('Compiling TypeScript files...');
    try {
      execSync(
        `npx tsc --project tsconfig.plugin.json`,
        { stdio: 'inherit', cwd: __dirname }
      );
      console.log('TypeScript compilation complete');
    } catch (compileError) {
      console.error('❌ TypeScript compilation failed:', compileError.message);
      throw new Error('TypeScript compilation failed');
    }
    
    // List output directory to see what was generated
    console.log('Checking output directory contents:');
    try {
      const files = fs.readdirSync(TEMP_DIST_DIR);
      console.log(`Files in ${TEMP_DIST_DIR}:`, files);
    } catch (err) {
      console.error('Error listing output directory:', err.message);
    }
    
    // Read the compiled JS files
    const clientJsPath = path.join(TEMP_DIST_DIR, 'client.js');
    const uiJsPath = path.join(TEMP_DIST_DIR, 'ui.js');
    
    if (!fs.existsSync(clientJsPath)) {
      console.error(`File not found: ${clientJsPath}`);
    }
    
    if (!fs.existsSync(uiJsPath)) {
      console.error(`File not found: ${uiJsPath}`);
    }
    
    if (!fs.existsSync(clientJsPath) || !fs.existsSync(uiJsPath)) {
      throw new Error('Compiled JS files not found. Check TypeScript compilation output.');
    }
    
    console.log('Reading compiled JavaScript files...');
    
    // Read compiled content
    const clientJs = fs.readFileSync(clientJsPath, 'utf8');
    const uiJs = fs.readFileSync(uiJsPath, 'utf8');
    
    console.log(`Client JS size: ${clientJs.length} bytes`);
    console.log(`UI JS size: ${uiJs.length} bytes`);
    
    // Combine JS content (client first, then UI)
    const combinedJs = 
      `// Combined JavaScript compiled from TypeScript\n` +
      `// Source: client.ts\n${clientJs}\n\n` +
      `// Source: ui.ts\n${uiJs}`;
    
    console.log(`Combined JS size: ${combinedJs.length} bytes`);
    
    // Read the HTML template
    if (!fs.existsSync(UI_TEMPLATE_PATH)) {
      throw new Error(`UI template not found: ${UI_TEMPLATE_PATH}`);
    }
    
    let templateContent = fs.readFileSync(UI_TEMPLATE_PATH, 'utf8');
    console.log(`Template HTML size: ${templateContent.length} bytes`);
    
    // Create a backup of the original ui.html if it exists
    if (fs.existsSync(UI_OUTPUT_PATH)) {
      const backupPath = `${UI_OUTPUT_PATH}.bak`;
      fs.copyFileSync(UI_OUTPUT_PATH, backupPath);
      console.log(`Created backup of existing UI HTML at ${backupPath}`);
    }
    
    // Use a simpler replacement approach
    console.log('Replacing external script with inline script...');
    const scriptTag = `<script src="dist/ui.js" type="module"></script>`;
    const inlineScript = `<script>\n${combinedJs}\n</script>`;
    
    // Check if the script tag exists in the template
    if (!templateContent.includes(scriptTag)) {
      console.warn(`Warning: Could not find exact script tag "${scriptTag}" in template`);
      console.log('Falling back to regex replacement');
      
      // Try regex replacement as fallback
      const scriptTagRegex = /<script[^>]*src=["']dist\/ui\.js["'][^>]*><\/script>/;
      if (!scriptTagRegex.test(templateContent)) {
        console.error('Script tag not found using regex either. Template content around line 1000:');
        const lines = templateContent.split('\n');
        console.log(lines.slice(1090, 1100).join('\n'));
      }
      
      templateContent = templateContent.replace(
        scriptTagRegex,
        inlineScript
      );
    } else {
      // Direct string replacement
      templateContent = templateContent.replace(scriptTag, inlineScript);
    }
    
    // Write the final UI HTML with inlined script to the dist directory
    fs.writeFileSync(UI_OUTPUT_PATH, templateContent);
    console.log(`✅ Generated UI HTML with inlined TypeScript in dist directory`);
    
    // Clean up temporary files - use execSync to ensure proper cleanup
    try {
      console.log(`Cleaning up temporary files from ${TEMP_DIST_DIR}...`);
      execSync(`rm -rf "${TEMP_DIST_DIR}"`, { stdio: 'inherit' });
      console.log(`✅ Temporary files cleaned up from ${TEMP_DIST_DIR}`);
    } catch (cleanupError) {
      console.warn(`Warning: Could not clean up temporary files: ${cleanupError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error building TypeScript:', error);
    process.exit(1);
  }
}

// Entrypoint: run the build when this script is executed directly
buildTypeScript();
