// Build script for Figma plugin
// This script bundles all modular code into a single file for Figma

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const SRC_DIR = path.join(__dirname, 'src');
const MODULES_DIR = path.join(SRC_DIR, 'modules');
const OUTPUT_FILE = path.join(__dirname, 'code.js');

// Function to read a file and return its content
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Create output build
function buildPlugin() {
  console.log('Building Figma plugin...');
  
  try {
    // Check if directories exist
    if (!fs.existsSync(SRC_DIR)) {
      console.error(`Error: Source directory not found: ${SRC_DIR}`);
      process.exit(1);
    }
    
    if (!fs.existsSync(MODULES_DIR)) {
      console.error(`Error: Modules directory not found: ${MODULES_DIR}`);
      process.exit(1);
    }
    
    // Start building the output content
    let output = '// Figma Plugin - Auto-generated code from build.js\n\n';
    
    // First, include the utility functions since other modules depend on them
    const utilsPath = path.join(SRC_DIR, 'modules/utils.js');
    let utilsContent = readFile(utilsPath);
    
    // Strip out export statements and convert to regular functions/constants
    utilsContent = utilsContent.replace(/export\s+/g, '');
    
    // Add utils content to output
    output += '// ----- Utils Module -----\n';
    output += utilsContent + '\n\n';
    
    // Add other module files in a specific order
    const moduleOrder = [
      'document.js',
      'shapes.js',
      'text.js',
      'styles.js',
      'components.js',
      'layout.js',
      'rename.js',
    ];
    
    for (const moduleFile of moduleOrder) {
      const modulePath = path.join(MODULES_DIR, moduleFile);
      if (fs.existsSync(modulePath)) {
        // Read the module content
        let moduleContent = readFile(modulePath);
        
        // Strip out imports and exports
        moduleContent = moduleContent.replace(/import\s+.*from\s+['"].*['"];?\n?/g, '');
        moduleContent = moduleContent.replace(/export\s+/g, '');
        moduleContent = moduleContent.replace(/export\s+const\s+\w+Operations\s*=\s*{[^}]*};?\n?/g, '');
        
        // Add module content to output
        output += `// ----- ${path.basename(moduleFile, '.js')} Module -----\n`;
        output += moduleContent + '\n\n';
      } else {
        console.warn(`Warning: Module file not found: ${modulePath}`);
      }
    }
    
    // Finally, add the main index.js content but strip imports and adjust as needed
    const indexPath = path.join(SRC_DIR, 'index.js');
    let indexContent = readFile(indexPath);
    
    // More thoroughly remove all imports and exports from index.js
    indexContent = indexContent.replace(/import\s+.*from\s+['"].*['"];?\n?/g, '');
    indexContent = indexContent.replace(/import\s+{[^}]*}\s+from\s+['"].*['"];?\n?/g, '');
    indexContent = indexContent.replace(/const\s+{[^}]*}\s*=\s*\w+Operations;?\n?/g, '');
    
    // Also remove any comment lines that mention imports
    indexContent = indexContent.replace(/\/\/\s*Import\s+modules.*\n/gi, '');
    
    // Remove export statement at the end
    indexContent = indexContent.replace(/export\s+{[^}]*};?\n?/g, '');
    
    // Add index content to output
    output += '// ----- Main Plugin Code -----\n';
    output += indexContent;
    
    // Write the output to the file
    fs.writeFileSync(OUTPUT_FILE, output);
    
    console.log('✅ Figma plugin built successfully!');
  } catch (error) {
    console.error('❌ Error building plugin:', error);
    process.exit(1);
  }
}

// Execute the build
buildPlugin();
