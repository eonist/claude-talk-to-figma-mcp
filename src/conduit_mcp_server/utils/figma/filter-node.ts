import { rgbaToHex } from '../color/index.js';

/**
 * Filters and processes a Figma node for client consumption.
 *
 * @param {any} node - Raw Figma node to filter.
 * @returns {any|null} Filtered node data or null if the node should be excluded.
 * @example
 * // Returns filtered node object
 * const filtered = filterFigmaNode({ id: "1", name: "Rect", type: "RECTANGLE", fills: [], strokes: [] });
 * // Returns null for VECTOR nodes
 * filterFigmaNode({ type: "VECTOR" }); // null
 */
export function filterFigmaNode(node: any): any | null {
  if (node.type === 'VECTOR') {
    return null;
  }

  const filtered: any = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  if (node.fills?.length) {
    filtered.fills = node.fills.map((fill: any) => {
      const f = { ...fill };
      delete f.boundVariables;
      delete f.imageRef;

      if (f.gradientStops) {
        f.gradientStops = f.gradientStops.map((stop: any) => {
          const s = { ...stop };
          if (s.color) {
            s.color = rgbaToHex(s.color);
          }
          delete s.boundVariables;
          return s;
        });
      }

      if (f.color) {
        f.color = rgbaToHex(f.color);
      }

      return f;
    });
  }

  if (node.strokes?.length) {
    filtered.strokes = node.strokes.map((stroke: any) => {
      const s = { ...stroke };
      delete s.boundVariables;
      if (s.color) {
        s.color = rgbaToHex(s.color);
      }
      return s;
    });
  }

  if (node.cornerRadius !== undefined) {
    filtered.cornerRadius = node.cornerRadius;
  }

  if (node.absoluteBoundingBox) {
    filtered.absoluteBoundingBox = node.absoluteBoundingBox;
  }

  if (node.characters) {
    filtered.characters = node.characters;
  }

  if (node.style) {
    filtered.style = {
      fontFamily: node.style.fontFamily,
      fontStyle: node.style.fontStyle,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      textAlignHorizontal: node.style.textAlignHorizontal,
      letterSpacing: node.style.letterSpacing,
      lineHeightPx: node.style.lineHeightPx,
    };
  }

  if (node.children) {
    filtered.children = node.children
      .map((child: any) => filterFigmaNode(child))
      .filter((c: any) => c !== null);
  }

  return filtered;
}
