### set_constraint
Set constraints (left/right/top/bottom/center/scale/stretch) for one or more Figma nodes.

**Parameters:**
- constraint (object, optional): Single constraint operation
  - nodeId (string): Target node
  - horizontal (string): "left", "right", "center", "scale", "stretch"
  - vertical (string): "top", "bottom", "center", "scale", "stretch"
- constraints (array, optional): Batch of constraint operations (same shape as above)
- applyToChildren (boolean, optional): If true, apply to all children
- maintainAspectRatio (boolean, optional): If true, use "scale" for both axes

**Returns:**
- content: Array of result objects for each operation.

**Example:**
```json
{
  "constraint": {
    "nodeId": "123:456",
    "horizontal": "left",
    "vertical": "top"
  }
}
