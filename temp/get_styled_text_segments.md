### get_styled_text_segments
Get text segments with specific styling in a text node.

**Parameters:**
- nodeId (string): The unique Figma text node ID to analyze.
- property (string): The style property to analyze segments by.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the styled text segments as JSON.

**Example:**
```json
{ "nodeId": "123:456", "property": "fontSize" }
```
