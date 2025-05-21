### set_auto_layout
Configure auto layout (single or batch) on a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- properties (object): Auto layout properties to set.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{
  "nodeId": "123:456",
  "properties": {
    "layoutMode": "VERTICAL",
    "primaryAxisAlign": "MIN",
    "counterAxisAlign": "CENTER",
    "paddingTop": 10,
    "paddingBottom": 10,
    "paddingLeft": 10,
    "paddingRight": 10,
    "itemSpacing": 8
  }
}
