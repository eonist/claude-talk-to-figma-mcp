/**
 * Font loading operation for Figma.
 * Exports: loadFontAsyncWrapper
 */

/**
 * Load a font asynchronously.
 *
 * @async
 * @function
 * @param {Object} params - Parameters for font loading.
 * @param {string} params.family - The font family to load (required).
 * @param {string} [params.style="Regular"] - The font style to load (optional, defaults to "Regular").
 * @returns {Promise<{success: boolean, family: string, style: string, message: string}>} Result of the font loading operation.
 * @throws {Error} If the font family is missing or loading fails.
 */
export async function loadFontAsyncWrapper(params) {
  const { family, style = "Regular" } = params || {};
  if (!family) throw new Error("Missing font family");
  try {
    await figma.loadFontAsync({ family, style });
    return {
      success: true,
      family: family,
      style: style,
      message: `Successfully loaded ${family} ${style}`
    };
  } catch (error) {
    throw new Error(`Error loading font: ${error.message}`);
  }
}
