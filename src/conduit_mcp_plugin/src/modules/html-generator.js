/**
 * HTML generator module for Figma nodes.
 * Generates HTML for FRAME, TEXT, and RECTANGLE nodes with inline styles.
 *
 * @module modules/html-generator
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML}
 */

/**
 * Class for generating HTML from Figma node objects.
 * Supports FRAME, TEXT, and RECTANGLE node types.
 */
class HTMLGenerator {
  /**
   * Create an HTMLGenerator.
   * @param {object} options - Generator options.
   * @param {'semantic'|'div-based'} [options.format='semantic'] - Output format: 'semantic' uses section/p, 'div-based' uses divs.
   * @param {function} options.cssExtractor - Async function(node): Promise<object> to extract CSS properties for a node.
   */
  constructor(options) {
    this.options = options;
    // cssExtractor: function(node) => Promise<cssProps>
    this.cssExtractor = options.cssExtractor;
  }

  /**
   * Generate HTML for a Figma node and its children.
   * @async
   * @param {object} node - Figma node object (FRAME, TEXT, or RECTANGLE).
   * @param {string} node.type - Node type.
   * @returns {Promise<string>} Generated HTML string.
   */
  async generate(node) {
    if (!node || !node.type) {
      return '';
    }
    switch (node.type) {
      case 'FRAME':
        return this.processFrame(node);
      case 'TEXT':
        return this.processText(node);
      case 'RECTANGLE':
        return this.processRectangle(node);
      default:
        return '';
    }
  }

  /**
   * Generate HTML for a FRAME node and its children.
   * @async
   * @param {object} node - FRAME node.
   * @returns {Promise<string>} HTML string for the frame and its children.
   */
  async processFrame(node) {
    var htmlParts = [];
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) {
      htmlParts.push(await this.generate(children[i]));
    }
    var tag = (this.options.format === 'semantic') ? 'section' : 'div';
    var attr = await this.buildStyleAttr(node);
    return '<' + tag + attr + '>\n' +
      htmlParts.join('\n') +
      '\n</' + tag + '>';
  }

  /**
   * Generate HTML for a TEXT node.
   * @async
   * @param {object} node - TEXT node.
   * @returns {Promise<string>} HTML string for the text node.
   */
  async processText(node) {
    var tag = (this.options.format === 'semantic') ? 'p' : 'div';
    var attr = await this.buildStyleAttr(node);
    var text = node.characters || '';
    return '<' + tag + attr + '>' + text + '</' + tag + '>';
  }

  /**
   * Generate HTML for a RECTANGLE node.
   * @async
   * @param {object} node - RECTANGLE node.
   * @returns {Promise<string>} HTML string for the rectangle node.
   */
  async processRectangle(node) {
    var tag = 'div';
    var attr = await this.buildStyleAttr(node);
    return '<' + tag + attr + '></' + tag + '>';
  }

  /**
   * Build the style attribute string for a node using the cssExtractor.
   * @async
   * @param {object} node - Node to extract styles from.
   * @returns {Promise<string>} Style attribute string (e.g., ' style="color: red;"') or empty string.
   */
  async buildStyleAttr(node) {
    try {
      var cssProps = await this.cssExtractor(node);
      if (!cssProps || typeof cssProps !== 'object') {
        return '';
      }
      var entries = Object.keys(cssProps).map(function(key) {
        return key + ': ' + cssProps[key];
      });
      if (entries.length === 0) {
        return '';
      }
      var styleString = entries.join('; ');
      return ' style="' + styleString + '"';
    } catch (e) {
      return '';
    }
  }
};

/**
 * Unified handler for GENERATE_HTML plugin command.
 * @async
 * @function generateHtmlUnified
 * @param {object} params - { nodeId, format, cssMode }
 * @returns {Promise<string>}
 */
export async function generateHtmlUnified({ nodeId, format, cssMode }) {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  const generator = new HTMLGenerator({
    format,
    cssMode,
    cssExtractor: n => n.getCSSAsync()
  });
  return await generator.generate(node);
}
