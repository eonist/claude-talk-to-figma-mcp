### set_effect
Set effect(s) directly or by style variable on one or more nodes in Figma.

**Parameters:**
- entries (object or array): Either a single application or an array of applications. Each entry includes:
  - nodeId (string): The unique Figma node ID to update.
  - effects (object or array, optional): Effect or array of effects to set directly.
  - effectStyleId (string, optional): The ID of the effect style variable to apply.

**Returns:**
- content: Array containing a text message with the updated node(s) ID(s) or a summary.

**Example:**
```json
{
  "entries": {
    "nodeId": "123:456",
    "effects": [
      {
        "type": "DROP_SHADOW",
        "color": "#000000",
        "offset": { "x": 0, "y": 2 },
        "radius": 4,
        "spread": 0,
        "visible": true,
        "blendMode": "NORMAL",
        "opacity": 0.5
      }
    ]
  }
}
```
```json
{
  "entries": [
    {
      "nodeId": "123:456",
      "effects": [
        {
          "type": "DROP_SHADOW",
          "color": "#000000",
          "offset": { "x": 0, "y": 2 },
          "radius": 4,
          "spread": 0,
          "visible": true,
          "blendMode": "NORMAL",
          "opacity": 0.5
        }
      ]
    },
    {
      "nodeId": "789:101",
      "effectStyleId": "S:effect123"
    }
  ]
}
