### create_frame
Creates one or more frame nodes in the specified Figma document. Accepts either a single frame config (via the 'frame' property) or an array of configs (via the 'frames' property). Optionally, you can provide a name, a parent node ID, fill color, stroke color, and stroke weight.

**Parameters:**
- frame (object, optional): A single frame configuration object. Each object should include coordinates, dimensions, and optional properties for a frame.
- frames (array, optional): An array of frame configuration objects. Each object should include coordinates, dimensions, and optional properties for a frame.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created frame node ID(s).

**Example:**
```json
{
  "command": "create_frame",
  "params": {
    "frame": {
      "x": 50,
      "y": 100,
      "width": 400,
      "height": 300,
      "name": "Main Frame"
    }
  }
}
```
```json
{
  "command": "create_frame",
  "params": {
    "frames": [
      { "x": 10, "y": 20, "width": 100, "height": 50, "name": "Frame1" },
      { "x": 120, "y": 20, "width": 80, "height": 40 }
    ]
  }
}
```
