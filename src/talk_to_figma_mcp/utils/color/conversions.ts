/**
 * Color conversion utilities.
 */

/**
 * Converts RGBA color values to hexadecimal string format.
 * 
 * @param {Object} color - RGBA color object
 * @param {number} color.r - Red channel (0-1)
 * @param {number} color.g - Green channel (0-1)
 * @param {number} color.b - Blue channel (0-1) 
 * @param {number} color.a - Alpha channel (0-1)
 * @returns {string} Hex color string (e.g. "#ff0000" or "#ff0000ff")
 * 
 * @example
 * rgbaToHex({r: 1, g: 0, b: 0, a: 1}) // Returns "#ff0000"
 * rgbaToHex({r: 1, g: 0, b: 0, a: 0.5}) // Returns "#ff000080"
 */
export function rgbaToHex(color: any): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a === 255 ? '' : a.toString(16).padStart(2, '0')}`;
}
