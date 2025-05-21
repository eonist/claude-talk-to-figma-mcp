### set_variant
Create, add, rename, delete, organize, or batch create variants/properties in a component set.

**Parameters:**
- variant (object, optional): Single variant operation
  - componentSetId (string): Target component set node
  - action (string): "create", "add", "rename", "delete", "organize", "batch_create"
  - properties (object, optional): Property name/value pairs for the variant
  - variantId (string, optional): For rename/delete
  - propertyName/newPropertyName (string, optional): For renaming properties
  - propertyValue/newPropertyValue (string, optional): For renaming property values
  - templateComponentId (string, optional): For batch create
  - propertiesList (array, optional): For batch create
  - organizeBy (array, optional): For organizing variants in a grid
- variants (array, optional): Batch of variant operations (same shape as above)

**Returns:**
- content: Array of result objects for each operation.

**Example:**
```json
{
  "variant": {
    "componentSetId": "123:456",
    "action": "create",
    "properties": { "state": "active" }
  }
}
```
