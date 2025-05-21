### group_node
Group or ungroup nodes in Figma.

**Parameters:**
- group (boolean): If true, group nodes; if false, ungroup a group node.
- nodeIds (array of string, optional): The nodes to group (required if grouping).
- name (string, optional): Name for the group (only if grouping).
- nodeId (string, optional): The group node to ungroup (required if ungrouping).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result.

**Example:**
```json
{ "group": true, "nodeIds": ["123:456", "789:101"], "name": "My Group" }
```
```json
{ "group": false, "nodeId": "123:456" }
