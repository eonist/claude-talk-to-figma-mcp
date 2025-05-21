### get_svg_vector
Get SVG markup for one or more vector nodes.

**Parameters:**
- nodeId (string, optional): The unique Figma vector node ID to get SVG for.
- nodeIds (array, optional): Array of vector node IDs.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the SVG markup as a string.

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
