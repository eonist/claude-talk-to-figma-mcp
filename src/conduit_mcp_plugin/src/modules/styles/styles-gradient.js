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
    const { name, gradientType, stops } = gradient || {};
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
    paintStyle.paints = [{
      type: typeMap[gradientType],
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
      gradientStops: stops.map(s => ({
        position: s.position,
        color: { r: s.color[0], g: s.color[1], b: s.color[2], a: s.color[3] }
      }))
    }];
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
