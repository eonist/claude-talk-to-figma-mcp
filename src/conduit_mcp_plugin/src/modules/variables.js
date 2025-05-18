/**
 * Figma Variables (Design Tokens) operations for plugin command handlers.
 * Implements create, update, delete, query, apply, and mode switching.
 */

async function createVariable({ variables }) {
  // Support both single and batch
  const variableList = Array.isArray(variables) ? variables : [variables];
  const created = [];
  for (const v of variableList) {
    // Find or create collection
    let collection = figma.variables.getLocalVariableCollections().find(c => c.name === v.collection);
    if (!collection && v.collection) {
      collection = figma.variables.createVariableCollection(v.collection);
    }
    if (!collection) {
      throw new Error("Collection must be specified or exist");
    }
    // Create variable
    const variable = figma.variables.createVariable(v.name, collection, v.type);
    // Set value for default mode
    const modeId = collection.modes[0].modeId;
    variable.setValueForMode(modeId, v.value);
    created.push({ id: variable.id, name: variable.name });
  }
  return created;
}

async function updateVariable({ variables }) {
  const variableList = Array.isArray(variables) ? variables : [variables];
  const updated = [];
  for (const v of variableList) {
    const variable = figma.variables.getVariableById(v.id);
    if (!variable) continue;
    // Update name
    if (v.name) variable.name = v.name;
    // Update value for all modes (or specific mode if provided)
    if (v.value !== undefined) {
      if (v.mode) {
        const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
        const modeObj = collection.modes.find(m => m.name === v.mode || m.modeId === v.mode);
        if (modeObj) {
          variable.setValueForMode(modeObj.modeId, v.value);
        }
      } else {
        for (const modeId of Object.keys(variable.valuesByMode)) {
          variable.setValueForMode(modeId, v.value);
        }
      }
    }
    updated.push({ id: variable.id, name: variable.name });
  }
  return { updated };
}

async function deleteVariable({ ids }) {
  const idList = Array.isArray(ids) ? ids : [ids];
  const deleted = [];
  for (const id of idList) {
    const variable = figma.variables.getVariableById(id);
    if (variable) {
      variable.remove();
      deleted.push(id);
    }
  }
  return { deleted };
}

async function getVariables({ type, collection, mode, ids }) {
  let vars = figma.variables.getLocalVariables();
  if (type) vars = vars.filter(v => v.resolvedType === type);
  if (collection) vars = vars.filter(v => v.variableCollectionId === collection);
  if (ids) vars = vars.filter(v => ids.includes(v.id));
  if (mode) {
    // Filter variables that have a value for the given mode
    vars = vars.filter(v => {
      const col = figma.variables.getVariableCollectionById(v.variableCollectionId);
      const modeObj = col && col.modes.find(m => m.name === mode || m.modeId === mode);
      return modeObj && v.valuesByMode[modeObj.modeId] !== undefined;
    });
  }
  return vars.map(v => ({
    id: v.id,
    name: v.name,
    type: v.resolvedType,
    collection: v.variableCollectionId,
    valuesByMode: v.valuesByMode
  }));
}

async function applyVariableToNode({ nodeId, variableId, property }) {
  const node = figma.getNodeById(nodeId);
  if (!node || !node.boundVariables) throw new Error("Node does not support variable binding");
  node.boundVariables[property] = { type: "VARIABLE", id: variableId };
  return { success: true };
}

async function switchVariableMode({ collection, mode }) {
  const collections = figma.variables.getLocalVariableCollections();
  const col = collections.find(c => c.name === collection || c.id === collection);
  if (!col) throw new Error("Collection not found");
  const modeObj = col.modes.find(m => m.name === mode || m.modeId === mode);
  if (!modeObj) throw new Error("Mode not found");
  figma.variables.setActiveMode(col.id, modeObj.modeId);
  return { success: true };
}

const variableOperations = {
  createVariable,
  updateVariable,
  deleteVariable,
  getVariables,
  applyVariableToNode,
  switchVariableMode
};
