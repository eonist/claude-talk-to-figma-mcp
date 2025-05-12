/**
 * Format a string by replacing multiple spaces with a single space
 * and converting to a specified case.
 *
 * @param {string} input - The string to format.
 * @param {Object} [options] - Formatting options.
 * @param {'upper'|'lower'|'title'} [options.case] - The target case.
 * @returns {string} The formatted string.
 * @example
 * // Convert to title case and collapse spaces
 * format('hello   world', { case: 'title' }); // "Hello World"
 * // Convert to lower case and trim
 * format('  foo   BAR ', { case: 'lower' }); // "foo bar"
 * // No case conversion, just collapse spaces
 * format('A   B   C'); // "A B C"
 */
export function format(
  input: string,
  options: { case?: 'upper' | 'lower' | 'title' } = {}
): string {
  if (typeof input !== 'string') {
    throw new TypeError('format: input must be a string');
  }
  // Collapse multiple spaces
  let result = input.replace(/\s+/g, ' ').trim();

  switch (options.case) {
    case 'upper':
      result = result.toUpperCase();
      break;
    case 'lower':
      result = result.toLowerCase();
      break;
    case 'title':
      result = result
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      break;
  }

  return result;
}
