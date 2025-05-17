import { setStroke } from "./shapes-helpers.js";

/**
 * Creates one or more lines in the Figma document.
 *
 * @async
 * @function
 * @param {Object} params - Configuration parameters.
 * @param {Object} [params.line] - Single line config (see below).
 * @param {Array<Object>} [params.lines] - Array of line configs (see below).
 * @param {number} [params.line.x1=0] - X1 position.
 * @param {number} [params.line.y1=0] - Y1 position.
 * @param {number} [params.line.x2=100] - X2 position.
 * @param {number} [params.line.y2=0] - Y2 position.
 * @param {object} [params.line.strokeColor={r:0,g:0,b:0,a:1}] - RGBA stroke color.
 * @param {number} [params.line.strokeWeight=1] - Stroke weight.
 * @param {string} [params.line.name="Line"] - Name of the line node.
 * @param {string} [params.line.parentId] - Optional parent node ID to append the line.
 * @returns {Promise<{ ids: Array<string> }>} Object with array of created line node IDs.
 * @throws {Error} If neither 'line' nor 'lines' is provided, or if parent is not found.
 * @example
 * const lineRes = await createLine({ line: { x1:0, y1:0, x2:100, y2:0 } });
 * const batchRes = await createLine({ lines: [{ x2:50 }, { x2:60 }] });
 */
export async function createLine(params) {
  let linesArr;
  if (params.lines) {
    linesArr = params.lines;
  } else if (params.line) {
    linesArr = [params.line];
  } else {
    throw new Error("You must provide either 'line' or 'lines' as input.");
  }
  const ids = [];
  for (const cfg of linesArr) {
    const { x1=0,y1=0,x2=100,y2=0,strokeColor={r:0,g:0,b:0,a:1},strokeWeight=1,name="Line",parentId } = cfg||{};
    const line = figma.createVector();
    line.vectorPaths=[{ windingRule:"NONZERO", data:`M0,0 L${x2-x1},${y2-y1}` }];
    line.strokeCap="NONE";
    if(strokeColor) setStroke(line,strokeColor,strokeWeight);
    const parent= parentId?await figma.getNodeByIdAsync(parentId): figma.currentPage;
    parent.appendChild(line);
    ids.push(line.id);
  }
  return { ids };
}
