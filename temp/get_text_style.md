### get_text_style
Extracts text style properties from one or more nodes.

**Parameters:**
- nodeId (string, optional): Single node ID.
- nodeIds (array of string, optional): Multiple node IDs.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the text style info as JSON.

**Example:**
```json
{ "nodeId": "123:456" }
