import { setStroke } from "./shapes-helpers.js";

/**
 * Creates a line in the Figma document.
 *
 * @async
 * @function createLine
 * @param {{ x1?: number, y1?: number, x2?: number, y2?: number, strokeColor?: object, strokeWeight?: number, name?: string, parentId?: string }} params
 * @returns {Promise<{ id: string }>} Created line node ID
 * @example
 * const line = await createLine({ x1:0, y1:0, x2:100, y2:0 });
 * console.log(line.id);
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
