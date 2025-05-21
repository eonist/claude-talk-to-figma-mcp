### create_effect_style_variable
Creates one or more effect style variables in Figma.

**Parameters:**
- effects (object or array): Either a single effect definition or an array of effect definitions.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created effect style(s) ID(s) or a summary.

**Example:**
```json
{
  "effects": {
    "type": "DROP_SHADOW",
    "color": "#000000",
    "offset": { "x": 0, "y": 2 },
    "radius": 4,
    "spread": 0,
    "visible": true,
    "blendMode": "NORMAL",
    "opacity": 0.5,
    "name": "Drop Shadow"
  }
}
```
```json
{
  "effects": [
    {
      "type": "DROP_SHADOW",
      "color": "#000000",
      "offset": { "x": 0, "y": 2 },
      "radius": 4,
      "spread": 0,
      "visible": true,
      "blendMode": "NORMAL",
      "opacity": 0.5,
      "name": "Drop Shadow"
    },
    {
      "type": "INNER_SHADOW",
      "color": "#333333",
      "offset": { "x": 0, "y": -2 },
      "radius": 3,
      "spread": 0,
      "visible": true,
      "blendMode": "NORMAL",
      "opacity": 0.3,
      "name": "Inner Shadow"
    }
  ]
}
```
