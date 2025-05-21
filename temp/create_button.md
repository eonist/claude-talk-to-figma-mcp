### create_button
Creates a complete button with background and text in Figma at the specified coordinates. You can customize size, text, colors, font, corner radius, name, and parent node.

**Parameters:**
- x (number, optional): X coordinate.
- y (number, optional): Y coordinate.
- width (number, optional): Width of the button.
- height (number, optional): Height of the button.
- text (string, optional): Button text.
- background (object, optional): RGBA background color.
- textColor (object, optional): RGBA text color.
- fontSize (number, optional): Font size.
- fontWeight (number, optional): Font weight.
- cornerRadius (number, optional): Corner radius.
- name (string, optional): Name of the button.
- parentId (string, optional): Parent node ID.
- buttons (array, optional): Array of button configs for batch creation.

**Returns:**
- content: Array of objects. Each object contains a type: "text" and a text field with the created button's frame, background, and text node IDs.

**Example:**
```json
{
  "x": 100,
  "y": 200,
  "width": 120,
  "height": 40,
  "text": "Click Me",
  "background": { "r": 0.2, "g": 0.5, "b": 0.8, "a": 1 },
  "textColor": { "r": 1, "g": 1, "b": 1, "a": 1 },
  "fontSize": 16,
  "fontWeight": 600,
  "cornerRadius": 8,
  "name": "Primary Button"
}
