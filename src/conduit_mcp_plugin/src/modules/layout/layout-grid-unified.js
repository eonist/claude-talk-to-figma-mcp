/**
 * Unified grid command handlers for Figma plugin (Conduit MCP).
 * setGrid: create, update, delete (single or batch)
 * getGrid: get all grids for one or more nodes
 */

// Helper: get node and check type (async)
async function getFrameLikeNode(nodeId) {
  var node = await figma.getNodeByIdAsync(nodeId);
  if (!node) return null;
  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") return node;
  return null;
}

// Helper: create grid object from properties
function buildLayoutGrid(properties) {
  var grid = {
    pattern: properties.pattern,
    visible: properties.visible !== undefined ? properties.visible : true,
    color: properties.color || { r: 0.1, g: 0.1, b: 0.1, a: 0.1 }
  };
  if (properties.pattern === "GRID") {
    grid.sectionSize = properties.sectionSize || 10;
  } else if (properties.pattern === "COLUMNS" || properties.pattern === "ROWS") {
    grid.alignment = properties.alignment || "STRETCH";
    grid.gutterSize = properties.gutterSize || 20;
    grid.count = properties.count || 5;
    if (properties.sectionSize !== undefined) grid.sectionSize = properties.sectionSize;
    if (properties.offset !== undefined) grid.offset = properties.offset;
  }
  return grid;
}

// setGrid: create, update, delete (single op)
async function setGridOp(op) {
  var node = await getFrameLikeNode(op.nodeId);
  if (!node) return { error: "Node not found or not a frame/component/instance", nodeId: op.nodeId };
  var grids = node.layoutGrids && node.layoutGrids.length ? node.layoutGrids.slice() : [];
  // Delete
  if (op.delete) {
    if (typeof op.gridIndex === "number") {
      if (op.gridIndex < 0 || op.gridIndex >= grids.length) return { error: "Invalid grid index", nodeId: op.nodeId };
      grids.splice(op.gridIndex, 1);
      node.layoutGrids = grids;
      return { nodeId: op.nodeId, action: "deleted", gridIndex: op.gridIndex };
    } else {
      node.layoutGrids = [];
      return { nodeId: op.nodeId, action: "deleted_all" };
    }
  }
  // Create
  if (op.gridIndex === undefined && op.properties) {
    var grid = buildLayoutGrid(op.properties);
    grids.push(grid);
    node.layoutGrids = grids;
    return { nodeId: op.nodeId, action: "created", gridIndex: grids.length - 1 };
  }
  // Update
  if (typeof op.gridIndex === "number" && op.properties) {
    if (op.gridIndex < 0 || op.gridIndex >= grids.length) return { error: "Invalid grid index", nodeId: op.nodeId };
    var grid = grids[op.gridIndex];
    // Update only provided properties
    for (var key in op.properties) {
      if (op.properties.hasOwnProperty(key)) {
        grid[key] = op.properties[key];
      }
    }
    grids[op.gridIndex] = grid;
    node.layoutGrids = grids;
    return { nodeId: op.nodeId, action: "updated", gridIndex: op.gridIndex };
  }
  return { error: "Invalid setGrid operation", nodeId: op.nodeId };
}

// setGrid: unified handler (single or batch)
export async function setGrid(params) {
  var ops = params.entry ? [params.entry] : (params.entries || []);
  var results = [];
  for (var i = 0; i < ops.length; ++i) {
    try {
      var result = await setGridOp(ops[i]);
      results.push(result);
    } catch (e) {
      results.push({ nodeId: ops[i].nodeId, error: String(e) });
    }
  }
  return results;
}

// getGrid: get all grids for one or more nodes
export async function getGrid(params) {
  var ids = params.nodeId ? [params.nodeId] : (params.nodeIds || []);
  var results = [];
  for (var i = 0; i < ids.length; ++i) {
    var node = await getFrameLikeNode(ids[i]);
    if (node) {
      results.push({ nodeId: ids[i], grids: node.layoutGrids || [] });
    } else {
      results.push({ nodeId: ids[i], error: "Node not found or not a frame/component/instance" });
    }
  }
  return params.nodeId ? results[0] : results;
}

// For CommonJS compatibility (plugin build system)
if (typeof module !== "undefined") {
  module.exports = { setGrid, getGrid };
}
