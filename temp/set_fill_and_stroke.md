### set_fill_and_stroke
Set fill and/or stroke color(s) for one or more nodes.

**Parameters:**
- nodeId (string, required): The unique Figma node ID to update.
- fillColor (object, optional): Fill color.
- strokeColor (object, optional): Stroke color.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the update result.

**Example:**
```json
{
  "nodeId": "123:456",
  "fillColor": { "r": 1, "g": 0, "b": 0, "a": 1 },
  "strokeColor": { "r": 0, "g": 0, "b": 0, "a": 1 }
}
```
