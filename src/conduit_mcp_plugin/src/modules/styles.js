/**
 * Styles operations module.
 * Provides functions to set fills, strokes, effects, and retrieve local style definitions in Figma via MCP.
 *
 * Exposed functions:
 * - setFillColor(params)
 * - setStrokeColor(params)
 * - setStyle(params)
 * - getStyles()
 * - setEffects(params)
 * - setEffectStyleId(params)
 * - createGradientVariable(params)
 * - applyGradientStyle(params)
 *
 * @module modules/styles
 * @example
 * import { styleOperations } from './modules/styles.js';
 * await styleOperations.setFillColor({ nodeId: '123', color: { r:1, g:0, b:0, a:1 } });
 */
import { customBase64Encode } from './utils.js';
import { setFillColor, setStrokeColor, setStyle } from './styles/styles-color.js';
import { setEffects, setEffectStyleId } from './styles/styles-effects.js';
import { createGradientVariable, applyGradientStyle } from './styles/styles-gradient.js';
import { getStyles } from './styles/styles-get.js';


/**
 * Apply styles to multiple nodes in one call.
 * @async
  return results;
}

/**
 * Retrieves local style definitions from Figma.
 * @async
 * @function getStyles
 *
 * @returns {Promise<object>} Styles categorized by type.
 */
export async function getStyles() {
  const styles = {
    colors: await figma.getLocalPaintStylesAsync(),
    texts: await figma.getLocalTextStylesAsync(),
    effects: await figma.getLocalEffectStylesAsync(),
    grids: await figma.getLocalGridStylesAsync(),
  };

  return {
    colors: styles.colors.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
      paint: style.paints[0],
    })),
    texts: styles.texts.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
      fontSize: style.fontSize,
      fontName: style.fontName,
    })),
    effects: styles.effects.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
    grids: styles.grids.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
  };
}

/**
 * Sets visual effects on a node.
 * @async
 * @function setEffects
 *
 * @param {object} params - Effect parameters.
 * @returns {object} Node id, name, and applied effects.
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
 * @async
 * @function setEffectStyleId
 *
 * @param {object} params - Parameters with nodeId and effectStyleId.
 * @returns {object} Node id, name, and applied effect style.
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
 * Creates a gradient paint style in Figma.
 * @async
 * @function createGradientVariable
 */
export async function createGradientVariable(params) {
  const { name, gradientType, stops } = params || {};
  if (!name || !gradientType || !Array.isArray(stops)) {
    throw new Error("Missing or invalid parameters for create_gradient_variable");
  }
  const paintStyle = figma.createPaintStyle();
  paintStyle.name = name;
  const typeMap = {
    LINEAR: "GRADIENT_LINEAR",
    RADIAL: "GRADIENT_RADIAL",
    ANGULAR: "GRADIENT_ANGULAR",
    DIAMOND: "GRADIENT_DIAMOND"
  };
  paintStyle.paints = [{
    type: typeMap[gradientType],
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: stops.map(s => ({
      position: s.position,
      color: { r: s.color[0], g: s.color[1], b: s.color[2], a: s.color[3] }
    }))
  }];
  return { id: paintStyle.id, name: paintStyle.name };
}

/**
 * Applies a gradient paint style to a node in Figma.
 * @async
 * @function applyGradientStyle
 */
export async function applyGradientStyle(params) {
  const { nodeId, gradientStyleId, applyTo } = params || {};
  if (!nodeId || !gradientStyleId) {
    throw new Error("Missing nodeId or gradientStyleId for apply_gradient_style");
  }
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  // Get all local paint styles
  const styles = await figma.getLocalPaintStylesAsync();
  
  // Try multiple methods to find the style
  let style = null;
  
  // Method 1: Direct ID match
  style = styles.find(s => s.id === gradientStyleId);
  
  // Method 2: If that fails, try matching by key (remove the "S:" prefix if present)
  if (!style && gradientStyleId.startsWith("S:")) {
    const key = gradientStyleId.substring(2);
    style = styles.find(s => s.key === key);
  }
  
  // Method 3: As last resort, try a looser match on the ID
  if (!style) {
    style = styles.find(s => 
      s.id.includes(gradientStyleId.replace("S:", "")) || 
      gradientStyleId.includes(s.id)
    );
  }
  
  // If we found a style, apply it properly
  if (style) {
    // Get the actual paint definitions from the style
    const paints = style.paints;
    if (!paints || !paints.length) {
      throw new Error(`No paint definitions found in style: ${gradientStyleId}`);
    }
    
    // Apply the actual paint definitions directly
    if (applyTo === "FILL" || applyTo === "BOTH") {
      if (!("fills" in node)) throw new Error("Node does not support fills");
      node.fills = [...paints]; // Use spread operator to create a new array
    }
    
    if (applyTo === "STROKE" || applyTo === "BOTH") {
      if (!("strokes" in node)) throw new Error("Node does not support strokes");
      node.strokes = [...paints]; // Use spread operator to create a new array
    }
    
    return { id: node.id, name: node.name };
  }
  
  // Debug information
  console.warn(`Style lookup failed for: ${gradientStyleId}`);
  console.info(`Available style IDs: ${styles.map(s => s.id).join(', ')}`);
  
  // If the style ID starts with S: and we couldn't find it, try creating a default gradient
  // This is a fallback for when a style was just created but not yet available through lookup
  if (gradientStyleId.startsWith("S:")) {
    try {
      // Create a default grayscale gradient as fallback
      const fallbackGradient = {
        type: "GRADIENT_LINEAR",
        gradientTransform: [[1, 0, 0], [0, 1, 0]],
        gradientStops: [
          { position: 0, color: { r: 0.2, g: 0.2, b: 0.22, a: 1 } },
          { position: 1, color: { r: 0.6, g: 0.6, b: 0.62, a: 1 } }
        ]
      };
      
      if (applyTo === "FILL" || applyTo === "BOTH") {
        if (!("fills" in node)) throw new Error("Node does not support fills");
        node.fills = [fallbackGradient];
      }
      
      if (applyTo === "STROKE" || applyTo === "BOTH") {
        if (!("strokes" in node)) throw new Error("Node does not support strokes");
        node.strokes = [fallbackGradient];
      }
      
      console.info(`Applied fallback gradient to ${nodeId} since style ${gradientStyleId} was not found`);
      return { id: node.id, name: node.name, usedFallback: true };
    } catch (fallbackError) {
      console.error(`Failed to apply fallback gradient: ${fallbackError}`);
      throw new Error(`Gradient style not found: ${gradientStyleId} and fallback failed`);
    }
  }
  
  throw new Error(`Gradient style not found: ${gradientStyleId}`);
}

// Export all style operations as a grouped object
export const styleOperations = {
  setStyle,
  setFillColor,
  setStrokeColor,
  getStyles,
  setEffects,
  setEffectStyleId,
  createGradientVariable,
  applyGradientStyle
};
