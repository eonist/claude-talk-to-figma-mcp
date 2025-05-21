### set_image
Set or insert images from URLs, local files, or base64 data (single or batch).

**Parameters:**
- image (object, optional): A single image configuration object.
- images (array, optional): An array of image configuration objects.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the inserted image node ID(s).

**Example:**
```json
{ "image": { "url": "https://example.com/image.png" } }
```
```json
{ "images": [
  { "url": "https://example.com/image1.png" },
  { "url": "https://example.com/image2.png" }
] }
