/**
 * Retrieves local style definitions from Figma.
 *
 * @async
 * @function
 * @returns {Promise<{
 *   colors: Array<{ id: string, name: string, key: string, paint: object }>,
 *   texts: Array<{ id: string, name: string, key: string, fontSize: number, fontName: object }>,
 *   effects: Array<{ id: string, name: string, key: string }>,
 *   grids: Array<{ id: string, name: string, key: string }>
 * }>} Styles categorized by type.
 * @throws {Error} If Figma API calls fail.
 */
export async function getStyles() {
  const styles = {
    colors: await figma.getLocalPaintStylesAsync(),
    texts: await figma.getLocalTextStylesAsync(),
    effects: await figma.getLocalEffectStylesAsync(),
    grids: await figma.getLocalGridStylesAsync(),
  };

  return {
    colors: styles.colors.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
      paint: style.paints[0],
    })),
    texts: styles.texts.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
      fontSize: style.fontSize,
      fontName: style.fontName,
    })),
    effects: styles.effects.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
    grids: styles.grids.map(style => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
  };
}
