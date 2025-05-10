/**
 * Main entry point for the Claude MCP Figma plugin.
 * Initializes the UI panel, registers command handlers, and mediates communication
 * between the Figma plugin environment and the Model Context Protocol server.
 *
 * Exposed UI messages:
 * - update-settings(params): Persist plugin settings (e.g., port configuration)
 * - notify(message): Display a Figma notification
 * - close-plugin(): Close the plugin
 * - execute-command(commandName, params): Invoke a registered command on the MCP server
 *
 * @module index
 * @example
 * import './index.js';
 * // The plugin UI is shown automatically and commands are ready to execute
 */

import { documentOperations } from './modules/document.js';
import { shapeOperations } from './modules/shapes.js';
import { textOperations } from './modules/text.js';
import { styleOperations } from './modules/styles.js';
import { componentOperations } from './modules/components.js';
import { layoutOperations } from './modules/layout.js';
import { renameOperations } from './modules/rename.js';
import { initializeCommands, handleCommand } from './modules/commands.js';
import {
  sendProgressUpdate,
  initializePlugin,
  updateSettings,
  sendThemeToUI
} from './modules/utils/plugin.js';

// Track current theme and timeout for theme checking
let currentTheme = figma.ui.getTheme();
let themeCheckTimeoutId = null;

// Function to check theme periodically
function checkTheme() {
  const newTheme = figma.ui.getTheme();
  
  if (newTheme !== currentTheme) {
    // Theme has changed
    console.log(`Theme changed from ${currentTheme} to ${newTheme}`);
    currentTheme = newTheme;
    sendThemeToUI();
  }
  
  // Set up next check
  themeCheckTimeoutId = setTimeout(checkTheme, 1000);
}

// Show the plugin UI with fixed dimensions
figma.showUI(__html__, { width: 350, height: 450 });

// Register all available command handlers
initializeCommands();

// Start theme checking
checkTheme();

/**
 * Handles messages sent from the UI.
 *
 * Supported message types:
 * - update-settings: Persist plugin settings (e.g., port)
 * - notify: Display a Figma notification
 * - close-plugin: Terminate the plugin
 * - execute-command: Invoke a registered command and return its result
 *
 * @param {{ type: string, id?: string, command?: string, params?: any, message?: string }} msg
 * @returns {void}
 * @example
 * figma.ui.postMessage({ pluginMessage: { type: 'notify', message: 'Hello' } });
 */
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'update-settings':
      updateSettings(msg);
      break;
    case 'notify':
      figma.notify(msg.message);
      break;
    case 'close-plugin':
      // Clear the theme check timeout before closing
      if (themeCheckTimeoutId) {
        clearTimeout(themeCheckTimeoutId);
      }
      figma.closePlugin();
      break;
    case 'execute-command':
      try {
        const result = await handleCommand(msg.command, msg.params);
        figma.ui.postMessage({
          type: 'command-result',
          id: msg.id,
          result
        });
      } catch (error) {
        figma.ui.postMessage({
          type: 'command-error',
          id: msg.id,
          error: error.message || 'Error executing command'
        });
      }
      break;
    default:
      console.warn('Unhandled UI message type:', msg.type);
  }
};

/**
 * Invoked when the plugin is run from the Figma menu.
 * Automatically triggers a WebSocket connection to the MCP server.
 *
 * @param {{ command: string }} args - The command that launched the plugin
 * @returns {void}
 * @example
 * // In manifest.json:
 * // { "command": "Auto Connect", "name": "Auto-Connect" }
 * figma.on('run', ({ command }) => { ... });
 */
figma.on('run', ({ command }) => {
  figma.ui.postMessage({ type: 'auto-connect' });
});

// Perform initial plugin setup and notify the UI of current settings
initializePlugin();

// Send initial theme to UI
sendThemeToUI();
