### set_gradient
Set a gradient on one or more nodes in Figma, either directly or by style variable.

**Parameters:**
- entries (object or array): Either a single application or an array of applications. Each entry includes:
  - nodeId (string): The unique Figma node ID to update.
  - gradientType (string, optional): Type of gradient ("LINEAR", "RADIAL", "ANGULAR", "DIAMOND").
  - stops (array, optional): Array of color stops.
  - gradientStyleId (string, optional): The ID of the gradient style to apply.
  - applyTo (string, optional): Where to apply the gradient ("FILL", "STROKE", "BOTH").

**Returns:**
- content: Array containing a text message with the updated node(s) ID(s) or a summary.

**Example:**
```json
{
  "entries": {
    "nodeId": "123:456",
    "gradientType": "LINEAR",
    "stops": [
      { "position": 0, "color": [1, 0, 0, 1] },
      { "position": 1, "color": [0, 0, 1, 1] }
    ],
    "applyTo": "FILL"
  }
}
```
```json
{
  "entries": [
    {
      "nodeId": "123:456",
      "gradientType": "LINEAR",
      "stops": [
        { "position": 0, "color": [1, 0, 0, 1] },
        { "position": 1, "color": [0, 0, 1, 1] }
      ],
      "applyTo": "FILL"
    },
    {
      "nodeId": "789:101",
      "gradientStyleId": "S:gradient123",
      "applyTo": "STROKE"
    }
  ]
}
