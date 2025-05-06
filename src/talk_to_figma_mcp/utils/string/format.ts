/**
 * Format a string by replacing multiple spaces with a single space
 * and converting to a specified case.
 *
 * @param input - The string to format
 * @param options.case - The target case: "upper", "lower", or "title"
 * @returns The formatted string
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
