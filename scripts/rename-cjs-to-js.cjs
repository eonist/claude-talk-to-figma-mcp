const fs = require('fs');
const path = require('path');

function renameCjsToJs(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      renameCjsToJs(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.cjs')) {
      const newPath = fullPath.replace(/\.cjs$/, '.js');
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed: ${fullPath} -> ${newPath}`);
    }
  });
}

renameCjsToJs(path.join(__dirname, '..', 'dist'));
