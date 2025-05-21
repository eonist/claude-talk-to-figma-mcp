### move_node
Move one or more nodes (single or batch) to new positions in Figma.

**Parameters:**
- move (object, optional): Single move configuration object with properties:
  - nodeId (string): The unique Figma node ID to move.
  - x (number): New X position.
  - y (number): New Y position.
- moves (array, optional): Array of move configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the moved node ID(s) and new position(s).

**Example:**
```json
{ "move": { "nodeId": "123:456", "x": 100, "y": 200 } }
```
```json
{ "moves": [
  { "nodeId": "123:456", "x": 100, "y": 200 },
  { "nodeId": "789:101", "x": 300, "y": 400 }
] }
