### get_variant
Get info about variants/properties for one or more component sets.

**Parameters:**
- componentSetId (string, optional): Single component set node.
- componentSetIds (array of string, optional): Multiple component set nodes.

**Returns:**
- content: For single: { componentSetId, variants: [...] }, for batch: Array<{ componentSetId, variants: [...] }>.

**Example:**
```json
{ "componentSetId": "123:456" }
```
```json
{ "componentSetIds": ["123:456", "789:101"] }
```
