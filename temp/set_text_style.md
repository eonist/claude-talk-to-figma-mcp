### set_text_style
Sets one or more text style properties (font, size, weight, spacing, case, decoration, etc.) on one or more nodes in Figma.

**Parameters:**
- nodeId (string, optional): The unique Figma text node ID to update (for single).
- styles (object, optional): Object of style properties to set (for single).
- entries (array, optional): Array of { nodeId, styles } for batch updates.

At least one of (nodeId + styles) or entries is required.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{ "nodeId": "123:456", "styles": { "fontSize": 18, "fontWeight": 700 } }
```
```json
{ "entries": [
    { "nodeId": "123:456", "styles": { "fontSize": 18 } },
    { "nodeId": "789:101", "styles": { "fontWeight": 400, "letterSpacing": 2 } }
  ]
}
