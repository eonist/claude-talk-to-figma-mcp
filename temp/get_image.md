### get_image
Extract image fills or export nodes as images (single or batch).

**Parameters:**
- nodeId (string, optional): The unique Figma node ID to export.
- nodeIds (array of string, optional): Array of node IDs to export.

**Returns:**
- content: Array of objects. Each object contains a type: "image", data (image data), and mimeType (image mime type).

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```
