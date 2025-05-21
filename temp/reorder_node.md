### reorder_node
Reorder one or more nodes in their parents' children arrays (single or batch).

**Parameters:**
- reorder (object, optional): Single reorder configuration object with properties:
  - nodeId (string): The ID of the node to reorder.
  - direction (string, optional): "up", "down", "front", or "back".
  - index (number, optional): New index position.
- reorders (array, optional): Array of reorder configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the results and any errors.

**Example:**
```json
{ "reorder": { "nodeId": "123:456", "direction": "up" } }
```
```json
{ "reorders": [
  { "nodeId": "123:456", "index": 2 },
  { "nodeId": "789:101", "direction": "front" }
] }
