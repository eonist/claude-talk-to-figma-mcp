### set_variable
Create, update, or delete one or more Figma Variables (design tokens).

**Parameters:**
- variables (object or array, optional): For create/update. Either a single variable definition, a single update (with id), or an array of either.
- ids (string or array, optional): For delete. Either a single variable id or an array of ids.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result or summary.

**Example:**
```json
{
  "variables": {
    "name": "Primary Color",
    "type": "COLOR",
    "value": "#ff0000",
    "collection": "Theme",
    "description": "Primary brand color"
  }
}
```
```json
{
  "ids": ["var123", "var456"]
}
