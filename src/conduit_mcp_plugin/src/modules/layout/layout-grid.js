/**
 * Grid command handlers for Figma plugin (Conduit MCP).
 * Supports: createGrid, updateGrid, removeGrid
 */

function createLayoutGrid(gridType, options) {
  switch (gridType) {
    case "GRID":
      return {
        pattern: "GRID",
        sectionSize: options.sectionSize || 10,
        visible: options.visible !== undefined ? options.visible : true,
        color: options.color || { r: 0.1, g: 0.1, b: 0.1, a: 0.1 }
      };
    case "COLUMNS":
      return {
        pattern: "COLUMNS",
        alignment: options.alignment || "STRETCH",
        gutterSize: options.gutterSize || 20,
        count: options.count || 12,
        sectionSize: options.sectionSize || 60,
        offset: options.offset || 0,
        visible: options.visible !== undefined ? options.visible : true,
        color: options.color || { r: 1, g: 0, b: 0, a: 0.1 }
      };
    case "ROWS":
      return {
        pattern: "ROWS",
        alignment: options.alignment || "STRETCH",
        gutterSize: options.gutterSize || 20,
        count: options.count || 5,
        sectionSize: options.sectionSize || 60,
        offset: options.offset || 0,
        visible: options.visible !== undefined ? options.visible : true,
        color: options.color || { r: 0, g: 0, b: 1, a: 0.1 }
      };
    default:
      throw new Error(`Unsupported grid type: ${gridType}`);
  }
}

export async function createGrid({ frameId, gridType, gridOptions }) {
  const frame = figma.getNodeById(frameId);
  if (!frame || frame.type !== "FRAME") {
    return { status: "error", message: "Invalid frame ID or node is not a frame" };
  }
  var layoutGrid = createLayoutGrid(gridType, gridOptions || {});
  // ES5-compatible: use slice and push instead of array spread
  var grids = frame.layoutGrids && frame.layoutGrids.length ? frame.layoutGrids.slice() : [];
  grids.push(layoutGrid);
  frame.layoutGrids = grids;
  return { status: "success", message: "Grid created successfully", gridId: frame.id };
}

export async function updateGrid({ frameId, gridIndex, gridOptions }) {
  const frame = figma.getNodeById(frameId);
  if (!frame || frame.type !== "FRAME") {
    return { status: "error", message: "Invalid frame ID or node is not a frame" };
  }
  if (!Array.isArray(frame.layoutGrids) || gridIndex < 0 || gridIndex >= frame.layoutGrids.length) {
    return { status: "error", message: "Invalid grid index" };
  }
  // ES5-compatible: use Object.assign instead of object spread
  var updatedGrid = Object.assign({}, frame.layoutGrids[gridIndex], gridOptions);
  frame.layoutGrids = frame.layoutGrids.map(function(g, i) { return i === gridIndex ? updatedGrid : g; });
  return { status: "success", message: "Grid updated successfully", gridId: frame.id };
}

export async function removeGrid({ frameId, gridIndex }) {
  const frame = figma.getNodeById(frameId);
  if (!frame || frame.type !== "FRAME") {
    return { status: "error", message: "Invalid frame ID or node is not a frame" };
  }
  if (typeof gridIndex === "number") {
    if (!Array.isArray(frame.layoutGrids) || gridIndex < 0 || gridIndex >= frame.layoutGrids.length) {
      return { status: "error", message: "Invalid grid index" };
    }
    frame.layoutGrids = frame.layoutGrids.filter((_, i) => i !== gridIndex);
    return { status: "success", message: "Grid removed", gridId: frame.id };
  } else {
    frame.layoutGrids = [];
    return { status: "success", message: "All grids removed", gridId: frame.id };
  }
}

// For CommonJS compatibility (plugin build system)
if (typeof module !== "undefined") {
  module.exports = { createGrid, updateGrid, removeGrid };
}
