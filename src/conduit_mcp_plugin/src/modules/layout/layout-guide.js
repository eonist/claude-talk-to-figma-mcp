/**
 * Unified guide command handlers for Figma plugin (Conduit MCP).
 * setGuide: add/delete guides (single or batch)
 * getGuide: get all guides on the current page
 */

// setGuide: add/delete guides (single or batch)
export async function setGuide(params) {
  var ops = params.guide ? [params.guide] : (params.guides || []);
  var results = [];
  for (var i = 0; i < ops.length; ++i) {
    var op = ops[i];
    try {
      if (op.delete) {
        // Remove guide at axis/offset
        var guides = figma.currentPage.guides;
        var found = false;
        for (var j = guides.length - 1; j >= 0; --j) {
          if (guides[j].axis === op.axis && guides[j].offset === op.offset) {
            guides.splice(j, 1);
            found = true;
          }
        }
        figma.currentPage.guides = guides;
        results.push({ axis: op.axis, offset: op.offset, action: "deleted", found: found });
      } else {
        // Add guide
        figma.currentPage.guides.push({ axis: op.axis, offset: op.offset });
        results.push({ axis: op.axis, offset: op.offset, action: "created" });
      }
    } catch (e) {
      results.push({ axis: op.axis, offset: op.offset, error: String(e) });
    }
  }
  return results;
}

// getGuide: get all guides on the current page
export async function getGuide(/* params */) {
  // No params needed
  return { guides: figma.currentPage.guides.slice() };
}

// For CommonJS compatibility (plugin build system)
if (typeof module !== "undefined") {
  module.exports = { setGuide, getGuide };
}
