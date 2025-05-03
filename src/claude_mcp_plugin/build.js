// Build script for Figma Plugin
// This script bundles modular code into a single file ("code.js") that can be loaded by Figma

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the current file's directory using ESM-compatible methods.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define key directories and output file path.
const SRC_DIR = path.join(__dirname, 'src');               // Source directory containing plugin code
const MODULES_DIR = path.join(SRC_DIR, 'modules');           // Modules folder for different plugin parts
const UTILS_DIR = path.join(MODULES_DIR, 'utils');           // Utility functions (e.g., plugin, encoding, helpers)
const OUTPUT_FILE = path.join(__dirname, 'code.js');         // Output file that will contain bundled code

/**
 * Reads a file synchronously and returns its content as a string.
 *
 * @param {string} filePath - The full path to the file to be read.
 * @returns {string} The file content.
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Builds the Figma plugin by concatenating modular code into a single output file.
 *
 * The build process involves:
 * - Checking that the required directories exist.
 * - Processing the utils directory (if available) in a specific order.
 * - Stripping out ES module import/export statements from each file.
 * - Processing other module files in a defined order.
 * - Finally, appending the main index.js content (with necessary modifications).
 *
 * If any step fails (e.g., a required directory is missing), the build script logs an error and exits.
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
        moduleContent = moduleContent.replace(/export\s+const\s+\w+Operations\s*=\s*{[^}]*};?\n?/g, '');
        
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

// Execute the build process.
buildPlugin();
