### get_components
Get components from the current document, a team library, or remote team libraries.

**Parameters:**
- source (string, required): "local" | "team" | "remote"
- team_id (string, optional): Figma team ID (required if source is "team")
- page_size (number, optional): Number of components per page (for team/remote)
- after (string|number, optional): Pagination cursor (for team/remote)

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the components info as JSON.

**Example:**
```json
{ "source": "local" }
```
```json
{ "source": "team", "team_id": "123456" }
```
```json
{ "source": "remote" }
```

**Note:** This command is currently not implemented. Legacy component queries have been removed. Please implement a unified component retrieval method.
