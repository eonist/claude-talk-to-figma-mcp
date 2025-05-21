### flatten_node
Flatten a single node (or batch) or selection in Figma, merging all child vector layers and shapes into a single vector layer.

**Parameters:**
- nodeId (string, optional): A single node ID to flatten.
- nodeIds (array of string, optional): Array of node IDs to flatten.
- selection (boolean, optional): If true, flattens all currently selected nodes.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the results for each node.

**Example:**
```json
{ "nodeId": "123:456" }
```
```json
{ "nodeIds": ["123:456", "789:101"] }
```
```json
{ "selection": true }
```
