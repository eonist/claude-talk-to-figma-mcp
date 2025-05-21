### boolean
Perform boolean operations (union, subtract, intersect, exclude) on Figma nodes.

**Parameters:**
- operation (string): One of "union", "subtract", "intersect", "exclude".
- selection (boolean, optional): If true, use the current selection in Figma.
- nodeId (string, optional): Single node ID.
- nodeIds (array of string, optional): Multiple node IDs.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result.

**Example:**
```json
{ "operation": "union", "nodeIds": ["123:456", "789:101"] }
```
```json
{ "operation": "subtract", "nodeId": "123:456" }
