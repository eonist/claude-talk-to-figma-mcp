#!/usr/bin/env node

/**
 * Script to configure the Claude AI agent for the Conduit MCP server.
 * - Backs up and updates the Claude desktop configuration file.
 * - Adds MCP server configuration for ClaudeTalkToFigma.
 * - Detects Bun or falls back to npx.
 * - Provides instructions for using the MCP in AI Agent.
 *
 * Usage: node configure-claude.js
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the location of AI agent configuration file
const configPath = os.platform() === 'darwin' 
  ? path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
  : path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');

// Get the absolute path of package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageName = packageJson.name;
const packageVersion = packageJson.version;

console.log(`Configuring AI agent for ${packageName} v${packageVersion}...`);

// Create backups
/**
 * Creates a timestamped backup of a file if it exists.
 * @param {string} filePath - Path to the file to back up.
 */
function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Backup created at: ${backupPath}`);
  }
}

// Read existing configuration or create new one
let config = {};
try {
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Existing configuration found.');
    backupFile(configPath);
  } else {
    console.log('No existing configuration found. Creating new one.');
    
    // Create required directories if they don't exist
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`Directory created: ${configDir}`);
    }
  }
} catch (e) {
  console.error(`Error reading existing configuration: ${e.message}`);
  console.error('Creating new configuration.');
}

// Check if bun is installed
let useBun = false;
try {
  execSync('bun --version', { stdio: 'ignore' });
  useBun = true;
  console.log('Bun detected on the system.');
} catch (e) {
  console.log('Bun is not installed. Using npx as an alternative.');
}

// Add MCP configuration
config.mcpServers = config.mcpServers || {};
config.mcpServers['ClaudeTalkToFigma'] = {
  command: 'npx',
  args: [`${packageName}@latest`]
};

console.log('Updated configuration for ClaudeTalkToFigma:');
console.log(JSON.stringify(config.mcpServers['ClaudeTalkToFigma'], null, 2));

// Write configuration
try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Configuration saved to ${configPath}`);
  console.log('\nConfiguration completed successfully.');
  console.log('\nTo use this MCP in AI Agentp:');
  console.log('1. Restart AI Agent if it\'s running');
  console.log('2. Open AI Agent and select "ConduitMCPServer" from the MCPs list');
  console.log(`3. Start the WebSocket server: npx ${packageName}-socket`);
  console.log('4. Install and run the Figma plugin');
} catch (e) {
  console.error(`Error writing configuration: ${e.message}`);
  console.error(`Make sure you have write permissions for: ${configPath}`);
}
