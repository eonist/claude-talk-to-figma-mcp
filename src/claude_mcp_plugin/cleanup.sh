#!/bin/bash
# Script to clean up temporary build directories

echo "Cleaning up temporary build directories..."

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

echo "✅ Cleanup completed successfully"
