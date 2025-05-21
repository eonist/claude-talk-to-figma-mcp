### set_grid
Create, update, or delete one or more layout grids on Figma nodes (FRAME, COMPONENT, INSTANCE).

**Parameters:**
- entry (object, optional): Single grid operation
  - nodeId (string): Node to modify
  - gridIndex (number, optional): Index of grid to update/delete (omit for create)
  - properties (object, optional): Grid properties (for create/update)
  - delete (boolean, optional): If true, delete the grid at gridIndex
- entries (array, optional): Batch of grid operations (same shape as above)

**Returns:**
- content: Array of result objects for each operation.

**Example:**
```json
{
  "entry": {
    "nodeId": "123:456",
    "properties": {
      "pattern": "COLUMNS",
      "sectionSize": 12,
      "gutterSize": 24,
      "count": 4
    }
  }
}
