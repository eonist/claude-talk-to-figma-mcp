/**
 * Enhanced build script for the Conduit MCP Figma plugin UI.
 * 
 * This script is specifically for building the plugin's UI (ui.html file).
 * It does NOT generate code.js, which is produced by the build.js script.
 * 
 * It combines the functionality of both the UI part of build.js and build-ts.js:
 * 1. Compiles TypeScript (ui.ts) using esbuild
 * 2. Processes all CSS files (styles.css, connection.css, tabs.css, progress.css)
 * 3. Includes all HTML components from the components/ directory
 * 4. Includes all JavaScript modules from the js/ directory
 * 5. Combines everything into a single ui.html file with no external dependencies
 * 
 * This approach eliminates the need for the external dist/ui.js file that was
 * previously loaded by the HTML, improving load times and reliability.
 * 
 * Usage:
 * node src/conduit_mcp_plugin/direct-build.js
 * or
 * npm run build:ui
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Convert ESM module URL to filesystem path for __dirname support in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const SRC_DIR = path.join(__dirname, 'src');
const TEMP_DIR = path.join(__dirname, 'temp');
const UI_TEMPLATE_PATH = path.join(__dirname, 'ui-template.html');
const UI_OUTPUT_PATH = path.join(__dirname, 'dist', 'ui.html');
const BUNDLE_PATH = path.join(TEMP_DIR, 'bundle.js');

// CSS and Components paths
const COMPONENTS_DIR = path.join(__dirname, 'components');
const JS_DIR = path.join(__dirname, 'js');
const CSS_FILES = [
  { path: path.join(__dirname, 'styles.css'), name: 'styles.css' },
  { path: path.join(__dirname, 'connection.css'), name: 'connection.css' },
  { path: path.join(__dirname, 'tabs.css'), name: 'tabs.css' },
  { path: path.join(__dirname, 'progress.css'), name: 'progress.css' }
];

// Component mappings - placeholders to HTML files
const COMPONENT_MAPPINGS = [
  { placeholder: '<!-- HEADER_PLACEHOLDER -->', file: 'header.html' },
  { placeholder: '<!-- TABS_PLACEHOLDER -->', file: 'tabs.html' },
  { placeholder: '<!-- CONNECTION_PANEL_PLACEHOLDER -->', file: 'connection-panel.html' },
  { placeholder: '<!-- PROGRESS_CONTAINER_PLACEHOLDER -->', file: 'progress-container.html' },
  { placeholder: '<!-- ABOUT_PANEL_PLACEHOLDER -->', file: 'about-panel.html' }
];

// JS modules to include
const JS_MODULES = [
  'state.js',
  'connection.js',
  'ui-controller.js',
  'tab-manager.js',
  'message-handler.js',
  'main.js'
];

/**
 * Main build function that orchestrates the entire UI building process
 */
