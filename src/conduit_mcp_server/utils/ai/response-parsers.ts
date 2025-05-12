/**
 * Parse an AI response string into JSON or fallback to raw text.
 *
 * @param {string} response - The raw response string from the AI.
 * @returns {any} The parsed object if valid JSON, otherwise the original string.
 * @example
 * // Returns an object
 * parseResponse('{"foo": 42}'); // { foo: 42 }
 * // Returns the original string if not valid JSON
 * parseResponse('not json'); // "not json"
 */
export function parseResponse(response: string): any {
  try {
    return JSON.parse(response);
  } catch {
    return response;
  }
}
