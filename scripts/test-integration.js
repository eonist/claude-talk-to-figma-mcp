#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Console colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[✓]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bold}[STEP]${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.magenta}${colors.bold}== ${msg} ==${colors.reset}\n`)
};

// Function to create a readline interface for user input
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Function to ask the user a question
async function askQuestion(question) {
  const rl = createInterface();
  return new Promise(resolve => {
    rl.question(`${colors.yellow}? ${question}${colors.reset} `, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Check if port is in use
function isPortInUse(port) {
  try {
    const server = createServer();
    return new Promise((resolve) => {
      server.once('error', err => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      
      server.once('listening', () => {
        server.close();
        resolve(false);
      });
      
      server.listen(port);
    });
  } catch (err) {
    log.error(`Error checking port ${port}: ${err.message}`);
    return Promise.resolve(true); // Assume it's in use if there's an error
  }
}

// Verificar dependencias
async function checkDependencies() {
  log.step('Verifying installed dependencies');
  
  try {
    log.info('Verifying Bun...');
    execSync('bun --version', { stdio: 'pipe' });
    log.success('Bun is installed');
  } catch (err) {
    log.error('Bun is not installed. Please install it from https://bun.sh');
    process.exit(1);
  }

  // Verificar MCP SDK
  try {
    log.info('Verifying @modelcontextprotocol/sdk...');
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    if (packageJson.dependencies['@modelcontextprotocol/sdk']) {
      log.success('MCP SDK is included in package.json');
    } else {
      log.error('MCP SDK is not included in package.json');
      process.exit(1);
    }
  } catch (err) {
    log.error(`Could not read package.json: ${err.message}`);
    process.exit(1);
  }
}

// Check Claude Desktop configuration
async function checkClaudeConfig() {
  log.step('Verifying Claude Desktop configuration');

  const configPath = process.platform === 'darwin' 
    ? path.join(process.env.HOME, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
    : path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');

  log.info(`Looking for configuration file in: ${configPath}`);
  
  try {
    if (!fs.existsSync(configPath)) {
      log.warning('Claude Desktop configuration file not found');
      const shouldConfigure = await askQuestion('Do you want to configure Claude Desktop now? (y/n)');
      
      if (shouldConfigure.toLowerCase() === 'y') {
        log.info('Running configuration script...');
        execSync('bun run configure-claude', { stdio: 'inherit', cwd: rootDir });
        log.success('Configuration completed');
      } else {
        log.warning('Configuration skipped. MCP may not work correctly');
      }
      return;
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.mcpServers && config.mcpServers['ClaudeTalkToFigma']) {
      log.success('ClaudeTalkToFigma configuration found in Claude Desktop');
    } else {
      log.warning('ClaudeTalkToFigma is not configured in Claude Desktop');
      const shouldConfigure = await askQuestion('Do you want to configure Claude Desktop now? (y/n)');
      
      if (shouldConfigure.toLowerCase() === 'y') {
        log.info('Running configuration script...');
        execSync('bun run configure-claude', { stdio: 'inherit', cwd: rootDir });
        log.success('Configuration completed');
      } else {
        log.warning('Configuration skipped. MCP may not work correctly');
      }
    }
  } catch (err) {
    log.error(`Error verifying configuration: ${err.message}`);
  }
}

// Start WebSocket server
async function startWebSocketServer() {
  log.step('Starting WebSocket server');
  
  // Check if port 3055 is in use
  const portInUse = await isPortInUse(3055);
  if (portInUse) {
    log.warning('Port 3055 is already in use. Possibly the WebSocket server is already running.');
    const shouldContinue = await askQuestion('Do you want to continue with tests? (y/n)');
    if (shouldContinue.toLowerCase() !== 'y') {
      log.info('Tests cancelled. Release port 3055 and try again.');
      process.exit(0);
    }
    
    log.info('Continuing tests with existing WebSocket server');
    return null;
  }
  
  log.info('Starting WebSocket server on port 3055...');
  const wsServer = spawn('bun', ['run', 'src/socket.ts'], { 
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  wsServer.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message.includes('WebSocket server running')) {
      log.success('WebSocket server started successfully');
    }
    console.log(`${colors.cyan}[WebSocket]${colors.reset} ${message}`);
  });
  
  wsServer.stderr.on('data', (data) => {
    console.error(`${colors.red}[WebSocket Error]${colors.reset} ${data.toString().trim()}`);
  });
  
  // Wait for the server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return wsServer;
}

// Check WebSocket server status
async function checkWebSocketStatus() {
  log.step('Verifying WebSocket server status');
  
  try {
    log.info('Consulting status endpoint...');
    
    // Perform HTTP request to status endpoint
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:3055/status');
        if (!response.ok) {
          throw new Error(`Unexpected response: ${response.status} ${response.statusText}`);
        }
        return await response.json();
      } catch (err) {
        throw err;
      }
    };
    
    // Try up to 3 times with 1 second wait between attempts
    let status = null;
    let tries = 0;
    while (tries < 3) {
      try {
        status = await fetchStatus();
        break;
      } catch (err) {
        tries++;
        if (tries < 3) {
          log.warning(`Attempt ${tries} failed: ${err.message}`);
          await new Promise(r => setTimeout(r, 1000));
        } else {
          throw err;
        }
      }
    }
    
    if (status) {
      log.success('WebSocket server is running');
      log.info(`Statistics: ${JSON.stringify(status.stats)}`);
      return true;
    }
  } catch (err) {
    log.error(`Could not verify server status: ${err.message}`);
    return false;
  }
}

// Check Figma plugin
async function checkFigmaPlugin() {
  log.step('Verifying Figma plugin access');
  
  try {
    log.info('This project uses a custom Claude MCP Plugin for Figma');
    log.info('The plugin code is located in the src/conduit_mcp_plugin directory');
    
    // Ask if the user has already installed the plugin
    const isPluginInstalled = await askQuestion('Have you installed the Claude MCP Plugin as a development plugin in Figma? (y/n)');
    if (isPluginInstalled.toLowerCase() !== 'y') {
      log.warning('Please install the plugin before continuing with tests');
      log.info('1. Open Figma');
      log.info('2. Go to Menu > Plugins > Development > New Plugin');
      log.info('3. Select "Link existing plugin"');
      log.info('4. Navigate to and select the folder `src/conduit_mcp_plugin` from this repository');
      return false;
    } else {
      log.success('Plugin installed as per user');
    }
    
    log.info('\nTo use the plugin in Figma:');
    log.info('1. Open Figma');
    log.info('2. Go to Plugins > Development > Claude MCP Plugin');
    log.info('3. Enter port 3055 and connect to the WebSocket server');
    
    return true;
  } catch (err) {
    log.error(`Error verifying plugin: ${err.message}`);
    return false;
  }
}

// Run integration tests
async function runIntegrationTests() {
  log.title('CLAUDE-FIGMA INTEGRATION TESTS');
  
  // Check dependencies
  await checkDependencies();
  
  // Check Claude configuration
  await checkClaudeConfig();
  
  // Start and verify WebSocket server
  const wsServer = await startWebSocketServer();
  const serverStatus = await checkWebSocketStatus();
  
  if (!serverStatus) {
    log.error('Could not verify WebSocket server. Aborting tests.');
    if (wsServer) wsServer.kill();
    process.exit(1);
  }
  
  // Check Figma plugin
  await checkFigmaPlugin();
  
  // Instructions for manual tests
  log.step('Performing manual integration tests');
  
  log.info('\nTo complete integration tests, follow these steps:');
  log.info('1. Open Claude Desktop');
  log.info('2. Select "ClaudeTalkToFigma" in the MCP selector');
  log.info('3. Open Figma and run the Claude MCP Plugin from your Development plugins');
  log.info('4. In the plugin, connect to WebSocket server (port 3055)');
  log.info('5. Test these commands in Claude:');
  log.info('   - "Connect to Figma using the default channel"');
  log.info('   - "Get information about the current document"');
  log.info('   - "Get information about the current selection"');
  
  log.title('TESTS COMPLETED');
  log.info('The test script has completed all automated checks.');
  log.info('Please continue manual tests according to the instructions above.');
  
  // Ask if you want to keep the WebSocket server running
  if (wsServer) {
    const keepServerRunning = await askQuestion('Do you want to keep the WebSocket server running? (y/n)');
    if (keepServerRunning.toLowerCase() !== 'y') {
      log.info('Stopping WebSocket server...');
      wsServer.kill();
      log.success('WebSocket server stopped');
    } else {
      log.info('WebSocket server will continue running in the background.');
      log.info('To stop it, press Ctrl+C in the terminal or use task manager.');
      // Disconnect process from terminal so it continues running
      wsServer.unref();
    }
  }
}

// Run tests
runIntegrationTests().catch(err => {
  log.error(`Error during tests: ${err.message}`);
  process.exit(1);
});
