import { customBase64Encode } from "../utils.js";

/**
 * Sets the fill color of a specified node.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for fill color.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {{ r: number, g: number, b: number, a?: number }} params.color - RGBA fill color (0-1).
 * @returns {Promise<{ id: string, name: string, fills: Array<Object> }>} Updated node info.
 * @throws {Error} If parameters are missing, node cannot be found, or node does not support fills.
 */
export async function setFillColor(params) {
  if (!params) throw new Error("Missing parameters for setFillColor");
  const { nodeId, color } = params;
  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (!color || typeof color !== 'object') throw new Error("Fill color must be provided as an RGB object { r: number, g: number, b: number, a?: number } where values range from 0-1. Received: " + JSON.stringify(color));
  if (color.r === undefined || color.g === undefined || color.b === undefined) throw new Error("Fill color object is missing required RGB components. Expected format: { r: number, g: number, b: number, a?: number } where values range from 0-1. Received: " + JSON.stringify(color));
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (!("fills" in node)) throw new Error(`Node does not support fills: ${nodeId}`);
  const { r, g, b, a } = color;
  const rgbColor = {
    r: parseFloat(r) || 0,
    g: parseFloat(g) || 0,
    b: parseFloat(b) || 0,
    a: parseFloat(a) || 1,
  };
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
 * @async
 * @function
 * @param {Object} params - Parameters for stroke color.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {{ r: number, g: number, b: number, a?: number }} params.color - RGBA stroke color (0-1).
 * @param {number} [params.weight=1] - Stroke weight.
 * @returns {Promise<{ id: string, name: string, strokes: Array<Object>, strokeWeight?: number }>} Updated node info.
 * @throws {Error} If parameters are missing, node cannot be found, or node does not support strokes.
 */
export async function setStrokeColor(params) {
  if (!params) throw new Error("Missing parameters for setStrokeColor");
  const { nodeId, color, weight = 1 } = params;
  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (!color || typeof color !== 'object') throw new Error("Stroke color must be provided as an RGB object { r: number, g: number, b: number, a?: number } where values range from 0-1. Received: " + JSON.stringify(color));
  if (color.r === undefined || color.g === undefined || color.b === undefined) throw new Error("Stroke color object is missing required RGB components. Expected format: { r: number, g: number, b: number, a?: number } where values range from 0-1. Received: " + JSON.stringify(color));
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
  if (!("strokes" in node)) throw new Error(`Node does not support strokes: ${nodeId}`);
  const { r, g, b, a } = color;
  const rgbColor = {
    r: r !== undefined ? r : 0,
    g: g !== undefined ? g : 0,
    b: b !== undefined ? b : 0,
    a: a !== undefined ? a : 1,
  };
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
 * @async
 * @function
 * @param {Object} params - Parameters for style.
 * @param {string} params.nodeId - The ID of the node to update.
 * @param {Object} [params.fillProps] - Fill properties ({ color: [r,g,b,a], ... }).
 * @param {Object} [params.strokeProps] - Stroke properties ({ color: [r,g,b,a], weight }).
 * @returns {Promise<{ id: string, name: string, fills: Array<Object>, strokes: Array<Object> }>} Updated node info.
 * @throws {Error} If parameters are missing, node cannot be found, or color arrays are invalid.
 */
export async function setStyle(params) {
  if (!params) throw new Error("Missing parameters for setStyle");
  const { nodeId, fillProps, strokeProps } = params;
  if (!nodeId) throw new Error("Missing nodeId parameter");
  if (fillProps) {
    if (!fillProps.color || !Array.isArray(fillProps.color)) throw new Error("Fill color must be provided as an array [r, g, b, a] where values range from 0-1. Received: " + JSON.stringify(fillProps.color));
    if (fillProps.color.length < 3) throw new Error("Fill color array must contain at least 3 elements [r, g, b]. Received: " + JSON.stringify(fillProps.color));
    await setFillColor({
      nodeId,
      color: {
        r: fillProps.color[0],
        g: fillProps.color[1],
        b: fillProps.color[2],
        a: fillProps.color[3] !== undefined ? fillProps.color[3] : 1
      }
    });
  }
  if (strokeProps) {
    if (!strokeProps.color || !Array.isArray(strokeProps.color)) throw new Error("Stroke color must be provided as an array [r, g, b, a] where values range from 0-1. Received: " + JSON.stringify(strokeProps.color));
    if (strokeProps.color.length < 3) throw new Error("Stroke color array must contain at least 3 elements [r, g, b]. Received: " + JSON.stringify(strokeProps.color));
    await setStrokeColor({
      nodeId,
      color: {
        r: strokeProps.color[0],
        g: strokeProps.color[1],
        b: strokeProps.color[2],
        a: strokeProps.color[3] !== undefined ? strokeProps.color[3] : 1
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
