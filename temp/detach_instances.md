### detach_instances
Detaches one or more Figma component instances from their masters.

**Parameters:**
- instanceId (string, optional): A single instance ID to detach.
- instanceIds (array of string, optional): An array of instance IDs to detach.
- options (object, optional): { maintain_position?: boolean, skip_errors?: boolean }

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the detached instance's ID or error info.

**Example:**
```json
{ "instanceId": "123:456" }
```
```json
{ "instanceIds": ["123:456", "789:101"], "options": { "skip_errors": true } }
```
