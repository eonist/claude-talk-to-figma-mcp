/**
 * Build script for the Conduit MCP Figma plugin.
 * Bundles individual module files into a single distributable `code.js` for Figma.
 *
 * Process overview:
 * 1. Validates existence of source directories (`src/`, `src/modules/`, `src/modules/utils/`).
 * 2. Concatenates utility files (plugin.js, encoding.js, helpers.js) after stripping imports/exports.
 * 3. Processes feature modules (document, shapes, image, text, styles, components, layout, rename, commands).
 * 4. Bundles the main `index.js` entrypoint last.
 * 5. Writes the combined output to `code.js` in plugin root.
 * 6. Processes the UI template by combining component HTML files and JS modules.
 *
 * Exposed functions (not exported):
 * - readFile(filePath: string): string
 * - buildPlugin(): void
 *
 * @module build
 * @example
 * // Run the build script from project root:
 * node build.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM module URL to filesystem path for __dirname support in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Section

/**
 * @constant {string} SRC_DIR - Root source directory for plugin code
 * @constant {string} MODULES_DIR - Directory containing feature-specific modules (shapes, text, etc.)
 * @constant {string} UTILS_DIR - Directory for common utilities and helper functions
 * @constant {string} OUTPUT_FILE - Final bundled output file for Figma
 */
const SRC_DIR = path.join(__dirname, 'src');
const MODULES_DIR = path.join(SRC_DIR, 'modules');
const UTILS_DIR = path.join(MODULES_DIR, 'utils');
const OUTPUT_FILE = path.join(__dirname, 'dist', 'code.js');

/**
 * @constant {string} COMPONENTS_DIR - Directory containing HTML UI components
 * @constant {string} JS_DIR - Directory containing JavaScript modules for UI
 */
const COMPONENTS_DIR = path.join(__dirname, 'components');
const JS_DIR = path.join(__dirname, 'js');

const cssFiles = [
  { path: path.join(__dirname, 'styles.css'), name: 'styles.css' },
  { path: path.join(__dirname, 'connection.css'), name: 'connection.css' },
  { path: path.join(__dirname, 'tabs.css'), name: 'tabs.css' },
  { path: path.join(__dirname, 'progress.css'), name: 'progress.css' }
];

const componentMappings = [
  { placeholder: '<!-- HEADER_PLACEHOLDER -->', file: 'header.html' },
  { placeholder: '<!-- TABS_PLACEHOLDER -->', file: 'tabs.html' },
  { placeholder: '<!-- CONNECTION_PANEL_PLACEHOLDER -->', file: 'connection-panel.html' },
  { placeholder: '<!-- PROGRESS_CONTAINER_PLACEHOLDER -->', file: 'progress-container.html' },
  { placeholder: '<!-- ABOUT_PANEL_PLACEHOLDER -->', file: 'about-panel.html' }
];

const jsModules = [
  'state.js',
  'connection.js',
  'ui-controller.js',
  'tab-manager.js',
  'message-handler.js',
  'main.js'
];

