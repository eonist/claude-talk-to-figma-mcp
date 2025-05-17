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

// Directory structure configuration
const SRC_DIR = path.join(__dirname, 'src');         // Root source directory for plugin code
const MODULES_DIR = path.join(SRC_DIR, 'modules');   // Contains feature-specific modules (shapes, text, etc.)
const UTILS_DIR = path.join(MODULES_DIR, 'utils');   // Common utilities and helper functions
const OUTPUT_FILE = path.join(__dirname, 'dist', 'code.js'); // Final bundled output file for Figma

// UI component directories
const COMPONENTS_DIR = path.join(__dirname, 'components'); // HTML components
const JS_DIR = path.join(__dirname, 'js');               // JavaScript modules

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
 * Builds the Figma plugin by combining all source files into a single bundle
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
 * @throws {Error} If any critical build step fails
 */
async function buildPlugin() {
  console.log('Building Figma plugin...');
  
  try {
    // Ensure the primary source directory exists.
    if (!fs.existsSync(SRC_DIR)) {
      console.error(`Error: Source directory not found: ${SRC_DIR}`);
      process.exit(1);
    }
    
    // Ensure the modular code directory exists.
    if (!fs.existsSync(MODULES_DIR)) {
      console.error(`Error: Modules directory not found: ${MODULES_DIR}`);
      process.exit(1);
    }
    
    // Initialize the output string with a header comment.
    let output = '// Figma Plugin - Auto-generated code from build.js\n\n';
    
    // Process utilities first.
    if (fs.existsSync(UTILS_DIR)) {
      // Define the order to process specific utility files.
      const utilsFiles = ['plugin.js', 'encoding.js', 'helpers.js'];
      output += '// ----- Utils Module -----\n';
      
      for (const utilFile of utilsFiles) {
        const utilPath = path.join(UTILS_DIR, utilFile);
        if (fs.existsSync(utilPath)) {
          let utilContent = readFile(utilPath);
          // Remove any export statements to convert module exports to regular declarations.
          utilContent = utilContent.replace(/export\s+/g, '');
          // Remove import statements as dependencies will be concatenated in this build.
          utilContent = utilContent.replace(/import\s+.*from\s+['"].*['"];?\n?/g, '');
          
          output += `// ----- Utils/${utilFile} -----\n`;
          output += utilContent + '\n\n';
        }
      }
    } else {
      // Fallback: If UTILS_DIR doesn't exist, attempt to process the older utils.js file located in modules.
      const utilsPath = path.join(MODULES_DIR, 'utils.js');
      if (fs.existsSync(utilsPath)) {
        let utilsContent = readFile(utilsPath);
        utilsContent = utilsContent.replace(/export\s+/g, '');
        output += '// ----- Utils Module -----\n';
        output += utilsContent + '\n\n';
      }
    }
    
    // List of other module files to be added in the defined order.
    const moduleOrder = [
      'document.js',
      'shapes.js',
      'shape/shapes-rectangle.js',
      'shape/shapes-frame.js',
      'shape/shapes-ellipse.js',
      'shape/shapes-polygon.js',
      'shape/shapes-star.js',
      'shape/shapes-vector.js',
      'shape/shapes-line.js',
      'image.js',
      'text.js',
      'styles.js',
      'components.js',
      'layout.js',
      'rename.js',
      'svg.js',
      'html-generator.js',
      'commands.js', // Ensure commands.js is concatenated last as needed.
    ];
    
    // Process each module file.
    for (const moduleFile of moduleOrder) {
      const modulePath = path.join(MODULES_DIR, moduleFile);
      if (fs.existsSync(modulePath)) {
        let moduleContent = readFile(modulePath);
        
        // Remove any import statements as they will be inlined.
        moduleContent = moduleContent.replace(/import\s+.*from\s+['"].*['"];?\n?/g, '');
        // Remove export keywords to embed the declarations directly.
        moduleContent = moduleContent.replace(/export\s+/g, '');
        // Optionally remove export objects declarations.
        // moduleContent = moduleContent.replace(/export\s+const\s+\w+Operations\s*=\s*{[^}]*};?\n?/g, '');
        
        output += `// ----- ${path.basename(moduleFile, '.js')} Module -----\n`;
        output += moduleContent + '\n\n';
      } else {
        console.warn(`Warning: Module file not found: ${modulePath}`);
      }
    }
    
    // Process the main index.js file.
    const indexPath = path.join(SRC_DIR, 'index.js');
    let indexContent = readFile(indexPath);
    
    // Remove import statements from index.js.
    indexContent = indexContent.replace(/import\s+.*from\s+['"].*['"];?\n?/g, '');
    indexContent = indexContent.replace(/import\s+{[^}]*}\s+from\s+['"].*['"];?\n?/g, '');
    indexContent = indexContent.replace(/const\s+{[^}]*}\s*=\s*\w+Operations;?\n?/g, '');
    
    // Remove comment lines referencing imports.
    indexContent = indexContent.replace(/\/\/\s*Import\s+modules.*\n/gi, '');
    
    // Remove any export statements at the end from index.js.
    indexContent = indexContent.replace(/export\s+{[^}]*};?\n?/g, '');
    
    output += '// ----- Main Plugin Code -----\n';
    output += indexContent;
    
    // Create the dist directory if it doesn't exist
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Write the output to the dist directory
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`✅ Generated code.js in dist directory`);
    
    // Generate the UI HTML file from template and CSS and components
    try {
      // Define paths
      const templatePath = path.join(__dirname, 'ui-template.html');
      const stylesPath = path.join(__dirname, 'styles.css');
      const connectionPath = path.join(__dirname, 'connection.css');
      const tabsPath = path.join(__dirname, 'tabs.css');
      const progressPath = path.join(__dirname, 'progress.css');
      const outputPath = path.join(__dirname, 'dist', 'ui.html');
      
      // Check if template and CSS files exist
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
      }
      
      const cssFiles = [
        { path: stylesPath, name: 'styles.css' },
        { path: connectionPath, name: 'connection.css' },
        { path: tabsPath, name: 'tabs.css' },
        { path: progressPath, name: 'progress.css' }
      ];
      
      for (const cssFile of cssFiles) {
        if (!fs.existsSync(cssFile.path)) {
          throw new Error(`CSS file not found: ${cssFile.path}`);
        }
      }
      
      // Read content from template and CSS files
      console.log('Reading template and CSS files...');
      let templateContent = fs.readFileSync(templatePath, 'utf8');
      
      // Read and combine all CSS files
      console.log('Combining CSS files...');
      let combinedCss = '';
      
      for (const cssFile of cssFiles) {
        console.log(`Adding ${cssFile.name}...`);
        const cssContent = fs.readFileSync(cssFile.path, 'utf8');
        combinedCss += `/* ${cssFile.name} */\n${cssContent}\n\n`;
      }
      
      // Create style tag with combined CSS content
      const styleTag = `<style>\n${combinedCss}</style>`;
      
      // Replace placeholder with actual styles
      templateContent = templateContent.replace('<!-- STYLES_PLACEHOLDER -->', styleTag);
      
      // Process HTML components
      console.log('Processing HTML components...');
      
      // Define component placeholders and file mappings
      const componentMappings = [
        { placeholder: '<!-- HEADER_PLACEHOLDER -->', file: 'header.html' },
        { placeholder: '<!-- TABS_PLACEHOLDER -->', file: 'tabs.html' },
        { placeholder: '<!-- CONNECTION_PANEL_PLACEHOLDER -->', file: 'connection-panel.html' },
        { placeholder: '<!-- PROGRESS_CONTAINER_PLACEHOLDER -->', file: 'progress-container.html' },
        { placeholder: '<!-- ABOUT_PANEL_PLACEHOLDER -->', file: 'about-panel.html' }
      ];
      
      // Replace each component placeholder with the actual component content
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
      
      // Process JavaScript modules
      console.log('Processing JavaScript modules...');
      
      // Define JavaScript module order
      const jsModules = [
        'state.js',
        'connection.js',
        'ui-controller.js',
        'tab-manager.js',
        'message-handler.js',
        'main.js'
      ];
      
      // Combine JS modules
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
      
      // Create script tag with combined JS
      const scriptTag = `<script>\n${combinedJs}</script>`;
      
      // Replace script placeholder
      templateContent = templateContent.replace('<!-- SCRIPTS_PLACEHOLDER -->', scriptTag);
      
      // Write to the dist directory
      fs.writeFileSync(outputPath, templateContent);
      console.log('✅ Generated ui.html with embedded styles, components, and scripts in dist directory');
      
    } catch (error) {
      console.error('❌ Error generating ui.html:', error);
      process.exit(1);
    }
    
    console.log('✅ Figma plugin core built successfully!');
    
    // Now compile and inline TypeScript
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

// Initiate the build process
buildPlugin().catch(error => {
  console.error("Build process failed:", error);
  process.exit(1);
});
