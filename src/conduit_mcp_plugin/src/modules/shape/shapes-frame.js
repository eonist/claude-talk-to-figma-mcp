import { setFill, setStroke } from "./shapes-helpers.js";
 
/**
 * Creates one or more frame nodes in the Figma document.
 *
 * @async
 * @function
 * @param {Object} params - Configuration parameters.
 * @param {Object} [params.frame] - Single frame config (see below).
 * @param {Array} [params.frames] - Array of frame configs (see below).
 * @param {number} [params.frame.x=0] - X position.
 * @param {number} [params.frame.y=0] - Y position.
 * @param {number} [params.frame.width=100] - Width of the frame.
 * @param {number} [params.frame.height=100] - Height of the frame.
 * @param {string} [params.frame.name="Frame"] - Name of the frame node.
 * @param {string} [params.frame.parentId] - Optional parent node ID to append the frame.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.frame.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.frame.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.frame.strokeWeight] - Optional stroke weight.
 * @param {number|Array} [params.frame.cornerRadius] - Corner radius (single value for all corners or array of 4 values [topLeft, topRight, bottomRight, bottomLeft]).
 * @returns {Promise }>} Object with array of created frame node IDs.
 * @throws {Error} If neither 'frame' nor 'frames' is provided, or if parent is not found.
 * @example
 * const frameResult = await createFrame({ frame: { x: 10, y: 10, width: 200, height: 150, cornerRadius: 8 } });
 * const batchResult = await createFrame({ frames: [{ width: 100, cornerRadius: [8, 8, 0, 0] }, { width: 120, cornerRadius: 12 }] });
 */
export async function createFrame(params) {
  console.log("createFrame", params);
  let framesArr;
  if (params.frames) {
    framesArr = params.frames;
  } else if (params.frame) {
    framesArr = [params.frame];
  } else {
    throw new Error("You must provide either 'frame' or 'frames' as input.");
  }
  const ids = [];
  for (const cfg of framesArr) {
    const {
      x = 0, y = 0, width = undefined, height = undefined,
      name = "Frame", parentId, fillColor, strokeColor, strokeWeight,
      cornerRadius
    } = cfg || {};

    const frame = figma.createFrame();
    frame.x = x; frame.y = y;
    if (typeof width === "number" && typeof height === "number") {
      frame.resize(width, height);
    }
    console.log("💥 frame.name", frame.name);
    console.log("💥 width", width);
    console.log("💥 height", height);
    console.log("💥 frame.width", frame.width);
    console.log("💥 frame.height", frame.height);
    frame.name = name;

    if (fillColor) setFill(frame, fillColor);
    if (strokeColor) setStroke(frame, strokeColor, strokeWeight);
    
    // Apply corner radius
    if (cornerRadius !== undefined) {
      if (Array.isArray(cornerRadius)) {
        // Individual corner radii [topLeft, topRight, bottomRight, bottomLeft]
        frame.topLeftRadius = cornerRadius[0] || 0;
        frame.topRightRadius = cornerRadius[1] || 0;
        frame.bottomRightRadius = cornerRadius[2] || 0;
        frame.bottomLeftRadius = cornerRadius[3] || 0;
      } else {
        // Uniform corner radius for all corners
        frame.cornerRadius = cornerRadius;
      }
    }

    const parent = parentId
      ? await figma.getNodeByIdAsync(parentId)
      : figma.currentPage;
    if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
    parent.appendChild(frame);

    ids.push(frame.id);
  }
  return { ids };
}
