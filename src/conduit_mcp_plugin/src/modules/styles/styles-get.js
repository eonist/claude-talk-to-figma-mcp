/**
 * Retrieves local style definitions from Figma.
 * @async
 * @function getStyles
 * @returns {Promise<object>} Styles categorized by type.
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
