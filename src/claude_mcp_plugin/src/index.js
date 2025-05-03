// Main entry point for the Figma plugin

// Import modules
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

// Show UI
figma.showUI(__html__, { width: 350, height: 450 });

// Initialize commands
initializeCommands();

// Plugin commands from UI
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
      // Execute commands received from UI (which gets them from WebSocket)
      try {
        const result = await handleCommand(msg.command, msg.params);
        // Send result back to UI
        figma.ui.postMessage({
          type: "command-result",
          id: msg.id,
          result,
        });
      } catch (error) {
        figma.ui.postMessage({
          type: "command-error",
          id: msg.id,
          error: error.message || "Error executing command",
        });
      }
      break;
  }
};

// Listen for plugin commands from menu
figma.on("run", ({ command }) => {
  figma.ui.postMessage({ type: "auto-connect" });
});

// Initialize the plugin on load
initializePlugin();
