### get_css_async
Get CSS properties from a node.

**Parameters:**
- nodeId (string, optional): The unique Figma node ID to get CSS from.
- format (string, optional): The format to return CSS in: "object", "string", or "inline".

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the CSS properties as JSON.

**Example:**
```json
{ "nodeId": "123:456", "format": "string" }
```
