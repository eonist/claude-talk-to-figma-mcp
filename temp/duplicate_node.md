### duplicate_node
Duplicate a node (single or batch) in Figma.

**Parameters:**
- node (object, optional): Single node clone configuration object with properties:
  - nodeId (string): ID of the node to clone.
  - position (object, optional): { x: number, y: number } position for the clone.
  - offsetX (number, optional): X offset.
  - offsetY (number, optional): Y offset.
  - parentId (string, optional): Parent node ID.
- nodes (array, optional): Array of node clone configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the new node ID(s).

**Example:**
```json
{ "node": { "nodeId": "123:456", "position": { "x": 100, "y": 200 } } }
```
```json
{ "nodes": [
  { "nodeId": "123:456", "offsetX": 10, "offsetY": 20 },
  { "nodeId": "789:101", "parentId": "456:789" }
] }
