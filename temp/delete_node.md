### delete_node
Delete one or more nodes in Figma.

**Parameters:**
- nodeId (string, optional): A single node ID to delete.
- nodeIds (array of string, optional): An array of node IDs to delete.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the deleted node's ID(s).

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
