/**
 * Parse an AI response string into JSON or fallback to raw text.
 *
 * @param response - The raw response string from the AI
 * @returns The parsed object if valid JSON, otherwise the original string
 */
export function parseResponse(response: string): any {
  try {
    return JSON.parse(response);
  } catch {
    return response;
  }
}
