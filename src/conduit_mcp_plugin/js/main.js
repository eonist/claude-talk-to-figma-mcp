/**
 * Main entry point for the Conduit MCP Figma plugin UI.
 * Initializes and coordinates all UI modules.
 */

/**
 * Detects current Figma theme and sets up observer for theme changes
 */
function setupThemeDetection() {
  /**
   * Handles theme changes by updating the body class based on Figma's theme.
   */
  function handleThemeChange() {
    const isDarkTheme = document.documentElement.classList.contains('figma-dark');
    const theme = isDarkTheme ? 'dark' : 'light';
    console.log(`Current Figma theme: ${theme}`);
    
    // Apply our theme class to body
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }
  
  // Detect initial theme
  handleThemeChange();
  
  // Set up observer to detect theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        handleThemeChange();
      }
    });
  });
  
  // Start observing the HTML element for class changes
  observer.observe(document.documentElement, { attributes: true });
}

// Initialize all UI components when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI elements
  initUIElements();
  
  // Initialize tab navigation
  initTabNavigation();
  
  // Initialize message listener for plugin communication
  initMessageListener();
  
  // Setup theme detection using Figma's built-in theme classes
  setupThemeDetection();
  
  console.log('Conduit MCP Figma plugin UI initialized');
});
