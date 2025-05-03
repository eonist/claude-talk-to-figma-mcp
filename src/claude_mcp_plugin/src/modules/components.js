// Components module
import { customBase64Encode } from './utils.js';

/**
 * Gets all local components from the document.
 */
export async function getLocalComponents() {
  // Return mock data for simplified implementation
  return {
    count: 0,
    components: []
  };
}

/**
 * Gets available remote components from team libraries.
 */
export async function getRemoteComponents() {
  // Return mock data for simplified implementation
  return {
    success: true,
    count: 0,
    components: []
  };
}

/**
 * Creates an instance of a component.
 */
export async function createComponentInstance(params) {
  const x = params && params.x ? params.x : 0;
  const y = params && params.y ? params.y : 0;
  const componentKey = params && params.componentKey ? params.componentKey : "unknown";
  
  // Return mock data for simplified implementation
  return {
    id: "component-instance-id",
    name: "Component Instance",
    x: x,
    y: y,
    width: 100,
    height: 100,
    componentId: componentKey
  };
}

/**
 * Exports a node as an image.
 */
export async function exportNodeAsImage(params) {
  const nodeId = params && params.nodeId ? params.nodeId : "unknown";
  const format = params && params.format ? params.format : "PNG";
  const scale = params && params.scale ? params.scale : 1;
  
  // Return mock data for simplified implementation
  return {
    nodeId: nodeId,
    format: format, 
    scale: scale,
    mimeType: "image/png",
    imageData: "base64encodedmockdata"
  };
}

/**
 * Groups multiple nodes into a single group.
 */
export async function groupNodes(params) {
  const name = params && params.name ? params.name : "Group";
  const nodeIds = params && params.nodeIds ? params.nodeIds : [];
  
  // Return mock data for simplified implementation
  return {
    id: "group-id",
    name: name,
    type: "GROUP",
    children: nodeIds.map(function(id) {
      return {
        id: id,
        name: "Node " + id,
        type: "UNKNOWN"
      };
    })
  };
}

/**
 * Ungroups a group into its constituent nodes.
 */
export async function ungroupNodes(params) {
  // Return mock data for simplified implementation
  return {
    success: true,
    ungroupedCount: 2,
    items: [
      { id: "child-1", name: "Child 1", type: "RECTANGLE" },
      { id: "child-2", name: "Child 2", type: "RECTANGLE" }
    ]
  };
}

/**
 * Inserts a child node into a parent node at a specific index.
 */
export async function insertChild(params) {
  const parentId = params && params.parentId ? params.parentId : "unknown";
  const childId = params && params.childId ? params.childId : "unknown";
  const index = params && params.index !== undefined ? params.index : 0;
  
  // Return mock data for simplified implementation
  return {
    parentId: parentId,
    childId: childId,
    index: index,
    success: true,
    previousParentId: null
  };
}

/**
 * Renames a single layer in the document.
 */
export async function rename_layer(params) {
  const nodeId = params && params.nodeId ? params.nodeId : "unknown";
  const newName = params && params.newName ? params.newName : "Renamed Layer";
  
  // Return mock data for simplified implementation
  return {
    success: true,
    nodeId: nodeId,
    originalName: "Old Name",
    newName: newName
  };
}

/**
 * Renames multiple layers with a pattern.
 */
export async function rename_layers(params) {
  const layer_ids = params && params.layer_ids ? params.layer_ids : [];
  const new_name = params && params.new_name ? params.new_name : "New Layer Name";
  
  // Return mock data for simplified implementation
  return {
    success: true,
    renamed_count: layer_ids.length
  };
}

/**
 * Renames multiple layers with distinct names.
 */
export async function rename_multiple(params) {
  const layer_ids = params && params.layer_ids ? params.layer_ids : [];
  const new_names = params && params.new_names ? params.new_names : [];
  
  // Return mock data for simplified implementation
  return {
    success: true,
    results: function() {
      var results = [];
      for (var i = 0; i < layer_ids.length; i++) {
        results.push({
          nodeId: layer_ids[i],
          status: "renamed",
          result: {
            nodeId: layer_ids[i],
            originalName: "Old Name",
            newName: i < new_names.length ? new_names[i] : "Default Name"
          }
        });
      }
      return results;
    }()
  };
}

/**
 * Uses AI to rename layers.
 */
export async function ai_rename_layers(params) {
  const layer_ids = params && params.layer_ids ? params.layer_ids : [];
  const context_prompt = params && params.context_prompt ? params.context_prompt : "";
  
  // Return mock data for simplified implementation
  return {
    success: true,
    names: function() {
      var names = [];
      for (var i = 0; i < layer_ids.length; i++) {
        names.push("AI Generated Name");
      }
      return names;
    }()
  };
}

// Export the operations as a group
export const componentOperations = {
  getLocalComponents,
  getRemoteComponents,
  createComponentInstance,
  exportNodeAsImage,
  groupNodes,
  ungroupNodes,
  insertChild,
  rename_layer,
  rename_layers,
  rename_multiple,
  ai_rename_layers
};
