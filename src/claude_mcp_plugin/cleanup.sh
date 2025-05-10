#!/bin/bash
# Script to clean up temporary build directories and legacy files

echo "Cleaning up temporary build directories and legacy files..."

# Remove temp-dist directory
if [ -d "temp-dist" ]; then
  echo "Removing temp-dist directory..."
  rm -rf temp-dist
fi

# Remove temp directory
if [ -d "temp" ]; then
  echo "Removing temp directory..."
  rm -rf temp
fi

# Remove any backup files
find . -name "*.bak" -type f -exec rm {} \;

# Remove legacy root files that are now only in dist/
if [ -f "code.js" ]; then
  echo "Removing legacy code.js from root directory..."
  rm code.js
fi

if [ -f "ui.html" ]; then
  echo "Removing legacy ui.html from root directory..."
  rm ui.html
fi

echo "✅ Cleanup completed successfully"
