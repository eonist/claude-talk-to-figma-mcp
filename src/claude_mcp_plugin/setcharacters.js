/**
 * Removes duplicate items from an array based on a key or predicate function.
 *
 * @template T, K
 * @param {T[]} arr - Array of items to deduplicate.
 * @param {((item: T) => K) | string} predicate - Function or property name to derive uniqueness key.
 * @returns {T[]} Array of unique items preserving first occurrences.
 * @example
 * // Deduplicate by 'id' property:
 * uniqBy([{id:1},{id:2},{id:1}], 'id');
 */
function uniqBy(arr, predicate) {
  const cb = typeof predicate === "function" ? predicate : (o) => o[predicate];
  return [
    ...arr
      .reduce((map, item) => {
        const key = item === null || item === undefined ? item : cb(item);

        map.has(key) || map.set(key, item);

        return map;
      }, new Map())
      .values(),
  ];
}
/**
 * Sets text characters on a Figma TextNode with optional font fallback and strategies.
 *
 * @param {TextNode} node - Figma TextNode to update.
 * @param {string} characters - The text string to set.
 * @param {object} [options] - Configuration options.
 * @param {{family:string, style:string}} [options.fallbackFont={family:'Roboto',style:'Regular'}] - Fallback font if loading fails.
 * @param {'prevail'|'strict'|'experimental'} [options.smartStrategy] - Strategy for mixed-font nodes.
 * @returns {Promise<boolean>} Resolves to true if characters set successfully, false otherwise.
 * @example
 * // Simple usage:
 * await setCharacters(textNode, 'Hello World');
 * @example
 * // With smart strategy:
 * await setCharacters(textNode, 'Hello', { smartStrategy: 'prevail' });
 */
export const setCharacters = async (node, characters, options) => {
  const fallbackFont = options?.fallbackFont || {
    family: "Roboto",
    style: "Regular",
  };
  try {
    if (node.fontName === figma.mixed) {
      if (options?.smartStrategy === "prevail") {
        const fontHashTree = {};
        for (let i = 1; i < node.characters.length; i++) {
          const charFont = node.getRangeFontName(i - 1, i);
          const key = `${charFont.family}::${charFont.style}`;
          fontHashTree[key] = fontHashTree[key] ? fontHashTree[key] + 1 : 1;
        }
        const prevailedTreeItem = Object.entries(fontHashTree).sort(
          (a, b) => b[1] - a[1]
        )[0];
        const [family, style] = prevailedTreeItem[0].split("::");
        const prevailedFont = {
          family,
          style,
        };
        await figma.loadFontAsync(prevailedFont);
        node.fontName = prevailedFont;
      } else if (options?.smartStrategy === "strict") {
        return setCharactersWithStrictMatchFont(node, characters, fallbackFont);
      } else if (options?.smartStrategy === "experimental") {
        return setCharactersWithSmartMatchFont(node, characters, fallbackFont);
      } else {
        const firstCharFont = node.getRangeFontName(0, 1);
        await figma.loadFontAsync(firstCharFont);
        node.fontName = firstCharFont;
      }
    } else {
      await figma.loadFontAsync({
        family: node.fontName.family,
        style: node.fontName.style,
      });
    }
  } catch (err) {
    console.warn(
      `Failed to load "${node.fontName["family"]} ${node.fontName["style"]}" font and replaced with fallback "${fallbackFont.family} ${fallbackFont.style}"`,
      err
    );
    await figma.loadFontAsync(fallbackFont);
    node.fontName = fallbackFont;
  }
  try {
    node.characters = characters;
    return true;
  } catch (err) {
    console.warn(`Failed to set characters. Skipped.`, err);
    return false;
  }
};

/**
 * Helper: Sets characters on a Figma TextNode preserving original fonts using the strict-match strategy.
 *
 * @param {TextNode} node - Figma TextNode to update.
 * @param {string} characters - The text string to set.
 * @param {{family:string, style:string}} fallbackFont - Fallback font to use if strict matching fails.
 * @returns {Promise<boolean>} Resolves to true once strict-match font assignment is complete.
 */
const setCharactersWithStrictMatchFont = async (
  node,
  characters,
  fallbackFont
) => {
  const fontHashTree = {};
  for (let i = 1; i < node.characters.length; i++) {
    const startIdx = i - 1;
    const startCharFont = node.getRangeFontName(startIdx, i);
    const startCharFontVal = `${startCharFont.family}::${startCharFont.style}`;
    while (i < node.characters.length) {
      i++;
      const charFont = node.getRangeFontName(i - 1, i);
      if (startCharFontVal !== `${charFont.family}::${charFont.style}`) {
        break;
      }
    }
    fontHashTree[`${startIdx}_${i}`] = startCharFontVal;
  }
  await figma.loadFontAsync(fallbackFont);
  node.fontName = fallbackFont;
  node.characters = characters;
  console.log(fontHashTree);
  await Promise.all(
    Object.keys(fontHashTree).map(async (range) => {
      console.log(range, fontHashTree[range]);
      const [start, end] = range.split("_");
      const [family, style] = fontHashTree[range].split("::");
      const matchedFont = {
        family,
        style,
      };
      await figma.loadFontAsync(matchedFont);
      return node.setRangeFontName(Number(start), Number(end), matchedFont);
    })
  );
  return true;
};

