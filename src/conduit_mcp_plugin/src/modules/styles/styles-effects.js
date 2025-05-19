/**
 * Effects operations for Figma nodes.
 * Exports: setEffects, setEffectStyleId
 */

/**
 * Sets visual effects on a node.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for effects.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {Array<Object>} params.effects - Array of effect objects (see Figma Effect type).
 * @returns {Promise<{ id: string, name: string, effects: Array<Object> }>} Updated node info.
 * @throws {Error} If parameters are missing, node cannot be found, node does not support effects, or effect type is invalid.
 */
export async function setEffects(params) {
  const { nodeId, effects } = params || {};
  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (!effects || !Array.isArray(effects)) throw new Error("Invalid effects parameter");

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  if (!("effects" in node)) throw new Error(`Node does not support effects: ${nodeId}`);

  const validEffects = effects.map(effect => {
    switch (effect.type) {
      case "DROP_SHADOW":
      case "INNER_SHADOW":
        return {
          type: effect.type,
          color: effect.color || { r: 0, g: 0, b: 0, a: 0.5 },
          offset: effect.offset || { x: 0, y: 0 },
          radius: effect.radius || 5,
          spread: effect.spread || 0,
          visible: effect.visible !== undefined ? effect.visible : true,
          blendMode: effect.blendMode || "NORMAL"
        };
      case "LAYER_BLUR":
      case "BACKGROUND_BLUR":
        return {
          type: effect.type,
          radius: effect.radius || 5,
          visible: effect.visible !== undefined ? effect.visible : true
        };
      default:
        throw new Error(`Unsupported effect type: ${effect.type}`);
    }
  });

  node.effects = validEffects;
  return {
    id: node.id,
    name: node.name,
    effects: node.effects
  };
}

/**
 * Applies an effect style to a node.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for effect style.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {string} params.effectStyleId - The ID of the effect style to apply.
 * @returns {Promise<{ id: string, name: string, effectStyleId: string, appliedEffects: Array<Object> }>} Updated node info.
 * @throws {Error} If parameters are missing, node cannot be found, node does not support effect styles, or style is not found.
 */
export async function setEffectStyleId(params) {
  const { nodeId, effectStyleId } = params || {};
  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (!effectStyleId) throw new Error("Missing effectStyleId parameter");

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  if (!("effectStyleId" in node)) throw new Error(`Node does not support effect styles: ${nodeId}`);

  const effectStyles = await figma.getLocalEffectStylesAsync();
  const style = effectStyles.find(s => s.id === effectStyleId);
  if (!style) throw new Error(`Effect style not found: ${effectStyleId}`);

  node.effectStyleId = effectStyleId;
  return {
    id: node.id,
    name: node.name,
    effectStyleId: node.effectStyleId,
    appliedEffects: node.effects
  };
}

/**
 * Creates a new local effect style variable in Figma.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for the effect style.
 * @param {string} params.name - The name of the effect style.
 * @param {Array<Object>} params.effects - Array of effect objects (see Figma Effect type).
 * @param {string} [params.description] - Optional description for the style.
 * @returns {Promise<{ id: string, name: string, effects: Array<Object>, description?: string }>} The created effect style info.
 * @throws {Error} If parameters are missing or invalid.
 */
export async function createEffectStyleVariable(params) {
  const { name, effects, description } = params || {};
  if (!name || typeof name !== "string") throw new Error("Missing or invalid name parameter");
  if (!effects || !Array.isArray(effects) || effects.length === 0) throw new Error("Missing or invalid effects parameter");

  const style = figma.createEffectStyle();
  style.name = name;
  style.effects = effects;
  if (description && typeof description === "string") {
    style.description = description;
  }
  return {
    id: style.id,
    name: style.name,
    effects: style.effects,
    description: style.description
  };
}