function buildUI() {
  console.log('Building UI with enhanced process...');
  
  try {
    // Step 1: Ensure temp directory exists
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
    
    // Step 2: Use esbuild to bundle TypeScript files
    console.log('Bundling TypeScript with esbuild...');
    execSync(
      `npx esbuild ${path.join(SRC_DIR, 'ui.ts')} --bundle --outfile=${BUNDLE_PATH} --platform=browser`,
      { stdio: 'inherit' }
    );
    
    console.log('✅ Bundle created successfully');
    
    // Read the bundled JS
    if (!fs.existsSync(BUNDLE_PATH)) {
      throw new Error(`Bundle not found at ${BUNDLE_PATH}`);
    }
    
    const bundledJs = fs.readFileSync(BUNDLE_PATH, 'utf8');
    console.log(`Bundle size: ${bundledJs.length} bytes`);
    
    // Read the HTML template
    if (!fs.existsSync(UI_TEMPLATE_PATH)) {
      throw new Error(`UI template not found: ${UI_TEMPLATE_PATH}`);
    }
    
    let templateContent = fs.readFileSync(UI_TEMPLATE_PATH, 'utf8');
    
    // Create a backup of the original ui.html if it exists
    if (fs.existsSync(UI_OUTPUT_PATH)) {
      const backupPath = `${UI_OUTPUT_PATH}.bak`;
      fs.copyFileSync(UI_OUTPUT_PATH, backupPath);
      console.log(`Created backup of existing UI HTML at ${backupPath}`);
    }
    
    // Step 3: Process CSS files
    console.log('Processing CSS files...');
    let combinedCss = '';
    
    for (const cssFile of CSS_FILES) {
      if (fs.existsSync(cssFile.path)) {
        console.log(`Adding ${cssFile.name}...`);
        const cssContent = fs.readFileSync(cssFile.path, 'utf8');
        combinedCss += `/* ${cssFile.name} */\n${cssContent}\n\n`;
      } else {
        console.warn(`Warning: CSS file not found: ${cssFile.path}`);
      }
    }
    
    // Create style tag with combined CSS content
    const styleTag = `<style>\n${combinedCss}</style>`;
    
    // Replace styles placeholder
    templateContent = templateContent.replace('<!-- STYLES_PLACEHOLDER -->', styleTag);
    
    // Step 4: Process HTML components
    console.log('Processing HTML components...');
    
    for (const component of COMPONENT_MAPPINGS) {
      const componentPath = path.join(COMPONENTS_DIR, component.file);
      if (fs.existsSync(componentPath)) {
        console.log(`Adding component: ${component.file}`);
        const componentContent = fs.readFileSync(componentPath, 'utf8');
        templateContent = templateContent.replace(component.placeholder, componentContent);
      } else {
        console.warn(`Warning: Component file not found: ${componentPath}`);
        templateContent = templateContent.replace(component.placeholder, `<!-- Component ${component.file} not found -->`);
      }
    }
    
    // Step 5: Process JavaScript modules from js/ directory
    console.log('Processing JavaScript modules...');
    let combinedJsModules = '';
    
    for (const jsModule of JS_MODULES) {
      const jsPath = path.join(JS_DIR, jsModule);
      if (fs.existsSync(jsPath)) {
        console.log(`Adding JavaScript module: ${jsModule}`);
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        combinedJsModules += `/* ${jsModule} */\n${jsContent}\n\n`;
      } else {
        console.warn(`Warning: JavaScript module not found: ${jsPath}`);
      }
    }
    
    // Create script tag with combined JS modules
    const jsModulesTag = `<script>\n${combinedJsModules}</script>`;
    
    // Step 6: Handle TypeScript bundle
    const tsScriptTag = `<script>\n${bundledJs}\n</script>`;
    
    // Replace script placeholders
    // First replace the main SCRIPTS_PLACEHOLDER with the JS modules
    templateContent = templateContent.replace('<!-- SCRIPTS_PLACEHOLDER -->', jsModulesTag);
    
    // Then replace the TypeScript script tag
    const originalScriptTag = '<script src="dist/ui.js" type="module"></script>';
    
    // Check if the original script tag exists in the template
    if (templateContent.includes(originalScriptTag)) {
      // Direct string replacement
      templateContent = templateContent.replace(originalScriptTag, tsScriptTag);
    } else {
      // Try regex replacement as a fallback
      console.log('Script tag not found, trying regex replacement...');
      const scriptTagRegex = /<script[^>]*src=["']dist\/ui\.js["'][^>]*><\/script>/;
      if (scriptTagRegex.test(templateContent)) {
        templateContent = templateContent.replace(scriptTagRegex, tsScriptTag);
      } else {
        console.warn('Warning: Could not find TypeScript script tag to replace');
        // Add the script at the end before </body>
        templateContent = templateContent.replace('</body>', `${tsScriptTag}\n</body>`);
      }
    }
    
    // Step 7: Write the final HTML to the dist directory
    fs.writeFileSync(UI_OUTPUT_PATH, templateContent);
    console.log(`✅ Generated UI HTML with all components, styles, and scripts inlined in dist directory`);
    
    // Clean up temporary files
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('✅ Cleaned up temporary files');
    
  } catch (error) {
    console.error('❌ Error building UI:', error);
    process.exit(1);
  }
}

// Run the build
buildUI();
