### resize_node
Resize a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to resize.
- width (number): The new width for the node, in pixels.
- height (number): The new height for the node, in pixels.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the resized node's ID and new size.

**Example:**
```json
{
  "nodeId": "123:456",
  "width": 200,
  "height": 100
}
