### create_rectangle
Creates one or more rectangle shape nodes in the specified Figma document. Accepts either a single rectangle config (via the 'rectangle' property) or an array of configs (via the 'rectangles' property). Optionally, you can provide a name, a parent node ID to attach the rectangle(s) to, and a corner radius for rounded corners.

**Parameters:**
- rectangle (object, optional): A single rectangle configuration object. Each object should include coordinates, dimensions, and optional properties for a rectangle.
- rectangles (array, optional): An array of rectangle configuration objects. Each object should include coordinates, dimensions, and optional properties for a rectangle.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created rectangle node ID(s).

**Example:**
```json
{
  "command": "create_rectangle",
  "params": {
    "rectangle": {
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 150,
      "name": "Button Background",
      "cornerRadius": 8
    }
  }
}
```
```json
{
  "command": "create_rectangle",
  "params": {
    "rectangles": [
      { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Rect1" },
      { "x": 120, "y": 20, "width": 80, "height": 40 }
    ]
  }
}
