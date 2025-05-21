### create_line
Creates one or more line nodes in the specified Figma document. Accepts either a single line config (via the 'line' property) or an array of configs (via the 'lines' property). Optionally, you can provide a parent node ID, stroke color, and stroke weight.

**Parameters:**
- line (object, optional): A single line configuration object. Each object should include coordinates, dimensions, and optional properties for a line.
- lines (array, optional): An array of line configuration objects. Each object should include coordinates, dimensions, and optional properties for a line.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created line node ID(s).

**Example:**
```json
{
  "command": "create_line",
  "params": {
    "line": {
      "x1": 10,
      "y1": 20,
      "x2": 110,
      "y2": 20
    }
  }
}
```
```json
{
  "command": "create_line",
  "params": {
    "lines": [
      { "x1": 10, "y1": 20, "x2": 110, "y2": 20 },
      { "x1": 20, "y1": 30, "x2": 120, "y2": 30 }
    ]
  }
}
