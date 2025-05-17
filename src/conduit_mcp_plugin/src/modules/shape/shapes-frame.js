import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates one or more frame nodes in the Figma document.
 *
 * @async
 * @function
 * @param {Object} params - Configuration parameters.
 * @param {Object} [params.frame] - Single frame config (see below).
 * @param {Array<Object>} [params.frames] - Array of frame configs (see below).
 * @param {number} [params.frame.x=0] - X position.
 * @param {number} [params.frame.y=0] - Y position.
 * @param {number} [params.frame.width=100] - Width of the frame.
 * @param {number} [params.frame.height=100] - Height of the frame.
 * @param {string} [params.frame.name="Frame"] - Name of the frame node.
 * @param {string} [params.frame.parentId] - Optional parent node ID to append the frame.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.frame.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.frame.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.frame.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ ids: Array<string> }>} Object with array of created frame node IDs.
 * @throws {Error} If neither 'frame' nor 'frames' is provided, or if parent is not found.
 * @example
 * const frameResult = await createFrame({ frame: { x: 10, y: 10, width: 200, height: 150 } });
 * const batchResult = await createFrame({ frames: [{ width: 100 }, { width: 120 }] });
 */
export async function createFrame(params) {
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
      x = 0, y = 0, width = 100, height = 100,
      name = "Frame", parentId, fillColor, strokeColor, strokeWeight
    } = cfg || {};

    const frame = figma.createFrame();
    frame.x = x; frame.y = y;
    frame.resize(width, height);
    frame.name = name;

    if (fillColor) setFill(frame, fillColor);
    if (strokeColor) setStroke(frame, strokeColor, strokeWeight);

    const parent = parentId
      ? await figma.getNodeByIdAsync(parentId)
      : figma.currentPage;
    if (parentId && !parent) throw new Error(`Parent not found: ${parentId}`);
    parent.appendChild(frame);

    ids.push(frame.id);
  }
  return { ids };
}