// WARNING: Every file to be included in the build MUST be listed in moduleOrder below.
// Do NOT re-export or include files elsewhere if they are already listed here.
// Double-inclusion (listing a file here and also re-exporting it elsewhere) will cause
// duplicate declarations and build errors (e.g., "invalid redefinition of lexical identifier").
// Always update moduleOrder when adding, removing, or renaming modules.
// This applies to ALL modules, not just utils.
const moduleOrder = [
  // Utilities and helpers
  'utils/plugin.js',
  'utils/encoding.js',
  'utils/helpers.js',
  'utils.js',
  // Events
  'events/event-emitter.js',
  // Document and related
  'document/document-info.js',
  'document/document-selection.js',
  'document/document-node.js',
  'document/document-css.js',
  'document/document-page.js',
  'document.js',
  // Shapes and geometry
  'shape/shapes-helpers.js',
  'shape/shapes-rectangle.js',
  'shape/shapes-frame.js',
  'shape/shapes-ellipse.js',
  'shape/shapes-polygon.js',
  'shape/shapes-star.js',
  'shape/shapes-vector.js',
  'shape/shapes-line.js',
  'shapes.js',
  // Text
  'text/text-create.js',
  'text/text-edit.js',
  'text/text-scan.js',
  'text/text-helpers.js',
  'text.js',
  //Styles
  'styles/styles-color.js',
  'styles/styles-effects.js',
  'styles/styles-gradient.js',
  'styles/styles-get.js',
  'styles.js',
   // Layout
  'layout/layout-auto.js',
  'layout/layout-group.js',
  'layout/layout-insert.js',
  'layout/layout-flatten.js',
  'layout/layout-clone.js',
  'layout/layout-grid.js',
  'layout/layout-grid-unified.js',
  'layout/layout-guide.js',
  'layout/layout-constraint.js',
  'layout.js',
  // Node
  'node/node-modify.js',
  'node/node-edit.js',
  'node/node-misc.js',
  // Components
  'components/component-variant.js',
  'components.js',
  // Font
  'font/font-set.js',
  'font/font-load.js',
  'font/font-bulk.js',
  'font.js',
  // Include new split command modules before commands.js
  'commands/commands-register.js',
  'commands/commands-button.js',
  'commands.js', // Ensure commands.js is concatenated last as needed.
  // Misc
  'rename.js',
  'svg.js',
  'html-generator.js',
  'variables.js',
  'direct-gradient.js',
  'image.js',
  'ui.js'
];

// Helper Functions

/**
 * Reads a file's contents synchronously
 * 
 * @param {string} filePath - Absolute path to the file
 * @returns {string} Raw file contents as UTF-8 string
 * @throws {Error} If file reading fails
 */
/**
 * Reads a file's contents synchronously
 * 
 * @param {string} filePath - Absolute path to the file
 * @returns {string} Raw file contents as UTF-8 string
 * @throws {Error} If file reading fails
 * @example
 * // Read a module file's contents
 * // const contents = readFile(path.join(__dirname, 'src', 'modules', 'document.js'));
 * // console.log(contents);
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Reads and strips import/export statements from a module file.
 * @param {string} filePath
 * @returns {string}
 */
