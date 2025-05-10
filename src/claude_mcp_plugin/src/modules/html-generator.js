/**
 * Simple HTML generator for FRAME, TEXT, and RECTANGLE nodes.
 * Supports inline style output; other cssMode values fall back to inline.
 */
class HTMLGenerator {
  constructor(options) {
    this.options = options;
    // cssExtractor: function(node) => Promise<cssProps>
    this.cssExtractor = options.cssExtractor;
  }

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

  async processText(node) {
    var tag = (this.options.format === 'semantic') ? 'p' : 'div';
    var attr = await this.buildStyleAttr(node);
    var text = node.characters || '';
    return '<' + tag + attr + '>' + text + '</' + tag + '>';
  }

  async processRectangle(node) {
    var tag = 'div';
    var attr = await this.buildStyleAttr(node);
    return '<' + tag + attr + '></' + tag + '>';
  }

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
