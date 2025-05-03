// UI Module - Handles UI interactions

import { updateSettings } from './utils.js';
import { handleCommand } from './api.js';

/**
 * Shows the UI with specified dimensions
 */
export function showUI() {
  figma.showUI(__html__, { width: 350, height: 450 });
}

/**
 * Sets up the message handler for UI events
 */
export function setUpUIMessageHandler() {
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
            error: error instanceof Error ? error.message : "Error executing command",
          });
        }
        break;
    }
  };

  // Listen for plugin commands from menu
  figma.on("run", ({ command }) => {
    figma.ui.postMessage({ type: "auto-connect" });
  });
}
