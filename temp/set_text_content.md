### set_text_content
Sets the text content of one or more text nodes in Figma.

**Parameters:**
- nodeId (string, optional): The unique Figma text node ID to update (for single).
- text (string, optional): The new text content to set for the node (for single).
- texts (array, optional): Array of { nodeId, text } for batch updates.

At least one of (nodeId + text) or texts is required.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{ "nodeId": "123:456", "text": "Hello, world!" }
```
```json
{ "texts": [{ "nodeId": "123:457", "text": "Hello" }, { "nodeId": "123:458", "text": "World" }] }
```
