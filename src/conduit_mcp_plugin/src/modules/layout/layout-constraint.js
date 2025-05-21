/**
 * Unified constraint command handlers for Figma plugin (Conduit MCP).
 * setConstraints: set constraints (single or batch, with children support)
 * getConstraints: get constraints (single/batch/children)
 */

// Map user-friendly constraint to Figma ConstraintType
function mapConstraintType(val) {
  var v = String(val).toLowerCase();
  if (v === "left" || v === "top") return "MIN";
  if (v === "right" || v === "bottom") return "MAX";
  if (v === "center") return "CENTER";
  if (v === "scale") return "SCALE";
  if (v === "stretch") return "STRETCH";
  return "MIN";
}

// Set constraints for a single node (and optionally children)
function setNodeConstraints(node, horizontal, vertical, applyToChildren, maintainAspectRatio) {
  var results = [];
  if ("constraints" in node) {
    var h = maintainAspectRatio ? "SCALE" : mapConstraintType(horizontal);
    var v = maintainAspectRatio ? "SCALE" : mapConstraintType(vertical);
    node.constraints = { horizontal: h, vertical: v };
    results.push({ nodeId: node.id, action: "set", horizontal: h, vertical: v });
  } else {
    results.push({ nodeId: node.id, error: "Node does not support constraints" });
  }
  if (applyToChildren && "children" in node) {
    for (var i = 0; i < node.children.length; ++i) {
      var child = node.children[i];
      if ("constraints" in child) {
        var h = maintainAspectRatio ? "SCALE" : mapConstraintType(horizontal);
        var v = maintainAspectRatio ? "SCALE" : mapConstraintType(vertical);
        child.constraints = { horizontal: h, vertical: v };
        results.push({ nodeId: child.id, action: "set", horizontal: h, vertical: v });
      }
    }
  }
  return results;
}

// setConstraints: unified handler (single or batch)
export async function setConstraints(params) {
  var ops = params.constraint ? [params.constraint] : (params.constraints || []);
  var applyToChildren = !!params.applyToChildren;
  var maintainAspectRatio = !!params.maintainAspectRatio;
  var results = [];
  for (var i = 0; i < ops.length; ++i) {
    var op = ops[i];
    var node = figma.getNodeById(op.nodeId);
    if (!node) {
      results.push({
        nodeId: op.nodeId,
        error: "Node not found",
        success: false,
        meta: {
          operation: "set_constraint",
          params: Object.assign({}, op, { applyToChildren: applyToChildren, maintainAspectRatio: maintainAspectRatio })
        }
      });
      continue;
    }
    var res = setNodeConstraints(node, op.horizontal, op.vertical, applyToChildren, maintainAspectRatio);
    // Post-process each result to add success/meta
    for (var j = 0; j < res.length; ++j) {
      var r = res[j];
      if (r && r.error) {
        results.push(Object.assign({}, r, {
          success: false,
          meta: {
            operation: "set_constraint",
            params: Object.assign({}, op, { applyToChildren: applyToChildren, maintainAspectRatio: maintainAspectRatio })
          }
        }));
      } else {
        results.push(Object.assign({}, r, {
          success: true
        }));
      }
    }
  }
  return results;
}

// Map Figma ConstraintType to user-friendly string
function mapConstraintTypeToFriendly(val) {
  if (val === "MIN") return "left/top";
  if (val === "MAX") return "right/bottom";
  if (val === "CENTER") return "center";
  if (val === "SCALE") return "scale";
  if (val === "STRETCH") return "stretch";
  return String(val);
}

// Get constraints for a node (and optionally children)
function getNodeConstraints(node, includeChildren) {
  var result = {
    nodeId: node.id,
    name: node.name,
    type: node.type,
    constraints: null
  };
  if ("constraints" in node) {
    result.constraints = {
      horizontal: mapConstraintTypeToFriendly(node.constraints.horizontal),
      vertical: mapConstraintTypeToFriendly(node.constraints.vertical)
    };
  }
  if (includeChildren && "children" in node) {
    result.children = [];
    for (var i = 0; i < node.children.length; ++i) {
      result.children.push(getNodeConstraints(node.children[i], false));
    }
  }
  return result;
}

// getConstraints: unified handler (single/batch/children)
export async function getConstraints(params) {
  var ids = params.nodeId ? [params.nodeId] : (params.nodeIds || []);
  var includeChildren = !!params.includeChildren;
  var nodes = [];
  if (ids.length > 0) {
    for (var i = 0; i < ids.length; ++i) {
      var node = figma.getNodeById(ids[i]);
      if (node) nodes.push(node);
    }
  } else {
    // Use current selection if no ids provided
    nodes = figma.currentPage.selection;
  }
  if (!nodes.length) return { error: "No nodes found" };
  var results = [];
  for (var i = 0; i < nodes.length; ++i) {
    results.push(getNodeConstraints(nodes[i], includeChildren));
  }
  return results;
}

// For CommonJS compatibility (plugin build system)
if (typeof module !== "undefined") {
  module.exports = { setConstraints, getConstraints };
}
