// Styles module
import { customBase64Encode } from './utils.js';

/**
 * Sets the fill color of a node in the Figma document.
 *
 * @param {object} params - Parameters for setting fill color.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {object} params.color - RGBA color object.
 * @param {number} params.color.r - Red component (0–1).
 * @param {number} params.color.g - Green component (0–1).
 * @param {number} params.color.b - Blue component (0–1).
 * @param {number} [params.color.a=1] - Alpha component (0–1).
 *
 * @returns {object} An object containing the node's id, name, and updated fills.
 *
 * @throws Will throw an error if the node is not found or does not support fills.
 */
export async function setFillColor(params) {
  const {
    nodeId,
    color: { r, g, b, a },
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("fills" in node)) {
    throw new Error(`Node does not support fills: ${nodeId}`);
  }

  // Create RGBA color
  const rgbColor = {
    r: parseFloat(r) || 0,
    g: parseFloat(g) || 0,
    b: parseFloat(b) || 0,
    a: parseFloat(a) || 1,
  };

  // Set fill
  const paintStyle = {
    type: "SOLID",
    color: {
      r: parseFloat(rgbColor.r),
      g: parseFloat(rgbColor.g),
      b: parseFloat(rgbColor.b),
    },
    opacity: parseFloat(rgbColor.a),
  };

  node.fills = [paintStyle];

  return {
    id: node.id,
    name: node.name,
    fills: [paintStyle],
  };
}

/**
 * Sets the stroke color and weight of a node in the Figma document.
 *
 * @param {object} params - Parameters for setting stroke.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {object} params.color - RGBA color object.
 * @param {number} params.color.r - Red component (0–1).
 * @param {number} params.color.g - Green component (0–1).
 * @param {number} params.color.b - Blue component (0–1).
 * @param {number} [params.color.a=1] - Alpha component (0–1).
 * @param {number} [params.weight=1] - Stroke weight.
 *
 * @returns {object} An object containing the node's id, name, updated strokes, and strokeWeight.
 *
 * @throws Will throw an error if the node is not found or does not support strokes.
 */
export async function setStrokeColor(params) {
  const {
    nodeId,
    color: { r, g, b, a },
    weight = 1,
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("strokes" in node)) {
    throw new Error(`Node does not support strokes: ${nodeId}`);
  }

  // Create RGBA color
  const rgbColor = {
    r: r !== undefined ? r : 0,
    g: g !== undefined ? g : 0,
    b: b !== undefined ? b : 0,
    a: a !== undefined ? a : 1,
  };

  // Set stroke
  const paintStyle = {
    type: "SOLID",
    color: {
      r: rgbColor.r,
      g: rgbColor.g,
      b: rgbColor.b,
    },
    opacity: rgbColor.a,
  };

  node.strokes = [paintStyle];

  // Set stroke weight if available
  if ("strokeWeight" in node) {
    node.strokeWeight = weight;
  }

  return {
    id: node.id,
    name: node.name,
    strokes: node.strokes,
    strokeWeight: "strokeWeight" in node ? node.strokeWeight : undefined,
  };
}

/**
 * Retrieves the local style definitions from the Figma document.
 *
 * Collects local paint, text, effect, and grid styles and returns them in a simplified, serializable format.
 *
 * @returns {object} An object containing arrays of colors, texts, effects, and grids with their identifiers and key properties.
 *
 * @example
 * const styles = await getStyles();
 * console.log(styles.colors, styles.texts);
 */
export async function getStyles() {
  const styles = {
    colors: await figma.getLocalPaintStylesAsync(),
    texts: await figma.getLocalTextStylesAsync(),
    effects: await figma.getLocalEffectStylesAsync(),
    grids: await figma.getLocalGridStylesAsync(),
  };

  return {
    colors: styles.colors.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
      paint: style.paints[0],
    })),
    texts: styles.texts.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
      fontSize: style.fontSize,
      fontName: style.fontName,
    })),
    effects: styles.effects.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
    grids: styles.grids.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
  };
}

/**
 * Sets visual effects on a node in Figma.
 *
 * @param {object} params - Parameters for setting effects.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {Array} params.effects - Array of effect objects to apply.
 *
 * @returns {object} An object with the node's id, name, and applied effects.
 *
 * @throws Will throw an error if the node is not found, does not support effects, or if effects are invalid.
 */
export async function setEffects(params) {
  const { nodeId, effects } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  if (!effects || !Array.isArray(effects)) {
    throw new Error("Missing or invalid effects parameter. Must be an array.");
  }
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  
  if (!("effects" in node)) {
    throw new Error(`Node does not support effects: ${nodeId}`);
  }
  
  try {
    // Convert incoming effects to valid Figma effects
    const validEffects = effects.map(effect => {
      // Ensure all effects have the required properties
      if (!effect.type) {
        throw new Error("Each effect must have a type property");
      }
      
      // Create a clean effect object based on type
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
    
    // Apply the effects to the node
    node.effects = validEffects;
    
    return {
      id: node.id,
      name: node.name,
      effects: node.effects
    };
  } catch (error) {
    throw new Error(`Error setting effects: ${error.message}`);
  }
}

/**
 * Applies an effect style to a node in Figma.
 *
 * @param {object} params - Parameters for setting effect style.
 * @param {string} params.nodeId - The ID of the node to modify.
 * @param {string} params.effectStyleId - The ID of the effect style to apply.
 *
 * @returns {object} An object with the node's id, name, applied effectStyleId, and effects.
 *
 * @throws Will throw an error if the node is not found, does not support effect styles, or if the style is not found.
 */
export async function setEffectStyleId(params) {
  const { nodeId, effectStyleId } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  if (!effectStyleId) {
    throw new Error("Missing effectStyleId parameter");
  }
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  
  if (!("effectStyleId" in node)) {
    throw new Error(`Node does not support effect styles: ${nodeId}`);
  }
  
  try {
    // Try to find the effect style by ID
    const effectStyles = await figma.getLocalEffectStylesAsync();
    const foundStyle = effectStyles.find(style => style.id === effectStyleId);
    
    if (!foundStyle) {
      throw new Error(`Effect style not found with ID: ${effectStyleId}`);
    }
    
    // Apply the effect style to the node
    node.effectStyleId = effectStyleId;
    
    return {
      id: node.id,
      name: node.name,
      effectStyleId: node.effectStyleId,
      appliedEffects: node.effects
    };
  } catch (error) {
    throw new Error(`Error setting effect style ID: ${error.message}`);
  }
}

// Export the operations as a group
export const styleOperations = {
  setFillColor,
  setStrokeColor,
  getStyles,
  setEffects,
  setEffectStyleId
};
