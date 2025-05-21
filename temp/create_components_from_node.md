### create_components_from_node
Converts one or more existing nodes into components in Figma.

**Parameters:**
- entry (object, optional): { nodeId: string, maintain_position?: boolean } (for single node)
- entries (array, optional): Array<{ nodeId: string, maintain_position?: boolean }> (for batch)
- skip_errors (boolean, optional): Whether to skip errors (default: false)

**Returns:**
- content: Array of objects. Each object contains:
    - type: "text"
    - text: JSON string with created component IDs and any errors.

**Example:**
```json
{ "entry": { "nodeId": "123:456" } }
```
```json
{ "entries": [{ "nodeId": "123:456" }, { "nodeId": "789:101", "maintain_position": true }], "skip_errors": true }
