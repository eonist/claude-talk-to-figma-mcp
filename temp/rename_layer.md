### rename_layer
Renames one or more nodes in Figma. Accepts either a single rename config (via 'rename') or an array of configs (via 'renames').

**Parameters:**
- rename (object, optional): A single rename configuration object ({ nodeId, newName, setAutoRename? }).
- renames (array, optional): An array of rename configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the original and new name(s).

**Example:**
```json
{ "rename": { "nodeId": "123:456", "newName": "New Name", "setAutoRename": true } }
```
```json
{ "renames": [
  { "nodeId": "123:456", "newName": "Layer 1" },
  { "nodeId": "789:101", "newName": "Layer 2", "setAutoRename": false }
] }
