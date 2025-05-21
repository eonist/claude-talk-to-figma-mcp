### set_node
Set or insert a child node into a parent node in Figma.

**Parameters:**
- parentId (string): ID of the parent node.
- childId (string): ID of the child node to insert.
- index (number, optional): Optional insertion index (0-based).

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the parentId, childId, index, success status, and any error message.

**Example:**
```json
{ "parentId": "123:456", "childId": "789:101", "index": 0 }
