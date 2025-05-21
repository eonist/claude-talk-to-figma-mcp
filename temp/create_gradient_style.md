### create_gradient_style
Creates one or more gradient style variables in Figma.

**Parameters:**
- gradients (object or array): Either a single gradient definition or an array of gradient definitions.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created gradient(s) ID(s) or a summary.

**Example:**
```json
{
  "gradients": {
    "name": "Primary Gradient",
    "gradientType": "LINEAR",
    "stops": [
      { "position": 0, "color": [1, 0, 0, 1] },
      { "position": 1, "color": [0, 0, 1, 1] }
    ]
  }
}
```
```json
{
  "gradients": [
    {
      "name": "Primary Gradient",
      "gradientType": "LINEAR",
      "stops": [
        { "position": 0, "color": [1, 0, 0, 1] },
        { "position": 1, "color": [0, 0, 1, 1] }
      ]
    },
    {
      "name": "Secondary Gradient",
      "gradientType": "RADIAL",
      "stops": [
        { "position": 0, "color": [0, 1, 0, 1] },
        { "position": 1, "color": [0, 0, 0, 1] }
      ]
    }
  ]
}
