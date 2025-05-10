/**
 * Main entry point for the Claude MCP Figma plugin UI.
 * Initializes and coordinates all UI modules.
 */

/**
 * Setup simple method to check theme
 * This avoids complex setInterval functions and just uses a simple
 * recursive setTimeout pattern which is more reliable in some environments
 */
function checkThemeOnce() {
  // Request theme check from the plugin
  parent.postMessage({ pluginMessage: { type: 'check-theme' } }, '*');
  
  // Schedule next check with simple timeout
  setTimeout(checkThemeOnce, 3000); // Check every 3 seconds
}

// Initialize all UI components when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI elements
  initUIElements();
  
  // Initialize tab navigation
  initTabNavigation();
  
  // Initialize message listener for plugin communication
  initMessageListener();
  
  // Start simple theme checking (first check after a delay)
  setTimeout(checkThemeOnce, 1000);
  
  console.log('Claude MCP Figma plugin UI initialized');
});
