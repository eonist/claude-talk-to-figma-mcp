### switch_variable_mode
Switch the mode for a Figma Variable collection (e.g., light/dark theme).

**Parameters:**
- collection (string): The variable collection name.
- mode (string): The mode to switch to.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result.

**Example:**
```json
{
  "collection": "Theme",
  "mode": "dark"
}
