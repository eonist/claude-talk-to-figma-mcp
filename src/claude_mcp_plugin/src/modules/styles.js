// Styles module
import { customBase64Encode } from './utils.js';

/**
 * Sets the fill color of a specified node.
 *
 * Retrieves the node by its ID, validates that it supports fills, and then applies
 * a solid fill with the provided RGBA color.
 *
 * @param {object} params - Parameters for setting the fill color.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {object} params.color - The RGBA color object.
 * @param {number} params.color.r - Red component (0–1).
 * @param {number} params.color.g - Green component (0–1).
 * @param {number} params.color.b - Blue component (0–1).
 * @param {number} [params.color.a=1] - Alpha component (0–1).
 * @returns {object} An object containing the node's id, name, and updated fills.
 * @throws {Error} If the nodeId is missing, the node is not found, or the node does not support fills.
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

  // Prepare RGBA color values
  const rgbColor = {
    r: parseFloat(r) || 0,
    g: parseFloat(g) || 0,
    b: parseFloat(b) || 0,
    a: parseFloat(a) || 1,
  };

  // Define a SOLID paint style with the specified color and opacity
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
 * Sets the stroke color and weight for a specified node.
 *
 * Retrieves the node by its ID, validates stroke support, and then applies
 * the specified stroke color (RGBA) and weight.
 *
 * @param {object} params - Parameters for setting the stroke.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {object} params.color - The RGBA color object.
 * @param {number} params.color.r - Red component (0–1).
 * @param {number} params.color.g - Green component (0–1).
 * @param {number} params.color.b - Blue component (0–1).
 * @param {number} [params.color.a=1] - Alpha component (0–1).
 * @param {number} [params.weight=1] - Stroke weight.
 * @returns {object} An object containing the node's id, name, updated strokes, and strokeWeight.
 * @throws {Error} If the nodeId is missing, the node is not found, or the node does not support strokes.
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

  // Prepare RGBA color values with defaults
  const rgbColor = {
    r: r !== undefined ? r : 0,
    g: g !== undefined ? g : 0,
    b: b !== undefined ? b : 0,
    a: a !== undefined ? a : 1,
  };

  // Define a SOLID paint style for strokes
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

  // Apply stroke weight if supported
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
 * Sets both fill and stroke properties on a node.
 *
 * @param {object} params - Style parameters.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {object} [params.fillProps] - Fill properties.
 * @param {object} [params.strokeProps] - Stroke properties.
 * @returns {object} An object containing the node id, name, fills, and strokes.
 */
export async function setStyle(params) {
  const { nodeId, fillProps, strokeProps } = params || {};
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  // Apply fill properties if provided
  if (fillProps) {
    await setFillColor({
      nodeId,
      color: {
        r: Array.isArray(fillProps.color) ? fillProps.color[0] : 0,
        g: Array.isArray(fillProps.color) ? fillProps.color[1] : 0,
        b: Array.isArray(fillProps.color) ? fillProps.color[2] : 0,
        a: Array.isArray(fillProps.color) ? fillProps.color[3] : 1
      }
    });
  }
  // Apply stroke properties if provided
  if (strokeProps) {
    await setStrokeColor({
      nodeId,
      color: {
        r: Array.isArray(strokeProps.color) ? strokeProps.color[0] : 0,
        g: Array.isArray(strokeProps.color) ? strokeProps.color[1] : 0,
        b: Array.isArray(strokeProps.color) ? strokeProps.color[2] : 0,
        a: Array.isArray(strokeProps.color) ? strokeProps.color[3] : 1
      },
      weight: strokeProps.weight != null ? strokeProps.weight : 1
    });
  }
  const node = await figma.getNodeByIdAsync(nodeId);
  return {
    id: node.id,
    name: node.name,
    fills: node.fills,
    strokes: node.strokes
  };
}

/**
 * Apply styles to multiple nodes in one call.
 *
 * @param {Array} entries - Array of objects { nodeId, fillProps?, strokeProps? }
 * @returns {Array} Results per node.
 */
export async function setStyles(entries) {
  const results = [];
  for (const entry of entries) {
    const res = await setStyle(entry);
    results.push(res);
  }
  return results;
}

/**
 * Retrieves local style definitions from Figma.
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
  const styles = await figma.getLocalPaintStylesAsync();
  const style = styles.find(s => s.id === gradientStyleId);
  if (!style) {
    throw new Error(`Gradient style not found: ${gradientStyleId}`);
  }
  const paintRef = { type: "PAINT_STYLE", styleId: style.id };
  if (applyTo === "FILL" || applyTo === "BOTH") {
    if (!("fills" in node)) throw new Error("Node does not support fills");
    node.fills = [paintRef];
  }
  if (applyTo === "STROKE" || applyTo === "BOTH") {
    if (!("strokes" in node)) throw new Error("Node does not support strokes");
    node.strokes = [paintRef];
  }
  return { id: node.id, name: node.name };
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
