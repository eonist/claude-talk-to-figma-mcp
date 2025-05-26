/**
 * Figma Variables (Design Tokens) operations for plugin command handlers.
 * Implements create, update, delete, query, apply, and mode switching.
 */

/**
 * Unified setVariable: create, update, or delete Figma Variables.
 * Accepts { entry } or { entries } (array of VariableEntry).
 * - Create: no id, no delete
 * - Update: id present, no delete
 * - Delete: id present, delete: true
 */
async function setVariable({ entry, entries }) {
  const ops = entries || (entry ? [entry] : []);
  const created = [];
  const updated = [];
  const deleted = [];

  for (const v of ops) {
    if (v.delete && v.id) {
      // Delete variable
      const variable = figma.variables.getVariableById(v.id);
      if (variable) {
        variable.remove();
        deleted.push(v.id);
      }
      continue;
    }
    if (!v.id) {
      // Create variable
      let collection = figma.variables.getLocalVariableCollections().find(c => c.name === v.collection);
      if (!collection && v.collection) {
        collection = figma.variables.createVariableCollection(v.collection);
      }
      if (!collection) {
        throw new Error("Collection must be specified or exist");
      }
      const variable = figma.variables.createVariable(v.name, collection, v.type);
      const modeId = collection.modes[0].modeId;
      variable.setValueForMode(modeId, v.value);
      created.push({ id: variable.id, name: variable.name });
      continue;
    }
    // Update variable
    const variable = figma.variables.getVariableById(v.id);
    if (!variable) continue;
    if (v.name) variable.name = v.name;
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

  return { created, updated, deleted };
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
  const node = await figma.getNodeByIdAsync(nodeId);
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
  setVariable,
  getVariables,
  applyVariableToNode,
  switchVariableMode
};
