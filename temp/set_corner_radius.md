### set_corner_radius
Set the corner radius of a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- radius (number): The new corner radius to set, in pixels.
- corners (array of boolean, optional): An array of four booleans indicating which corners to apply the radius to, in the order: [top-left, top-right, bottom-right, bottom-left].

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.

**Example:**
```json
{
  "nodeId": "123:456",
  "radius": 8,
  "corners": [true, true, false, false]
}
