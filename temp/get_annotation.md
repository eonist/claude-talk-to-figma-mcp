### get_annotation
Get annotation(s) for one or more Figma nodes.

**Parameters:**
- nodeId (string, optional): Node ID for single node.
- nodeIds (array of string, optional): Array of node IDs for batch.

**Returns:**
- content: For single: { nodeId, annotations }, for batch: Array<{ nodeId, annotations }>.

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
