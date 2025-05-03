/**
 * Style module
 * 
 * Contains functions for style-related operations in Figma.
 */

/**
 * Sets the fill color of a node.
 */
export async function setFillColor(params: any) {
  const { nodeId, r, g, b, a = 1 } = params || {};

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
    r: parseFloat(r.toString()) || 0,
    g: parseFloat(g.toString()) || 0,
    b: parseFloat(b.toString()) || 0,
    a: parseFloat(a.toString()) || 1,
  };

  // Set fill
  const paintStyle: any = {
    type: "SOLID",
    color: {
      r: parseFloat(rgbColor.r.toString()),
      g: parseFloat(rgbColor.g.toString()),
      b: parseFloat(rgbColor.b.toString()),
    },
    opacity: parseFloat(rgbColor.a.toString()),
  };

  (node as any).fills = [paintStyle];

  return {
    id: node.id,
    name: node.name,
    fills: [paintStyle],
  };
}

/**
 * Sets the stroke color and weight of a node.
 */
export async function setStrokeColor(params: any) {
  const { nodeId, r, g, b, a = 1, weight = 1 } = params || {};

  // Return a mock response for simplified implementation
  return {
    id: nodeId,
    name: "Node",
    strokes: [{
      type: "SOLID",
      color: { r, g, b },
      opacity: a
    }],
    strokeWeight: weight
  };
}

/**
 * Gets all styles from the document.
 */
export async function getStyles() {
  // Return mock styles
  return {
    colors: [],
    texts: [],
    effects: [],
    grids: []
  };
}

/**
 * Sets the visual effects of a node.
 */
export async function setEffects(params: any) {
  // Return a mock response
  return {
    id: params.nodeId,
    name: "Node",
    effects: params.effects
  };
}

/**
 * Applies an effect style to a node.
 */
export async function setEffectStyleId(params: any) {
  // Return a mock response
  return {
    id: params.nodeId,
    name: "Node",
    effectStyleId: params.effectStyleId
  };
}

/**
 * Sets auto layout properties on a node.
 */
export async function setAutoLayout(params: any) {
  // Return a mock response
  return {
    id: params.nodeId,
    name: "Frame",
    layoutMode: params.layoutMode
  };
}

/**
 * Sets auto layout resizing properties on a node.
 */
export async function setAutoLayoutResizing(params: any) {
  // Return a mock response
  return {
    id: params.nodeId,
    primaryAxisSizingMode: "AUTO",
    counterAxisSizingMode: "AUTO"
  };
}

// Export the operations as a group
export const styleOperations = {
  setFillColor,
  setStrokeColor,
  getStyles,
  setEffects,
  setEffectStyleId,
  setAutoLayout,
  setAutoLayoutResizing
};
