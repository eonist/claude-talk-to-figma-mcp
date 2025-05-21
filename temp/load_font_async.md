### load_font_async
Load a font asynchronously in Figma.

**Parameters:**
- family (string): The font family to set.
- style (string, optional): The font style to set (e.g., 'Bold', 'Italic').

**Returns:**
- content: Array containing a text message with the loaded font.
  Example: { "content": [{ "type": "text", "text": "Font loaded: Roboto" }] }

**Example:**
```json
{ "family": "Roboto" }
```
```json
{ "family": "Roboto", "style": "Bold" }
