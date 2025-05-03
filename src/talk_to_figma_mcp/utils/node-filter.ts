import { rgbaToHex } from './color.js';

/**
 * Filters and processes Figma node data for client consumption.
 * 
 * @param {FigmaNode} node - Raw Figma node to filter
 * @returns {FilteredNode | null} Filtered node data or null if node should be excluded
 * 
 * @typedef {Object} FigmaNode
 * @property {string} id - Node ID
 * @property {string} name - Node name
 * @property {string} type - Node type (FRAME, COMPONENT, GROUP etc)
 * @property {Array<FigmaNode>} [children] - Child nodes
 * @property {Array<Object>} [fills] - Fill styles
 * @property {Array<Object>} [strokes] - Stroke styles
 * @property {Object} [style] - Text styling properties
 * 
 * @typedef {Object} FilteredNode
 * @property {string} id - Node ID
 * @property {string} name - Node name 
 * @property {string} type - Node type
 * @property {Array<FilteredNode>} [children] - Filtered child nodes
 * @property {Array<Object>} [fills] - Processed fill styles with hex colors
 * @property {Array<Object>} [strokes] - Processed stroke styles
 * @property {Object} [style] - Cleaned text style properties
 */
export function filterFigmaNode(node: any) {
  // Skip VECTOR type nodes
  if (node.type === "VECTOR") {
    return null;
  }

  const filtered: any = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  if (node.fills && node.fills.length > 0) {
    filtered.fills = node.fills.map((fill: any) => {
      const processedFill = { ...fill };

      // Remove boundVariables and imageRef
      delete processedFill.boundVariables;
      delete processedFill.imageRef;

      // Process gradientStops if present
      if (processedFill.gradientStops) {
        processedFill.gradientStops = processedFill.gradientStops.map((stop: any) => {
          const processedStop = { ...stop };
          // Convert color to hex if present
          if (processedStop.color) {
            processedStop.color = rgbaToHex(processedStop.color);
          }
          // Remove boundVariables
          delete processedStop.boundVariables;
          return processedStop;
        });
      }

      // Convert solid fill colors to hex
      if (processedFill.color) {
        processedFill.color = rgbaToHex(processedFill.color);
      }

      return processedFill;
    });
  }

  if (node.strokes && node.strokes.length > 0) {
    filtered.strokes = node.strokes.map((stroke: any) => {
      const processedStroke = { ...stroke };
      // Remove boundVariables
      delete processedStroke.boundVariables;
      // Convert color to hex if present
      if (processedStroke.color) {
        processedStroke.color = rgbaToHex(processedStroke.color);
      }
      return processedStroke;
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
      lineHeightPx: node.style.lineHeightPx
    };
  }

  if (node.children) {
    filtered.children = node.children
      .map((child: any) => filterFigmaNode(child))
      .filter((child: any) => child !== null); // Remove null children (VECTOR nodes)
  }

  return filtered;
}
