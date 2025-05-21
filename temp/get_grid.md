### get_grid
Get all layout grids for one or more Figma nodes (FRAME, COMPONENT, INSTANCE).

**Parameters:**
- nodeId (string, optional): Single node ID.
- nodeIds (array of string, optional): Multiple node IDs.

**Returns:**
- content: For single: { nodeId, grids: [...] }, for batch: Array<{ nodeId, grids: [...] }>.

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
