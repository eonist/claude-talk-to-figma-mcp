### get_pages

Returns information about all pages in the current document.

**Parameters**: None

**Returns**: An array of page information objects, each containing:
- `id`: The unique identifier for the page.
- `name`: The name of the page.
- `childCount`: The number of child nodes in the page.

**Example**:

```json
{
  "command": "get_pages"
}
```

**Response**:

```json
[
  {
    "id": "0:1",
    "name": "Page 1",
    "childCount": 5
  },
  {
    "id": "1:1",
    "name": "Page 2",
    "childCount": 3
  }
]
```

---

### set_current_page

Sets the specified page as the current active page.

**Parameters**:
- `pageId` (required): The ID of the page to set as current.

**Returns**: Information about the newly active page, containing:
- `id`: The unique identifier for the page.
- `name`: The name of the page.
- `childCount`: The number of child nodes in the page.

**Example**:

```json
{
  "command": "set_current_page",
  "pageId": "123:456"
}
```

**Response**:

```json
{
  "id": "123:456",
  "name": "My Page",
  "childCount": 5
}
```

---

### create_page

Creates a new page in the document.

**Parameters**:
- `name` (optional): The name for the new page. Default is "New Page".

**Returns**: Information about the newly created page, containing:
- `id`: The unique identifier for the page.
- `name`: The name of the page.
- `childCount`: The number of child nodes in the page (always 0 for a new page).

**Example**:

```json
{
  "command": "create_page",
  "name": "My New Page"
}
```

**Response**:

```json
{
  "id": "456:789",
  "name": "My New Page",
  "childCount": 0
}
```
