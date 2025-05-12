/**
 * Main entry point for the Conduit MCP Figma plugin.
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
  updateSettings
} from './modules/utils/plugin.js';

// Show the plugin UI with fixed dimensions and enable theme colors
figma.showUI(__html__, { 
  width: 350, 
  height: 450,
  themeColors: true  // Enable Figma's theme variables
});

// Register all available command handlers
initializeCommands();

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
      figma.closePlugin();
      break;
    // Theme detection is now handled directly by Figma's themeColors
    case 'execute-command':
      try {
        console.log(`Executing command with ID: ${msg.id}`, msg.command, msg.params);
        
        // Store command ID in the params to preserve it
        if (!msg.params) msg.params = {};
        
        // Clone params using Object.assign instead of spread operator
        const paramsWithId = Object.assign({}, msg.params || {}, {
          _originalCommandId: msg.id, // Store original ID
          commandType: msg.command    // Store command type for recovery
        });
        
        const result = await handleCommand(msg.command, paramsWithId);
        
        // Add command type to result for better ID recovery
        let enhancedResult = result;
        if (typeof result === 'object' && result !== null) {
          enhancedResult = Object.assign({}, result, {
            command: msg.command
          });
        }
        
        console.log(`Command execution complete. Sending result with ID: ${msg.id}`);
        
        figma.ui.postMessage({
          type: 'command-result',
          id: msg.id,
          command: msg.command, // Include command type in the response
          result: enhancedResult
        });
      } catch (error) {
        console.error(`Error executing command ${msg.command} with ID ${msg.id}:`, error);
        
        figma.ui.postMessage({
          type: 'command-error',
          id: msg.id,
          command: msg.command,
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

// Theme detection is now handled by Figma's built-in themeColors feature
// No need to manually detect and send theme information
