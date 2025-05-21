### create_polygon
Creates one or more polygon nodes in the specified Figma document. Accepts either a single polygon config (via the 'polygon' property) or an array of configs (via the 'polygons' property). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

**Parameters:**
- polygon (object, optional): A single polygon configuration object. Each object should include coordinates, dimensions, and optional properties for a polygon.
- polygons (array, optional): An array of polygon configuration objects. Each object should include coordinates, dimensions, and optional properties for a polygon.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created polygon node ID(s).

**Example:**
```json
{
  "command": "create_polygon",
  "params": {
    "polygon": {
      "x": 10,
      "y": 20,
      "width": 100,
      "height": 100,
      "sides": 5
    }
  }
}
```
```json
{
  "command": "create_polygon",
  "params": {
    "polygons": [
      { "x": 10, "y": 20, "width": 100, "height": 100, "sides": 5 },
      { "x": 120, "y": 20, "width": 80, "height": 80, "sides": 6 }
    ]
  }
}
