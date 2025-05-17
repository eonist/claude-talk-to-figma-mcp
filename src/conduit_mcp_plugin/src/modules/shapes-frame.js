import { setFill, setStroke } from "./shapes-helpers.js";

/**
 * Creates a new frame node in the Figma document.
 * @async
 * @function createFrame
 * @param {object} params - Configuration parameters.
 * @param {number} [params.x=0] - X position.
 * @param {number} [params.y=0] - Y position.
 * @param {number} [params.width=100] - Width of the frame.
 * @param {number} [params.height=100] - Height of the frame.
 * @param {string} [params.name="Frame"] - Name of the frame node.
 * @param {string} [params.parentId] - Optional parent node ID to append the frame.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.fillColor] - Optional RGBA fill color.
 * @param {{ r: number, g: number, b: number, a?: number }} [params.strokeColor] - Optional RGBA stroke color.
 * @param {number} [params.strokeWeight] - Optional stroke weight.
 * @returns {Promise<{ id: string, name: string, width: number, height: number }>}
 * @example
 * const frameResult = await createFrame({ x: 10, y: 10, width: 200, height: 150 });
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
