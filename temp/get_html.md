### get_html
Generate HTML structure from Figma nodes.

**Parameters:**
- nodeId (string): The unique Figma node ID to generate HTML from.
- format (string, optional): The HTML output format: "semantic", "div-based", or "webcomponent". Defaults to "semantic".
- cssMode (string, optional): The CSS handling mode: "inline", "classes", or "external". Defaults to "classes".

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the generated HTML string.

**Example:**
```json
{ "nodeId": "123:456", "format": "semantic", "cssMode": "classes" }
