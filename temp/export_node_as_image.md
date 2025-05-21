### export_node_as_image
Export a node as an image from Figma in the specified format and scale.

**Parameters:**
- nodeId (string): The unique Figma node ID to export.
- format (string, optional): The image format to export: "PNG", "JPG", "SVG", or "PDF". Defaults to "PNG".
- scale (number, optional): The export scale factor. Must be a positive number. Defaults to 1.

**Returns:**
- content: Array of objects. Each object contains type: "image", data (image data), and mimeType (image mime type).

**Example:**
```json
{ "nodeId": "123:456", "format": "PNG", "scale": 2 }
```
