### get_constraint
Get constraints for one or more Figma nodes (optionally including children).

**Parameters:**
- nodeId (string, optional): Single node ID (if omitted, use current selection).
- nodeIds (array of string, optional): Multiple node IDs.
- includeChildren (boolean, optional): If true, include constraints for all children.

**Returns:**
- content: Array of constraint info for each node, including children if requested.

**Example:**
```json
{ "nodeId": "123:456", "includeChildren": true }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```
