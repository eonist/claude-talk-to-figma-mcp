/**
 * Unified component variant command handlers for Figma plugin (Conduit MCP).
 * setVariant: create, add, rename, delete, organize, batch_create (single or batch)
 * getVariant: get info for one, many, or all component sets
 */

// Helper: find component set by id
function findComponentSet(id) {
  var node = figma.getNodeById(id);
  return node && node.type === "COMPONENT_SET" ? node : null;
}

// Helper: find variant by id in a component set
function findVariant(componentSet, variantId) {
  for (var i = 0; i < componentSet.children.length; ++i) {
    if (componentSet.children[i].id === variantId) return componentSet.children[i];
  }
  return null;
}

// setVariant: unified handler (single or batch)
export async function setVariant(params) {
  var ops = params.variant ? [params.variant] : (params.variants || []);
  var results = [];
  for (var i = 0; i < ops.length; ++i) {
    var op = ops[i];
    try {
      var set = findComponentSet(op.componentSetId);
      if (!set) {
        results.push({ componentSetId: op.componentSetId, error: "Component set not found" });
        continue;
      }
      // Add (create new variant)
      if (op.action === "add" && op.properties) {
        // Clone first variant as template
        var template = set.children[0];
        var newVariant = template.clone();
        // Optionally update properties (e.g., fills)
        if (op.properties.fills) newVariant.fills = op.properties.fills;
        set.appendChild(newVariant);
        // Set variant properties
        for (var key in op.properties) {
          if (key !== "fills" && op.properties.hasOwnProperty(key)) {
            newVariant.setProperties && newVariant.setProperties({ [key]: op.properties[key] });
          }
        }
        results.push({ action: "added", variantId: newVariant.id, properties: op.properties });
        continue;
      }
      // Batch create variants from template
      if (op.action === "batch_create" && op.templateComponentId && op.propertiesList) {
        var template = figma.getNodeById(op.templateComponentId);
        if (!template || template.type !== "COMPONENT") {
          results.push({ error: "Template component not found" });
          continue;
        }
        for (var j = 0; j < op.propertiesList.length; ++j) {
          var props = op.propertiesList[j];
          var newVariant = template.clone();
          set.appendChild(newVariant);
          for (var key in props) {
            newVariant.setProperties && newVariant.setProperties({ [key]: props[key] });
          }
          results.push({ action: "batch_created", variantId: newVariant.id, properties: props });
        }
        continue;
      }
      // Rename property or value
      if (op.action === "rename" && op.propertyName && op.newPropertyName) {
        // Rename property in componentPropertyDefinitions
        var defs = set.componentPropertyDefinitions;
        if (defs && defs[op.propertyName]) {
          defs[op.newPropertyName] = defs[op.propertyName];
          delete defs[op.propertyName];
          set.componentPropertyDefinitions = defs;
          results.push({ action: "renamed_property", from: op.propertyName, to: op.newPropertyName });
        } else {
          results.push({ error: "Property not found", propertyName: op.propertyName });
        }
        continue;
      }
      // Delete variant
      if (op.action === "delete" && op.variantId) {
        var variant = findVariant(set, op.variantId);
        if (variant) {
          variant.remove();
          results.push({ action: "deleted", variantId: op.variantId });
        } else {
          results.push({ error: "Variant not found", variantId: op.variantId });
        }
        continue;
      }
      // Organize variants (grid layout)
      if (op.action === "organize" && op.organizeBy && op.organizeBy.length > 0) {
        // Simple grid: arrange by first property horizontally, second vertically
        var variants = set.children;
        var xMap = {};
        var yMap = {};
        var xCount = 0, yCount = 0;
        for (var k = 0; k < variants.length; ++k) {
          var v = variants[k];
          var props = v.getProperties ? v.getProperties() : {};
          var xKey = props[op.organizeBy[0]] || "";
          var yKey = op.organizeBy[1] ? (props[op.organizeBy[1]] || "") : "";
          if (!(xKey in xMap)) xMap[xKey] = xCount++;
          if (op.organizeBy[1] && !(yKey in yMap)) yMap[yKey] = yCount++;
        }
        var xSpacing = 200, ySpacing = 200;
        for (var k = 0; k < variants.length; ++k) {
          var v = variants[k];
          var props = v.getProperties ? v.getProperties() : {};
          var xKey = props[op.organizeBy[0]] || "";
          var yKey = op.organizeBy[1] ? (props[op.organizeBy[1]] || "") : "";
          v.x = xMap[xKey] * xSpacing;
          v.y = op.organizeBy[1] ? yMap[yKey] * ySpacing : 0;
        }
        results.push({ action: "organized", by: op.organizeBy });
        continue;
      }
      // Create (combine as variants)
      if (op.action === "create" && op.propertiesList) {
        // Create components for each property set, then combine
        var nodes = [];
        for (var m = 0; m < op.propertiesList.length; ++m) {
          var c = figma.createComponent();
          // Optionally set properties (e.g., fills)
          var props = op.propertiesList[m];
          if (props.fills) c.fills = props.fills;
          nodes.push(c);
        }
        var parent = set.parent || figma.currentPage;
        var newSet = figma.combineAsVariants(nodes, parent);
        results.push({ action: "created_set", componentSetId: newSet.id });
        continue;
      }
      results.push({ action: "noop", componentSetId: op.componentSetId });
    } catch (e) {
      results.push({ componentSetId: op.componentSetId, error: String(e) });
    }
  }
  return results;
}

// getVariant: get info for one, many, or all component sets
export async function getVariant(params) {
  var ids = params.componentSetId ? [params.componentSetId] : (params.componentSetIds || []);
  var results = [];
  if (ids.length > 0) {
    for (var i = 0; i < ids.length; ++i) {
      var set = findComponentSet(ids[i]);
      if (set) {
        var variants = [];
        for (var j = 0; j < set.children.length; ++j) {
          var v = set.children[j];
          variants.push({
            variantId: v.id,
            name: v.name,
            properties: v.getProperties ? v.getProperties() : {}
          });
        }
        results.push({ componentSetId: set.id, variants: variants });
      } else {
        results.push({ componentSetId: ids[i], error: "Component set not found" });
      }
    }
  } else {
    // Return all component sets in the document
    var allSets = [];
    function findAllSets(node) {
      if (node.type === "COMPONENT_SET") allSets.push(node);
      if ("children" in node) {
        for (var i = 0; i < node.children.length; ++i) findAllSets(node.children[i]);
      }
    }
    findAllSets(figma.root);
    for (var i = 0; i < allSets.length; ++i) {
      var set = allSets[i];
      var variants = [];
      for (var j = 0; j < set.children.length; ++j) {
        var v = set.children[j];
        variants.push({
          variantId: v.id,
          name: v.name,
          properties: v.getProperties ? v.getProperties() : {}
        });
      }
      results.push({ componentSetId: set.id, variants: variants });
    }
  }
  return ids.length === 1 ? results[0] : results;
}

// For CommonJS compatibility (plugin build system)
if (typeof module !== "undefined") {
  module.exports = { setVariant, getVariant };
}
