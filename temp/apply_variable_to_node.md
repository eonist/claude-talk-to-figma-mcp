### apply_variable_to_node
Apply a Figma Variable to a node property.

**Parameters:**
- nodeId (string): The Figma node ID.
- variableId (string): The variable ID to apply.
- property (string): The property to apply the variable to (e.g., "fill", "stroke", "fontSize").

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the result.

**Example:**
```json
{
  "nodeId": "123:456",
  "variableId": "var123",
  "property": "fill"
}
