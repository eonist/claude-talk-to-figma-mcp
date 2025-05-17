/**
 * Gradient style operations for Figma nodes.
 * Exports: createGradientVariable, applyGradientStyle
 */

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
      node.fills = [...paints];
    }
    
    if (applyTo === "STROKE" || applyTo === "BOTH") {
      if (!("strokes" in node)) throw new Error("Node does not support strokes");
      node.strokes = [...paints];
    }
    
    return { id: node.id, name: node.name };
  }
  
  // Debug information
  console.warn(`Style lookup failed for: ${gradientStyleId}`);
  console.info(`Available style IDs: ${styles.map(s => s.id).join(', ')}`);
  
  // If the style ID starts with S: and we couldn't find it, try creating a default gradient
  if (gradientStyleId.startsWith("S:")) {
    try {
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
