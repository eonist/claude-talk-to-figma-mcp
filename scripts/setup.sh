#!/bin/bash

# Detect package manager
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    echo "Bun detected, using it for setup..."
else
    PACKAGE_MANAGER="npm"
    echo "Bun not found, using npm instead..."
fi

# Install dependencies
echo "Installing dependencies..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun install
else
    npm install
fi

# Configure for AI Agent
echo "Configuring for AI Agent..."
node scripts/configure-claude.js

echo "Configuration completed."
echo "To use the MCP, make sure to start the WebSocket server:"
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    echo "bun socket"
else
    echo "npm run socket"
fi 