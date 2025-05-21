### get_variable
Query Figma Variables by type, collection, mode, or IDs.

**Parameters:**
- type (string, optional): Filter by variable type ("COLOR", "NUMBER", "STRING", "BOOLEAN").
- collection (string, optional): Filter by collection.
- mode (string, optional): Filter by mode.
- ids (array of string, optional): Filter by specific variable ids.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the variable(s) info as JSON.

**Example:**
```json
{ "type": "COLOR" }
```
```json
{ "collection": "Theme" }
```
```json
{ "ids": ["var123", "var456"] }
