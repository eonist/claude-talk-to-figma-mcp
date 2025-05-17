/**
 * Main entry point for the Conduit MCP Figma plugin UI.
 * Initializes and coordinates all UI modules.
 */

/**
 * Detects current Figma theme and sets up observer for theme changes.
 * Applies theme classes to the body element and updates on-the-fly.
 */
function setupThemeDetection() {
  /**
   * Handles theme changes by updating the body class based on Figma's theme.
   * Adds/removes 'theme-light' or 'theme-dark' classes on the body.
   * @returns {void}
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
  
  /**
   * MutationObserver callback to detect changes to the HTML element's class attribute.
   * Triggers theme update if the class attribute changes.
   * @param {MutationRecord[]} mutations - List of mutations observed.
   * @returns {void}
   */
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

/**
 * Initializes all UI components and event listeners when the DOM is loaded.
 * Sets up UI elements, tab navigation, message listener, and theme detection.
 * @listens DOMContentLoaded
 */
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
