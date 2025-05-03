/**
 * Main entry point for the Figma plugin that enables communication with Claude AI.
 * This plugin acts as a bridge between Figma and the Model Context Protocol (MCP) server,
 * allowing AI-driven manipulation of Figma documents.
 */

// Import core operation modules for different Figma capabilities
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

// Initialize plugin UI with a fixed size window
figma.showUI(__html__, { width: 350, height: 450 });

// Set up command handlers for all supported operations
initializeCommands();

/**
 * Message handler for UI events. Processes different types of messages:
 * - update-settings: Updates plugin configuration
 * - notify: Shows notification in Figma
 * - close-plugin: Terminates the plugin
 * - execute-command: Processes commands received via WebSocket from the MCP server
 */
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "update-settings":
      updateSettings(msg);
      break;
    case "notify":
      figma.notify(msg.message);
      break;
    case "close-plugin":
      figma.closePlugin();
      break;
    case "execute-command":
      try {
        // Execute the received command and collect results
        const result = await handleCommand(msg.command, msg.params);
        // Send command execution results back to UI
        figma.ui.postMessage({
          type: "command-result",
          id: msg.id,
          result,
        });
      } catch (error) {
        // Handle and report any errors during command execution
        figma.ui.postMessage({
          type: "command-error",
          id: msg.id,
          error: error.message || "Error executing command",
        });
      }
      break;
  }
};

// Handle plugin activation from Figma menu
figma.on("run", ({ command }) => {
  // Trigger automatic WebSocket connection when plugin starts
  figma.ui.postMessage({ type: "auto-connect" });
});

// Perform initial plugin setup and configuration
initializePlugin();
