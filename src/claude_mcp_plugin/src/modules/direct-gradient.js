/**
 * Utility module for directly applying gradients to nodes without using styles.
 * This provides a workaround for cases where style application fails.
 * 
 * @module modules/direct-gradient
 */

/**
 * Directly applies a gradient to a node without using styles
 * @async
 * @function applyDirectGradient
 * 
 * @param {object} params - Parameters for gradient application
 * @param {string} params.nodeId - The ID of the node to apply gradient to
 * @param {string} params.gradientType - LINEAR, RADIAL, ANGULAR, or DIAMOND
 * @param {Array} params.stops - Array of {position, color} objects
 * @param {string} params.applyTo - FILL, STROKE, or BOTH
 * @returns {object} Operation result with node info
 */
export async function applyDirectGradient(params) {
  const { nodeId, gradientType = "LINEAR", stops, applyTo = "FILL" } = params || {};
  
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  
  if (!stops || !Array.isArray(stops) || stops.length < 2) {
    throw new Error("Gradient must have at least two stops");
  }
  
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }
  
  // Map gradient type to Figma internal type
  const typeMap = {
    LINEAR: "GRADIENT_LINEAR",
    RADIAL: "GRADIENT_RADIAL",
    ANGULAR: "GRADIENT_ANGULAR", 
    DIAMOND: "GRADIENT_DIAMOND"
  };
  
  const figmaType = typeMap[gradientType] || "GRADIENT_LINEAR";
  
  // Create the gradient paint
  const gradientPaint = {
    type: figmaType,
    gradientTransform: [[1, 0, 0], [0, 1, 0]], // Default transform
    gradientStops: stops.map(stop => ({
      position: stop.position,
      color: Array.isArray(stop.color) 
        ? { r: stop.color[0], g: stop.color[1], b: stop.color[2], a: stop.color[3] || 1 }
        : stop.color
    }))
  };
  
  // Apply the gradient
  if (applyTo === "FILL" || applyTo === "BOTH") {
    if (!("fills" in node)) {
      throw new Error("Node does not support fills");
    }
    node.fills = [gradientPaint];
  }
  
  if (applyTo === "STROKE" || applyTo === "BOTH") {
    if (!("strokes" in node)) {
      throw new Error("Node does not support strokes");
    }
    node.strokes = [gradientPaint];
  }
  
  return {
    id: node.id,
    name: node.name,
    success: true
  };
}

// Export all direct gradient operations
export const directGradientOperations = {
  applyDirectGradient
};
