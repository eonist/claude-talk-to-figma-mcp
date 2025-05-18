/**
 * Unified page command handlers for Figma plugin (Conduit MCP).
 * setPage: create, delete, rename, set current (single or batch)
 * getPage: get info for one, many, or all pages
 */

// Helper: find page by id or name
function findPage(identifier) {
  var pages = figma.root.children;
  for (var i = 0; i < pages.length; ++i) {
    if (pages[i].id === identifier || pages[i].name === identifier) return pages[i];
  }
  return null;
}

// setPage: create, delete, rename, set current (single or batch)
export async function setPage(params) {
  var ops = params.page ? [params.page] : (params.pages || []);
  var results = [];
  for (var i = 0; i < ops.length; ++i) {
    var op = ops[i];
    try {
      // Create
      if (!op.pageId && op.name && !op.delete) {
        var newPage = figma.createPage();
        newPage.name = op.name;
        if (op.setCurrent) figma.currentPage = newPage;
        results.push({ action: "created", pageId: newPage.id, name: newPage.name });
        continue;
      }
      // Find page by id or name
      var page = op.pageId ? findPage(op.pageId) : null;
      if (!page && op.pageId) {
        results.push({ pageId: op.pageId, error: "Page not found" });
        continue;
      }
      // Delete
      if (op.delete) {
        if (!page) {
          results.push({ pageId: op.pageId, error: "Page not found" });
          continue;
        }
        if (figma.root.children.length <= 1) {
          results.push({ pageId: page.id, error: "Cannot delete the last page" });
          continue;
        }
        if (page === figma.currentPage) {
          for (var j = 0; j < figma.root.children.length; ++j) {
            if (figma.root.children[j] !== page) {
              figma.currentPage = figma.root.children[j];
              break;
            }
          }
        }
        var name = page.name;
        page.remove();
        results.push({ action: "deleted", pageId: op.pageId, name: name });
        continue;
      }
      // Rename
      if (op.name && page) {
        var oldName = page.name;
        page.name = op.name;
        results.push({ action: "renamed", pageId: page.id, oldName: oldName, newName: op.name });
      }
      // Set current
      if (op.setCurrent && page) {
        figma.currentPage = page;
        results.push({ action: "setCurrent", pageId: page.id, name: page.name });
      }
    } catch (e) {
      results.push({ pageId: op.pageId, error: String(e) });
    }
  }
  return results;
}

// getPage: get info for one, many, or all pages
export async function getPage(params) {
  var ids = params.pageId ? [params.pageId] : (params.pageIds || []);
  var pages = figma.root.children;
  var results = [];
  if (ids.length > 0) {
    for (var i = 0; i < ids.length; ++i) {
      var page = findPage(ids[i]);
      if (page) {
        results.push({ pageId: page.id, name: page.name, isActive: page === figma.currentPage });
      } else {
        results.push({ pageId: ids[i], error: "Page not found" });
      }
    }
  } else {
    // Return all pages
    for (var i = 0; i < pages.length; ++i) {
      results.push({ pageId: pages[i].id, name: pages[i].name, isActive: pages[i] === figma.currentPage });
    }
  }
  return ids.length === 1 ? results[0] : results;
}

// For CommonJS compatibility (plugin build system)
if (typeof module !== "undefined") {
  module.exports = { setPage, getPage };
}
