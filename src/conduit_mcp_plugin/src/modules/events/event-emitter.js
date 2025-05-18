/**
 * Plugin-side event emitter for Conduit MCP.
 * Emits selection and document change events to the MCP server.
 */

// Helper: send event to MCP server (via postMessage or direct channel)
function emitMcpEvent(eventType, payload) {
  // If using figma.ui.postMessage for MCP, use this:
  if (typeof figma !== "undefined" && figma.ui && typeof figma.ui.postMessage === "function") {
    figma.ui.postMessage({ type: "mcp_event", eventType: eventType, payload: payload });
  }
  // If using a direct channel, replace with appropriate send logic.
}

// Listen for selection changes
if (typeof figma !== "undefined" && typeof figma.on === "function") {
  figma.on("selectionchange", function () {
    var selection = figma.currentPage.selection.map(function (n) { return n.id; });
    emitMcpEvent("selection_change", {
      selectedNodeIds: selection,
      timestamp: Date.now()
    });
  });

  // Listen for document changes (node add/remove/modify, page change)
  figma.on("documentchange", function (event) {
    // event contains { documentChanges, nodeChanges, ... }
    emitMcpEvent("document_change", {
      changes: event,
      timestamp: Date.now()
    });
  });

  // Listen for page change
  figma.on("currentpagechange", function () {
    emitMcpEvent("page_change", {
      currentPageId: figma.currentPage.id,
      currentPageName: figma.currentPage.name,
      timestamp: Date.now()
    });
  });
}

// For CommonJS compatibility (plugin build system)
if (typeof module !== "undefined") {
  module.exports = {};
}
