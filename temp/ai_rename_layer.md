### ai_rename_layer
AI-powered renaming of nodes in Figma.

**Parameters:**
- nodeId (string, optional): The unique Figma node ID to rename.
- nodeIds (array of string, optional): Array of node IDs to rename.
- prompt (string, optional): AI prompt to guide renaming.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the new names or errors.

**Example:**
```json
{ "nodeId": "123:456", "prompt": "Rename to descriptive names" }
```
```json
{ "nodeIds": ["123:456", "789:101"], "prompt": "Rename to descriptive names" }
```
