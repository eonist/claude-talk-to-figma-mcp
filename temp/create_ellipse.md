### create_ellipse
Creates one or more ellipse nodes in the specified Figma document. Accepts either a single ellipse config (via the 'ellipse' property) or an array of configs (via the 'ellipses' property). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

**Parameters:**
- ellipse (object, optional): A single ellipse configuration object. Each object should include coordinates, dimensions, and optional properties for an ellipse.
- ellipses (array, optional): An array of ellipse configuration objects. Each object should include coordinates, dimensions, and optional properties for an ellipse.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created ellipse node ID(s).

**Example:**
```json
{
  "command": "create_ellipse",
  "params": {
    "ellipse": {
      "x": 60,
      "y": 80,
      "width": 120,
      "height": 90,
      "name": "Ellipse1"
    }
  }
}
```
```json
{
  "command": "create_ellipse",
  "params": {
    "ellipses": [
      { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Ellipse1" },
      { "x": 120, "y": 20, "width": 80, "height": 40 }
    ]
  }
}
```
