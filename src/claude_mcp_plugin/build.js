/**
 * Build script for Figma Plugin
 * 
 * This script combines modular JavaScript code into a single file (code.js) that Figma can load.
 * The build process concatenates files in a specific order, removes ES module syntax,
 * and ensures proper dependency inclusion.
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
const OUTPUT_FILE = path.join(__dirname, 'code.js'); // Final bundled output file for Figma

/**
 * Reads a file's contents synchronously
 * 
 * @param {string} filePath - Absolute path to the file
 * @returns {string} Raw file contents as UTF-8 string
 * @throws {Error} If file reading fails
 * @example
 * // Read a module file’s contents
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
function buildPlugin() {
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
      'image.js',
      'text.js',
      'styles.js',
      'components.js',
      'layout.js',
      'rename.js',
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
    
    // Write the aggregated content to the designated output file.
    fs.writeFileSync(OUTPUT_FILE, output);
    
    console.log('✅ Figma plugin built successfully!');
  } catch (error) {
    console.error('❌ Error building plugin:', error);
    process.exit(1);
  }
}

// Initiate the build process
buildPlugin();