/**
 * Determines ranges between delimiters in a string.
 *
 * @param {string} str - Input string to scan.
 * @param {string} delimiter - Character delimiter to split on (e.g., '\\n' or ' ').
 * @param {number} [startIdx=0] - Starting index in the string.
 * @param {number} [endIdx=str.length] - Ending index in the string.
 * @returns {Array<[number, number]>} Array of [start, end] index tuples for each segment.
 * @example
 * // Split 'a b c' around spaces:
 * getDelimiterPos('a b c', ' ');
 */
const getDelimiterPos = (str, delimiter, startIdx = 0, endIdx = str.length) => {
  const indices = [];
  let temp = startIdx;
  for (let i = startIdx; i < endIdx; i++) {
    if (
      str[i] === delimiter &&
      i + startIdx !== endIdx &&
      temp !== i + startIdx
    ) {
      indices.push([temp, i + startIdx]);
      temp = i + startIdx + 1;
    }
  }
  temp !== endIdx && indices.push([temp, endIdx]);
  return indices.filter(Boolean);
};

/**
 * Builds a linear font sequence for a TextNode by scanning newline and space delimiters.
 *
 * @param {TextNode} node - Figma TextNode to analyze.
 * @returns {Array<{family:string, style:string, delimiter:string}>} Sorted array describing fonts and delimiters sequence.
 */
const buildLinearOrder = (node) => {
  const fontTree = [];
  const newLinesPos = getDelimiterPos(node.characters, "\n");
  newLinesPos.forEach(([newLinesRangeStart, newLinesRangeEnd], n) => {
    const newLinesRangeFont = node.getRangeFontName(
      newLinesRangeStart,
      newLinesRangeEnd
    );
    if (newLinesRangeFont === figma.mixed) {
      const spacesPos = getDelimiterPos(
        node.characters,
        " ",
        newLinesRangeStart,
        newLinesRangeEnd
      );
      spacesPos.forEach(([spacesRangeStart, spacesRangeEnd], s) => {
        const spacesRangeFont = node.getRangeFontName(
          spacesRangeStart,
          spacesRangeEnd
        );
        if (spacesRangeFont === figma.mixed) {
          const spacesRangeFont = node.getRangeFontName(
            spacesRangeStart,
            spacesRangeStart[0]
          );
          fontTree.push({
            start: spacesRangeStart,
            delimiter: " ",
            family: spacesRangeFont.family,
            style: spacesRangeFont.style,
          });
        } else {
          fontTree.push({
            start: spacesRangeStart,
            delimiter: " ",
            family: spacesRangeFont.family,
            style: spacesRangeFont.style,
          });
        }
      });
    } else {
      fontTree.push({
        start: newLinesRangeStart,
        delimiter: "\n",
        family: newLinesRangeFont.family,
        style: newLinesRangeFont.style,
      });
    }
  });
  return fontTree
    .sort((a, b) => +a.start - +b.start)
    .map(({ family, style, delimiter }) => ({ family, style, delimiter }));
};

/**
 * Helper: Sets characters on a Figma TextNode using a smart-match font strategy.
 *
 * @param {TextNode} node - Figma TextNode to update.
 * @param {string} characters - The text string to set.
 * @param {{family:string, style:string}} fallbackFont - Fallback font to load.
 * @returns {Promise<boolean>} Resolves to true once smart-match font assignment is complete.
 * @example
 * await setCharactersWithSmartMatchFont(textNode, 'Hello', { family: 'Roboto', style: 'Regular' });
 */
const setCharactersWithSmartMatchFont = async (
  node,
  characters,
  fallbackFont
) => {
  const rangeTree = buildLinearOrder(node);
  const fontsToLoad = uniqBy(
    rangeTree,
    ({ family, style }) => `${family}::${style}`
  ).map(({ family, style }) => ({
    family,
    style,
  }));

  await Promise.all([...fontsToLoad, fallbackFont].map(figma.loadFontAsync));

  node.fontName = fallbackFont;
  node.characters = characters;

  let prevPos = 0;
  rangeTree.forEach(({ family, style, delimiter }) => {
    if (prevPos < node.characters.length) {
      const delimeterPos = node.characters.indexOf(delimiter, prevPos);
      const endPos =
        delimeterPos > prevPos ? delimeterPos : node.characters.length;
      const matchedFont = {
        family,
        style,
      };
      node.setRangeFontName(prevPos, endPos, matchedFont);
      prevPos = endPos + 1;
    }
  });
  return true;
};
