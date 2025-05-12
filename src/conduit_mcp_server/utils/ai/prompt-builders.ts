/**
 * Build an AI prompt by injecting variables into a template.
 *
 * @param template - The prompt template containing placeholders like `{{key}}`
 * @param variables - A record of placeholder names to replacement values
 * @returns The compiled prompt string
 *
 * @example
 * buildPrompt("Hello, {{name}}!", { name: "Alice" })
 * // Returns "Hello, Alice!"
 */
export function buildPrompt(
  template: string,
  variables: Record<string, string>
): string {
  if (typeof template !== 'string') {
    throw new TypeError('buildPrompt: template must be a string');
  }
  return Object.keys(variables).reduce((result, key) => {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return result.replace(placeholder, variables[key]);
  }, template);
}
