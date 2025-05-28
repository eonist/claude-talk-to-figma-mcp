/**
 * Generates a random RGBA color object with full opacity.
 * @returns {{r: number, g: number, b: number, a: number}} Random color with values between 0-1
 * @example
 * const color = randomColor();
 * // Returns: { r: 0.234, g: 0.789, b: 0.456, a: 1 }
 */
export function randomColor() {
  return {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    a: 1
  };
}

/**
 * Generates a random font size between 8 and 40 pixels.
 * @returns {number} Font size in pixels (8-40px range)
 * @example
 * const size = randomFontSize();
 * // Returns: 24 (random number between 8-40)
 */
export function randomFontSize() {
  return Math.floor(Math.random() * 32) + 8; // 8 to 40 px
}

/**
 * Selects a random font weight from predefined CSS font-weight values.
 * @returns {number} CSS font-weight value (100, 200, 300, 400, 500, 600, 700, 800, or 900)
 * @example
 * const weight = randomFontWeight();
 * // Returns: 600 (randomly selected from available weights)
 */
export function randomFontWeight() {
  const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  return weights[Math.floor(Math.random() * weights.length)];
}
