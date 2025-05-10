/**
 * Main entry point for the Claude MCP Figma plugin UI.
 * Initializes and coordinates all UI modules.
 */

// Initialize all UI components when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI elements
  initUIElements();
  
  // Initialize tab navigation
  initTabNavigation();
  
  // Initialize message listener for plugin communication
  initMessageListener();
  
  // Apply light theme explicitly on plugin startup
  applyThemeToUI('light');
  
  // Request Figma's actual theme information
  parent.postMessage({ pluginMessage: { type: 'check-theme' } }, '*');
  
  console.log('Claude MCP Figma plugin UI initialized with light theme');
});

// Add global function to help debugging theme issues
window.checkFigmaTheme = function() {
  console.log('Checking Figma theme...');
  parent.postMessage({ pluginMessage: { type: 'check-theme' } }, '*');
};
