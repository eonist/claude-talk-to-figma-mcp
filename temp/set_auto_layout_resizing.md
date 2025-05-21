### set_auto_layout_resizing
Set hug or fill sizing mode on an auto layout frame or child node in Figma.

**Parameters:**
- nodeId (string): The unique Figma node ID to update.
- axis (string): The axis to set sizing mode for: "horizontal" or "vertical".
- mode (string): The sizing mode to set: "FIXED", "HUG", or "FILL".

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the updated node's ID.

**Example:**
```json
{
  "nodeId": "123:456",
  "axis": "horizontal",
  "mode": "HUG"
}