function readAndStripModule(filePath) {
  let content = readFile(filePath);
  content = content.replace(/import\s+.*from\s+['"].*['"];?\n?/g, '');
  content = content.replace(/export\s+/g, '');
  return content;
}

// Build Process

/**
 * Builds the Figma plugin by combining all source files into a single bundle.
 * 
 * Build process stages:
 * 1. Validation - Checks if required directories exist
 * 2. Utils Processing - Processes utility functions first (plugin.js, encoding.js, helpers.js)
 * 3. Module Processing - Processes feature modules in specific order
 * 4. Index Processing - Processes main plugin entry point (index.js)
 * 
 * For each file processed:
 * - Removes ES module import/export syntax
 * - Removes module operation exports
 * - Preserves the actual implementation code
 * - Adds section headers for better code organization
 *
 * @async
 * @throws {Error} If any critical build step fails
 * @returns {Promise<void>}
 */
async function buildPlugin() {
  console.log('Building Figma plugin...');
  
  try {
    // 1. Validation
    if (!fs.existsSync(SRC_DIR)) {
      console.error(`Error: Source directory not found: ${SRC_DIR}`);
      process.exit(1);
    }
    if (!fs.existsSync(MODULES_DIR)) {
      console.error(`Error: Modules directory not found: ${MODULES_DIR}`);
      process.exit(1);
    }
    
    // 2. Module Concatenation
    let output = '// Figma Plugin - Auto-generated code from build.js\n\n';
    for (const moduleFile of moduleOrder) {
      const modulePath = path.join(MODULES_DIR, moduleFile);
      if (fs.existsSync(modulePath)) {
        let moduleContent = readAndStripModule(modulePath);
        output += `// ----- ${path.basename(moduleFile, '.js')} Module -----\n`;
        output += moduleContent + '\n\n';
      } else {
        console.warn(`Warning: Module file not found: ${modulePath}`);
      }
    }
    
    // 3. Main Entrypoint
    const indexPath = path.join(SRC_DIR, 'index.js');
    let indexContent = readFile(indexPath);
    indexContent = indexContent.replace(/import\s+.*from\s+['"].*['"];?\n?/g, '');
    indexContent = indexContent.replace(/import\s+{[^}]*}\s+from\s+['"].*['"];?\n?/g, '');
    indexContent = indexContent.replace(/const\s+{[^}]*}\s*=\s*\w+Operations;?\n?/g, '');
    indexContent = indexContent.replace(/\/\/\s*Import\s+modules.*\n/gi, '');
    indexContent = indexContent.replace(/export\s+{[^}]*};?\n?/g, '');
    output += '// ----- Main Plugin Code -----\n';
    output += indexContent;
    
    // 4. Write plugin bundle
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`✅ Generated code.js in dist directory`);
    
    // 5. UI HTML/CSS/JS Bundling
    try {
      const templatePath = path.join(__dirname, 'ui-template.html');
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
      }
      for (const cssFile of cssFiles) {
        if (!fs.existsSync(cssFile.path)) {
          throw new Error(`CSS file not found: ${cssFile.path}`);
        }
      }
      // Read and combine CSS
      let templateContent = fs.readFileSync(templatePath, 'utf8');
      let combinedCss = '';
      for (const cssFile of cssFiles) {
        console.log(`Adding ${cssFile.name}...`);
        const cssContent = fs.readFileSync(cssFile.path, 'utf8');
        combinedCss += `/* ${cssFile.name} */\n${cssContent}\n\n`;
      }
      const styleTag = `<style>\n${combinedCss}</style>`;
      templateContent = templateContent.replace('<!-- STYLES_PLACEHOLDER -->', styleTag);
      // HTML components
      for (const component of componentMappings) {
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
      // JS modules
      let combinedJs = '';
      for (const jsModule of jsModules) {
        const jsPath = path.join(JS_DIR, jsModule);
        if (fs.existsSync(jsPath)) {
          console.log(`Adding JavaScript module: ${jsModule}`);
          const jsContent = fs.readFileSync(jsPath, 'utf8');
          combinedJs += `/* ${jsModule} */\n${jsContent}\n\n`;
        } else {
          console.warn(`Warning: JavaScript module not found: ${jsPath}`);
        }
      }
      const scriptTag = `<script>\n${combinedJs}</script>`;
      templateContent = templateContent.replace('<!-- SCRIPTS_PLACEHOLDER -->', scriptTag);
      // Write UI HTML
      const outputPath = path.join(__dirname, 'dist', 'ui.html');
      fs.writeFileSync(outputPath, templateContent);
      console.log('✅ Generated ui.html with embedded styles, components, and scripts in dist directory');
    } catch (error) {
      console.error('❌ Error generating ui.html:', error);
      process.exit(1);
    }
    
    console.log('✅ Figma plugin core built successfully!');
    
    // 6. TypeScript Build for UI
    try {
      console.log('Building TypeScript for UI...');
      const { execSync } = await import('child_process');
      execSync('node build-ts.js', { stdio: 'inherit', cwd: __dirname });
      console.log('✅ TypeScript build complete');
    } catch (error) {
      console.error('❌ Error building TypeScript:', error);
      // Continue with the process, don't exit
    }
    
  } catch (error) {
    console.error('❌ Error building plugin:', error);
    process.exit(1);
  }
}

/**
 * Entrypoint: Initiates the build process when this script is run directly.
 */
buildPlugin().catch(error => {
  console.error("Build process failed:", error);
  process.exit(1);
});
