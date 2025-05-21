### set_style
Set style or styles on one or more nodes.

**Parameters:**
- nodeId (string, optional): The unique Figma node ID to update.
- styles (object, optional): Style properties to set.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{
  "nodeId": "123:456",
  "styles": {
    "fillColor": { "r": 0, "g": 1, "b": 0, "a": 1 },
    "strokeWeight": 2
  }
}
