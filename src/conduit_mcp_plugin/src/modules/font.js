import { setFontName, setFontSize, setFontWeight, setLetterSpacing, setLineHeight, setParagraphSpacing } from './font/font-set.js';
import { loadFontAsyncWrapper } from './font/font-load.js';
import { setBulkFont } from './font/font-bulk.js';

export const fontOperations = {
  setFontName,
  setFontSize,
  setFontWeight,
  setLetterSpacing,
  setLineHeight,
  setParagraphSpacing,
  loadFontAsyncWrapper,
  setBulkFont
};
