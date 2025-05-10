/**
 * Main entry point for the Claude MCP Figma plugin UI.
 * Initializes and coordinates all UI modules.
 */

/**
 * Sets up periodic theme checking to keep UI in sync with Figma's theme
 */
function setupThemeChecking() {
  // Check theme every few seconds
  setInterval(() => {
    parent.postMessage({ pluginMessage: { type: 'check-theme' } }, '*');
  }, 2000); // Check every 2 seconds
  
  console.log('Theme checking initialized');
}

// Initialize all UI components when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI elements
  initUIElements();
  
  // Initialize tab navigation
  initTabNavigation();
  
  // Initialize message listener for plugin communication
  initMessageListener();
  
  // Setup theme checking
  setupThemeChecking();
  
  console.log('Claude MCP Figma plugin UI initialized');
});
