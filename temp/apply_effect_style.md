### apply_effect_style
Applies an effect style to a node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- effectStyleId (string): The ID of the effect style to apply.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.

**Example:**
```json
{
  "nodeId": "123:456",
  "effectStyleId": "S:effect123"
}
