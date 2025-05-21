### set_node_prop
Set node properties (locked, visible, etc.) for one or more nodes in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- properties (object): Properties to set (e.g., locked, visible).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{
  "nodeId": "123:456",
  "properties": {
    "locked": true,
    "visible": false
  }
}
