/**
 * Font loading operation for Figma.
 * Exports: loadFontAsyncWrapper
 */

/**
 * Load a font asynchronously.
 * @async
 * @function loadFontAsyncWrapper
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
