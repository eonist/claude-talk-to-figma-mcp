/**
 * Unified gradient style operations for Figma nodes.
 * Exports: createGradientStyle, setGradient
 */

// Create one or more gradient style variables (single or batch)
export async function createGradientStyle(params) {
  const { gradients } = params || {};
  const gradientList = Array.isArray(gradients) ? gradients : [gradients];
  const results = [];
  for (const gradient of gradientList) {
    const { name, gradientType, stops, transformMatrix } = gradient || {};
    if (!name || !gradientType || !Array.isArray(stops)) {
      throw new Error("Missing or invalid parameters for create_gradient_style");
    }
    const paintStyle = figma.createPaintStyle();
    paintStyle.name = name;
    const typeMap = {
      LINEAR: "GRADIENT_LINEAR",
      RADIAL: "GRADIENT_RADIAL",
      ANGULAR: "GRADIENT_ANGULAR",
      DIAMOND: "GRADIENT_DIAMOND"
    };
    
    // Handle transformMatrix input (can be 2x2 or 3x2 format)
    let gradientTransform = [[1, 0, 0], [0, 1, 0]]; // Default identity matrix
    console.log('🔧 Input transformMatrix:', transformMatrix);
    
    if (transformMatrix && Array.isArray(transformMatrix) && transformMatrix.length === 2) {
      // Check if it's already 3x2 format (each row has 3 elements)
      if (transformMatrix[0].length === 3 && transformMatrix[1].length === 3) {
        // Already in correct 3x2 format, use as-is (preserve 0 values!)
        gradientTransform = [
          [
            transformMatrix[0][0] !== undefined ? transformMatrix[0][0] : 1, 
            transformMatrix[0][1] !== undefined ? transformMatrix[0][1] : 0, 
            transformMatrix[0][2] !== undefined ? transformMatrix[0][2] : 0
          ],
          [
            transformMatrix[1][0] !== undefined ? transformMatrix[1][0] : 0, 
            transformMatrix[1][1] !== undefined ? transformMatrix[1][1] : 1, 
            transformMatrix[1][2] !== undefined ? transformMatrix[1][2] : 0
          ]
        ];
        console.log('🔧 Using provided 3x2 gradientTransform:', gradientTransform);
      } else {
        // Convert 2x2 matrix [[a, b], [c, d]] to 3x2 matrix [[a, b, 0], [c, d, 0]]
        gradientTransform = [
          [
            transformMatrix[0][0] !== undefined ? transformMatrix[0][0] : 1, 
            transformMatrix[0][1] !== undefined ? transformMatrix[0][1] : 0, 
            0
          ],
          [
            transformMatrix[1][0] !== undefined ? transformMatrix[1][0] : 0, 
            transformMatrix[1][1] !== undefined ? transformMatrix[1][1] : 1, 
            0
          ]
        ];
        console.log('🔧 Converted 2x2 to 3x2 gradientTransform:', gradientTransform);
      }
    } else {
      console.log('🔧 Using default gradientTransform (identity):', gradientTransform);
    }
    
    paintStyle.paints = [{
      type: typeMap[gradientType],
      gradientTransform: gradientTransform,
      gradientStops: stops.map(s => ({
        position: s.position,
        color: { r: s.color[0], g: s.color[1], b: s.color[2], a: s.color[3] }
      }))
    }];
    
    console.log('🎨 Final paintStyle.paints[0].gradientTransform:', paintStyle.paints[0].gradientTransform);
    results.push({ id: paintStyle.id, name: paintStyle.name });
  }
  return results.length === 1 ? results[0] : results;
}

// Set a gradient on one or more nodes (single or batch, direct or style)
export async function setGradient(params) {
  const { entries } = params || {};
  const entryList = Array.isArray(entries) ? entries : [entries];
  const results = [];
  for (const entry of entryList) {
    const { nodeId, gradientType, stops, gradientStyleId, applyTo } = entry || {};
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      results.push({ nodeId, success: false, error: "Node not found" });
      continue;
    }

    // Direct gradient application
    if (gradientType && stops) {
      const typeMap = {
        LINEAR: "GRADIENT_LINEAR",
        RADIAL: "GRADIENT_RADIAL",
        ANGULAR: "GRADIENT_ANGULAR",
        DIAMOND: "GRADIENT_DIAMOND"
      };
      const figmaType = typeMap[gradientType] || "GRADIENT_LINEAR";
      const gradientPaint = {
        type: figmaType,
        gradientTransform: [[1, 0, 0], [0, 1, 0]],
        gradientStops: stops.map(stop => ({
          position: stop.position,
          color: Array.isArray(stop.color)
            ? { r: stop.color[0], g: stop.color[1], b: stop.color[2], a: stop.color[3] || 1 }
            : stop.color
        }))
      };
      if (applyTo === "FILL" || applyTo === "BOTH" || !applyTo) {
        if (!("fills" in node)) {
          results.push({ nodeId, success: false, error: "Node does not support fills" });
          continue;
        }
        node.fills = [gradientPaint];
      }
      if (applyTo === "STROKE" || applyTo === "BOTH") {
        if (!("strokes" in node)) {
          results.push({ nodeId, success: false, error: "Node does not support strokes" });
          continue;
        }
        node.strokes = [gradientPaint];
      }
      results.push({ nodeId, success: true, type: "direct" });
      continue;
    }

    // Style variable application
    if (gradientStyleId) {
      // Get all local paint styles
      const styles = await figma.getLocalPaintStylesAsync();
      let style = styles.find(s => s.id === gradientStyleId);
      if (!style && gradientStyleId.startsWith("S:")) {
        const key = gradientStyleId.substring(2);
        style = styles.find(s => s.key === key);
      }
      if (!style) {
        style = styles.find(s =>
          s.id.includes(gradientStyleId.replace("S:", "")) ||
          gradientStyleId.includes(s.id)
        );
      }
      if (style) {
        const paints = style.paints;
        if (!paints || !paints.length) {
          results.push({ nodeId, success: false, error: "No paint definitions in style" });
          continue;
        }
        if (applyTo === "FILL" || applyTo === "BOTH" || !applyTo) {
          if (!("fills" in node)) {
            results.push({ nodeId, success: false, error: "Node does not support fills" });
            continue;
          }
          node.fills = [...paints];
        }
        if (applyTo === "STROKE" || applyTo === "BOTH") {
          if (!("strokes" in node)) {
            results.push({ nodeId, success: false, error: "Node does not support strokes" });
            continue;
          }
          node.strokes = [...paints];
        }
        results.push({ nodeId, success: true, type: "style" });
        continue;
      }
      results.push({ nodeId, success: false, error: "Gradient style not found" });
      continue;
    }

    results.push({ nodeId, success: false, error: "Invalid gradient entry: must provide direct args or style variable" });
  }
  return results.length === 1 ? results[0] : results;
}
