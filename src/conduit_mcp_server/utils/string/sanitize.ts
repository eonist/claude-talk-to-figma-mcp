/**
 * Sanitizes a string by trimming whitespace and normalizing line endings.
 *
 * @param {string} input - The string to sanitize.
 * @returns {string} A trimmed string with normalized line breaks.
 * @example
 * sanitize("  foo\r\nbar  "); // "foo\nbar"
 */
export function sanitize(input: string): string {
  if (typeof input !== 'string') {
    throw new TypeError('sanitize: input must be a string');
  }
  // Normalize Windows/Mac line endings to Unix
  const normalized = input.replace(/\r\n|\r/g, '\n');
  // Trim leading/trailing whitespace
  return normalized.trim();
}
