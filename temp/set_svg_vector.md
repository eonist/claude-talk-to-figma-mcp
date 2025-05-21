### set_svg_vector
Set or insert SVG vectors in Figma.

**Parameters:**
- svg (object, optional): A single SVG configuration object.
- svgs (array, optional): An array of SVG configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the inserted SVG vector node ID(s).

**Example:**
```json
{ "svg": { "svg": "<svg>...</svg>" } }
```
```json
{ "svgs": [
  { "svg": "<svg>...</svg>" },
  { "svg": "<svg>...</svg>" }
] }
```
