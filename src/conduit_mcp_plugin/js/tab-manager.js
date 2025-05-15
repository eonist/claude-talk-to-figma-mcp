/**
 * Tab Manager for the Conduit MCP Figma plugin.
 * Handles tab switching functionality.
 */

let tabs;
let tabContents;


/**
 * Initializes tab navigation by setting up click handlers and toggling active classes.
 */
function initTabNavigation() {
  // Get all tab elements and content
  tabs = document.querySelectorAll(".tab");
  tabContents = document.querySelectorAll(".tab-content");
  
  // Add click event to tabs
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");
      
      // Show the corresponding content
      const contentId = "content-" + tab.id.split("-")[1];
      document.getElementById(contentId).classList.add("active");
    });
  });
}
