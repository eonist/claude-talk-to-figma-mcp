// Bundled Figma plugin code - Main entry point

// Import modules
import { showUI, setUpUIMessageHandler } from './modules/ui.js';
import { state, initializePlugin } from './modules/utils.js';

// Initialize the plugin
(async function() {
  try {
    // Show the UI
    showUI();
    
    // Set up message handler for UI events
    setUpUIMessageHandler();
    
    // Initialize plugin settings
    await initializePlugin();
    
    console.log('Claude MCP Figma Plugin initialized successfully');
  } catch (error) {
    console.error('Error initializing plugin:', error);
  }
})();
