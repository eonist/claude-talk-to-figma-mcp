# MCP Commands for Claude Talk to Figma Integration

This comprehensive documentation outlines all available Model Context Protocol (MCP) commands for the Claude Talk to Figma integration. The commands enable AI-assisted design in Figma through natural language instructions processed by Claude.

## Introduction

The Claude Talk to Figma MCP allows Claude to communicate with Figma, enabling powerful design capabilities through simple text commands. This document catalogs all available commands, their parameters, and usage examples to help you effectively leverage this integration.

## Basic Usage

To interact with Figma through Claude, use this format:

```
Talk to Figma, channel {channel-ID}
[Your natural language instruction]
```

Claude will interpret your instruction and execute the appropriate commands in Figma.

## Command Categories

### Basic Operations
- [create_frame](#create_frame): Create a frame with specified dimensions
- [move_nodes](#move_nodes): Move one or more nodes
- [delete_nodes](#delete_nodes): Delete one or more nodes
- [resize_nodes](#resize_nodes): Resize one or more nodes
- [get_selection](#get_selection): Get currently selected nodes
- [set_selection](#set_selection): Select specific nodes

### Shape Creation
- [create_rectangle](#create_rectangle): Create a single rectangle
- [create_rectangles](#create_rectangles): Create multiple rectangles at once
- [create_ellipse](#create_ellipse): Create a single ellipse
- [create_ellipses](#create_ellipses): Create multiple ellipses at once
- [create_polygon](#create_polygon): Create a single polygon
- [create_polygons](#create_polygons): Create multiple polygons at once
- [create_line](#create_line): Create a single line
- [create_lines](#create_lines): Create multiple lines at once

### Text Operations
- [create_text](#create_text): Create a single text element
- [create_bounded_text](#create_bounded_text): Create text within a bounding box
- [set_text_content](#set_text_content): Change text content
- [set_multiple_text_contents](#set_multiple_text_contents): Change multiple text contents
- [set_font](#set_font): Change font properties of text
- [set_bulk_font](#set_bulk_font): Change font for multiple text nodes

### Style Operations
- [set_style](#set_style): Apply style to a node
- [set_styles](#set_styles): Apply style to multiple nodes
- [create_gradient_variable](#create_gradient_variable): Create gradient variable
- [create_gradient_variables](#create_gradient_variables): Create multiple gradient variables
- [apply_gradient_style](#apply_gradient_style): Apply gradient to a node
- [apply_gradient_styles](#apply_gradient_styles): Apply gradient to multiple nodes

### Component Operations
- [create_component_from_node](#create_component_from_node): Convert node to component
- [create_component_instance](#create_component_instance): Create component instance
- [create_component_instances](#create_component_instances): Create multiple instances
- [detach_instance](#detach_instance): Detach component instance

### Layer Management
- [rename_layer](#rename_layer): Rename a single layer
- [rename_layers](#rename_layers): Rename multiple layers with same name
- [rename_multiple](#rename_multiple): Rename multiple layers with unique names
- [group_nodes](#group_nodes): Group nodes together
- [ungroup_nodes](#ungroup_nodes): Ungroup a group
- [flatten_node](#flatten_node): Flatten a node's hierarchy
- [flatten_selection](#flatten_selection): Flatten selected nodes
- [clone_nodes](#clone_nodes): Clone multiple nodes

### Layout Operations
- [set_auto_layout](#set_auto_layout): Apply auto layout to a frame
- [convert_rectangle_to_frame](#convert_rectangle_to_frame): Convert rectangle to frame

### Asset Operations
- [insert_image](#insert_image): Insert image from URL
- [insert_images](#insert_images): Insert multiple images from URLs
- [insert_local_image](#insert_local_image): Insert image from local path or Base64
- [insert_local_images](#insert_local_images): Insert multiple local images
- [insert_svg_vector](#insert_svg_vector): Insert SVG as vector
- [insert_svg_vectors](#insert_svg_vectors): Insert multiple SVGs as vectors

### Boolean Operations
- [union_selection](#union_selection): Union selected shapes
- [subtract_selection](#subtract_selection): Subtract from selected shapes
- [intersect_selection](#intersect_selection): Intersect selected shapes
- [exclude_selection](#exclude_selection): Exclude from selected shapes

### Utility Operations
- [get_available_tools](#get_available_tools): List all available tools

## Command Details

### create_frame
Creates a new frame in Figma.

**Parameters:**
- `x` (number): X position
- `y` (number): Y position
- `width` (number): Frame width
- `height` (number): Frame height
- `name` (string, optional): Frame name

**Example:**
```json
{
  "command": "create_frame",
  "params": {
    "x": 100,
    "y": 100,
    "width": 375,
    "height": 812,
    "name": "Mobile Screen"
  }
}
```

### create_frames
Creates multiple frames at once.

**Parameters:**
- `frames` (array): Array of frame configurations

**Example:**
```json
{
  "command": "create_frames",
  "params": {
    "frames": [
      {
        "x": 100,
        "y": 100,
        "width": 375,
        "height": 812,
        "name": "iPhone 13"
      },
      {
        "x": 500,
        "y": 100,
        "width": 1440,
        "height": 900,
        "name": "Desktop"
      }
    ]
  }
}
```

### create_rectangle
Creates a single rectangle.

**Parameters:**
- `x` (number): X position
- `y` (number): Y position
- `width` (number): Rectangle width
- `height` (number): Rectangle height
- `fill` (object, optional): Fill properties
- `stroke` (object, optional): Stroke properties
- `cornerRadius` (number, optional): Corner radius
- `name` (string, optional): Layer name

**Example:**
```json
{
  "command": "create_rectangle",
  "params": {
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 100,
    "fill": {"type": "SOLID", "color": {"r": 0.8, "g": 0.3, "b": 0.2}},
    "cornerRadius": 8,
    "name": "Button Background"
  }
}
```

### create_rectangles
Creates multiple rectangles at once.

**Parameters:**
- `rectangles` (array): Array of rectangle configurations

**Example:**
```json
{
  "command": "create_rectangles",
  "params": {
    "rectangles": [
      {
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 100,
        "fill": {"type": "SOLID", "color": {"r": 0.8, "g": 0.3, "b": 0.2}}
      },
      {
        "x": 100,
        "y": 220,
        "width": 200,
        "height": 100,
        "fill": {"type": "SOLID", "color": {"r": 0.2, "g": 0.4, "b": 0.8}}
      }
    ]
  }
}
```

### create_ellipse
Creates a single ellipse.

**Parameters:**
- `x` (number): X position of center
- `y` (number): Y position of center
- `radiusX` (number): X radius
- `radiusY` (number): Y radius
- `fill` (object, optional): Fill properties
- `stroke` (object, optional): Stroke properties
- `name` (string, optional): Layer name

**Example:**
```json
{
  "command": "create_ellipse",
  "params": {
    "x": 100,
    "y": 100,
    "radiusX": 50,
    "radiusY": 30,
    "fill": {"type": "SOLID", "color": {"r": 0.8, "g": 0.3, "b": 0.2}},
    "name": "Profile Avatar"
  }
}
```

### create_ellipses
Creates multiple ellipses at once.

**Parameters:**
- `ellipses` (array): Array of ellipse configurations

**Example:**
```json
{
  "command": "create_ellipses",
  "params": {
    "ellipses": [
      {
        "x": 100,
        "y": 100,
        "radiusX": 50,
        "radiusY": 50,
        "fill": {"type": "SOLID", "color": {"r": 0.8, "g": 0.3, "b": 0.2}}
      },
      {
        "x": 300,
        "y": 100,
        "radiusX": 30,
        "radiusY": 30,
        "fill": {"type": "SOLID", "color": {"r": 0.2, "g": 0.4, "b": 0.8}}
      }
    ]
  }
}
```

### create_polygon
Creates a single polygon.

**Parameters:**
- `x` (number): X position of center
- `y` (number): Y position of center
- `radius` (number): Distance from center to vertices
- `sides` (number): Number of sides
- `fill` (object, optional): Fill properties
- `stroke` (object, optional): Stroke properties
- `name` (string, optional): Layer name

**Example:**
```json
{
  "command": "create_polygon",
  "params": {
    "x": 100,
    "y": 100,
    "radius": 50,
    "sides": 6,
    "fill": {"type": "SOLID", "color": {"r": 0.8, "g": 0.3, "b": 0.2}},
    "name": "Hexagon Icon"
  }
}
```

### create_polygons
Creates multiple polygons at once.

**Parameters:**
- `polygons` (array): Array of polygon configurations

**Example:**
```json
{
  "command": "create_polygons",
  "params": {
    "polygons": [
      {
        "x": 100,
        "y": 100,
        "radius": 50,
        "sides": 6,
        "fill": {"type": "SOLID", "color": {"r": 0.8, "g": 0.3, "b": 0.2}}
      },
      {
        "x": 300,
        "y": 100,
        "radius": 40,
        "sides": 3,
        "fill": {"type": "SOLID", "color": {"r": 0.2, "g": 0.4, "b": 0.8}}
      }
    ]
  }
}
```

### create_text
Creates a single text element.

**Parameters:**
- `x` (number): X position
- `y` (number): Y position
- `text` (string): Text content
- `fontSize` (number, optional): Font size
- `fontName` (object, optional): Font family and style
- `fill` (object, optional): Text color properties
- `name` (string, optional): Layer name

**Example:**
```json
{
  "command": "create_text",
  "params": {
    "x": 100,
    "y": 100,
    "text": "Hello, Figma!",
    "fontSize": 24,
    "fontName": {"family": "Inter", "style": "Regular"},
    "fill": {"type": "SOLID", "color": {"r": 0, "g": 0, "b": 0}},
    "name": "Heading"
  }
}
```

### create_bounded_text
Creates text within a bounding box.

**Parameters:**
- `x` (number): X position
- `y` (number): Y position
- `width` (number): Box width
- `height` (number): Box height
- `text` (string): Text content
- `fontSize` (number, optional): Font size
- `fontName` (object, optional): Font family and style
- `fill` (object, optional): Text color properties
- `name` (string, optional): Layer name

**Example:**
```json
{
  "command": "create_bounded_text",
  "params": {
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 100,
    "text": "This text will wrap within the bounds of the container when it reaches the edge.",
    "fontSize": 16,
    "fontName": {"family": "Inter", "style": "Regular"},
    "fill": {"type": "SOLID", "color": {"r": 0, "g": 0, "b": 0}},
    "name": "Description"
  }
}
```

### create_line
Creates a single line.

**Parameters:**
- `startX` (number): X position of start
- `startY` (number): Y position of start
- `endX` (number): X position of end
- `endY` (number): Y position of end
- `stroke` (object, optional): Stroke properties
- `name` (string, optional): Layer name

**Example:**
```json
{
  "command": "create_line",
  "params": {
    "startX": 100,
    "startY": 100,
    "endX": 300,
    "endY": 300,
    "stroke": {
      "color": {"r": 0, "g": 0, "b": 0},
      "weight": 2
    },
    "name": "Diagonal Line"
  }
}
```

### create_lines
Creates multiple lines at once.

**Parameters:**
- `lines` (array): Array of line configurations

**Example:**
```json
{
  "command": "create_lines",
  "params": {
    "lines": [
      {
        "startX": 100,
        "startY": 100,
        "endX": 300,
        "endY": 100,
        "stroke": {
          "color": {"r": 0, "g": 0, "b": 0},
          "weight": 2
        }
      },
      {
        "startX": 100,
        "startY": 200,
        "endX": 300,
        "endY": 200,
        "stroke": {
          "color": {"r": 0, "g": 0, "b": 0},
          "weight": 2
        }
      }
    ]
  }
}
```

### move_nodes
Moves multiple nodes to specified positions.

**Parameters:**
- `nodes` (array): Array of node IDs to move
- `positions` (array): Array of {x, y} positions

**Example:**
```json
{
  "command": "move_nodes",
  "params": {
    "nodes": ["123:456", "123:457"],
    "positions": [
      {"x": 100, "y": 200},
      {"x": 300, "y": 400}
    ]
  }
}
```

### delete_nodes
Deletes multiple nodes.

**Parameters:**
- `nodes` (array): Array of node IDs to delete

**Example:**
```json
{
  "command": "delete_nodes",
  "params": {
    "nodes": ["123:456", "123:457"]
  }
}
```

### set_text_content
Sets the content of an existing text node.

**Parameters:**
- `node` (string): Node ID of text element
- `text` (string): New text content

**Example:**
```json
{
  "command": "set_text_content",
  "params": {
    "node": "123:456",
    "text": "Updated text content"
  }
}
```

### set_multiple_text_contents
Sets content for multiple text nodes.

**Parameters:**
- `updates` (array): Array of {node, text} pairs

**Example:**
```json
{
  "command": "set_multiple_text_contents",
  "params": {
    "updates": [
      {"node": "123:456", "text": "First text"},
      {"node": "123:457", "text": "Second text"}
    ]
  }
}
```

### set_font
Sets the font properties of a text node.

**Parameters:**
- `node` (string): Node ID of text element
- `fontName` (object): Font family and style
- `fontSize` (number, optional): Font size

**Example:**
```json
{
  "command": "set_font",
  "params": {
    "node": "123:456",
    "fontName": {"family": "Inter", "style": "Bold"},
    "fontSize": 24
  }
}
```

### set_bulk_font
Sets font properties for multiple text nodes.

**Parameters:**
- `nodes` (array): Array of node IDs
- `fontName` (object): Font family and style
- `fontSize` (number, optional): Font size

**Example:**
```json
{
  "command": "set_bulk_font",
  "params": {
    "nodes": ["123:456", "123:457"],
    "fontName": {"family": "Inter", "style": "Medium"},
    "fontSize": 16
  }
}
```

### set_style
Sets style properties of a node.

**Parameters:**
- `node` (string): Node ID
- `fill` (object, optional): Fill properties
- `stroke` (object, optional): Stroke properties
- `effects` (array, optional): Effects array

**Example:**
```json
{
  "command": "set_style",
  "params": {
    "node": "123:456",
    "fill": {"type": "SOLID", "color": {"r": 0.8, "g": 0.3, "b": 0.2}}
  }
}
```

### set_styles
Sets style properties for multiple nodes.

**Parameters:**
- `nodes` (array): Array of node IDs
- `fill` (object, optional): Fill properties
- `stroke` (object, optional): Stroke properties
- `effects` (array, optional): Effects array

**Example:**
```json
{
  "command": "set_styles",
  "params": {
    "nodes": ["123:456", "123:457"],
    "fill": {"type": "SOLID", "color": {"r": 0.8, "g": 0.3, "b": 0.2}}
  }
}
```

### create_gradient_variable
Creates a gradient variable.

**Parameters:**
- `name` (string): Variable name
- `stops` (array): Color stops for gradient
- `type` (string): "LINEAR", "RADIAL", etc.
- `gradientHandlePositions` (array, optional): Handle positions

**Example:**
```json
{
  "command": "create_gradient_variable",
  "params": {
    "name": "Blue Gradient",
    "type": "LINEAR",
    "stops": [
      {"position": 0, "color": {"r": 0.1, "g": 0.1, "b": 0.9, "a": 1}},
      {"position": 1, "color": {"r": 0.6, "g": 0.7, "b": 1, "a": 1}}
    ]
  }
}
```

### create_gradient_variables
Creates multiple gradient variables.

**Parameters:**
- `gradients` (array): Array of gradient configurations

**Example:**
```json
{
  "command": "create_gradient_variables",
  "params": {
    "gradients": [
      {
        "name": "Blue Gradient",
        "type": "LINEAR",
        "stops": [
          {"position": 0, "color": {"r": 0.1, "g": 0.1, "b": 0.9, "a": 1}},
          {"position": 1, "color": {"r": 0.6, "g": 0.7, "b": 1, "a": 1}}
        ]
      },
      {
        "name": "Red Gradient",
        "type": "RADIAL",
        "stops": [
          {"position": 0, "color": {"r": 0.9, "g": 0.2, "b": 0.2, "a": 1}},
          {"position": 1, "color": {"r": 1, "g": 0.6, "b": 0.6, "a": 1}}
        ]
      }
    ]
  }
}
```

### apply_gradient_style
Applies a gradient style to a node.

**Parameters:**
- `node` (string): Node ID
- `gradient` (object): Gradient properties

**Example:**
```json
{
  "command": "apply_gradient_style",
  "params": {
    "node": "123:456",
    "gradient": {
      "type": "LINEAR",
      "stops": [
        {"position": 0, "color": {"r": 0.1, "g": 0.1, "b": 0.9, "a": 1}},
        {"position": 1, "color": {"r": 0.6, "g": 0.7, "b": 1, "a": 1}}
      ]
    }
  }
}
```

### apply_gradient_styles
Applies gradient styles to multiple nodes.

**Parameters:**
- `nodes` (array): Array of node IDs
- `gradient` (object): Gradient properties

**Example:**
```json
{
  "command": "apply_gradient_styles",
  "params": {
    "nodes": ["123:456", "123:457"],
    "gradient": {
      "type": "LINEAR",
      "stops": [
        {"position": 0, "color": {"r": 0.1, "g": 0.1, "b": 0.9, "a": 1}},
        {"position": 1, "color": {"r": 0.6, "g": 0.7, "b": 1, "a": 1}}
      ]
    }
  }
}
```

### create_component_from_node
Creates a component from an existing node.

**Parameters:**
- `node` (string): Node ID to convert to component

**Example:**
```json
{
  "command": "create_component_from_node",
  "params": {
    "node": "123:456"
  }
}
```

### create_component_instance
Creates an instance of an existing component.

**Parameters:**
- `componentId` (string): Component key or ID
- `x` (number): X position
- `y` (number): Y position

**Example:**
```json
{
  "command": "create_component_instance",
  "params": {
    "componentId": "123:456",
    "x": 100,
    "y": 100
  }
}
```

### create_component_instances
Creates multiple instances of components.

**Parameters:**
- `instances` (array): Array of component instance configurations

**Example:**
```json
{
  "command": "create_component_instances",
  "params": {
    "instances": [
      {
        "componentId": "123:456",
        "x": 100,
        "y": 100
      },
      {
        "componentId": "123:457",
        "x": 300,
        "y": 100
      }
    ]
  }
}
```

### detach_instance
Detaches a component instance to make it editable.

**Parameters:**
- `node` (string): Node ID of the component instance

**Example:**
```json
{
  "command": "detach_instance",
  "params": {
    "node": "123:456"
  }
}
```

### insert_image
Inserts an image from a URL.

**Parameters:**
- `url` (string): Image URL
- `x` (number): X position
- `y` (number): Y position
- `scale` (number, optional): Scale factor

**Example:**
```json
{
  "command": "insert_image",
  "params": {
    "url": "https://example.com/image.jpg",
    "x": 100,
    "y": 100,
    "scale": 1
  }
}
```

### insert_images
Inserts multiple images from URLs.

**Parameters:**
- `images` (array): Array of image configurations

**Example:**
```json
{
  "command": "insert_images",
  "params": {
    "images": [
      {
        "url": "https://example.com/image1.jpg",
        "x": 100,
        "y": 100
      },
      {
        "url": "https://example.com/image2.jpg",
        "x": 300,
        "y": 100
      }
    ]
  }
}
```

### insert_local_image
Inserts an image from local path or Base64 data.

**Parameters:**
- `imagePath` (string): Path to local image file OR
- `imageData` (string): Base64-encoded image data URI
- `x` (number): X position
- `y` (number): Y position

**Example:**
```json
{
  "command": "insert_local_image",
  "params": {
    "imagePath": "/path/to/image.png",
    "x": 100,
    "y": 100
  }
}
```

### insert_local_images
Inserts multiple images from local paths or Base64 data.

**Parameters:**
- `images` (array): Array of image configurations

**Example:**
```json
{
  "command": "insert_local_images",
  "params": {
    "images": [
      {
        "imagePath": "/path/to/image1.png",
        "x": 100,
        "y": 100
      },
      {
        "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...",
        "x": 300,
        "y": 100
      }
    ]
  }
}
```

### insert_svg_vector
Inserts an SVG as a vector.

**Parameters:**
- `svg` (string): SVG content
- `x` (number): X position
- `y` (number): Y position
- `scale` (number, optional): Scale factor

**Example:**
```json
{
  "command": "insert_svg_vector",
  "params": {
    "svg": "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><circle cx='50' cy='50' r='40' stroke='black' stroke-width='3' fill='red'/></svg>",
    "x": 100,
    "y": 100
  }
}
```

### insert_svg_vectors
Inserts multiple SVGs as vectors.

**Parameters:**
- `svgs` (array): Array of SVG configurations

**Example:**
```json
{
  "command": "insert_svg_vectors",
  "params": {
    "svgs": [
      {
        "svg": "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><circle cx='50' cy='50' r='40' stroke='black' stroke-width='3' fill='red'/></svg>",
        "x": 100,
        "y": 100
      },
      {
        "svg": "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='blue'/></svg>",
        "x": 300,
        "y": 100
      }
    ]
  }
}
```

### rename_layer
Renames a single layer.

**Parameters:**
- `node` (string): Node ID
- `name` (string): New layer name

**Example:**
```json
{
  "command": "rename_layer",
  "params": {
    "node": "123:456",
    "name": "Header Section"
  }
}
```

### rename_layers
Renames multiple layers with the same name.

**Parameters:**
- `nodes` (array): Array of node IDs
- `name` (string): New layer name

**Example:**
```json
{
  "command": "rename_layers",
  "params": {
    "nodes": ["123:456", "123:457"],
    "name": "Button"
  }
}
```

### rename_multiple
Renames multiple layers with different names.

**Parameters:**
- `updates` (array): Array of {node, name} pairs

**Example:**
```json
{
  "command": "rename_multiple",
  "params": {
    "updates": [
      {"node": "123:456", "name": "Header"},
      {"node": "123:457", "name": "Footer"}
    ]
  }
}
```

### group_nodes
Groups multiple nodes together.

**Parameters:**
- `nodes` (array): Array of node IDs to group
- `name` (string, optional): Group name

**Example:**
```json
{
  "command": "group_nodes",
  "params": {
    "nodes": ["123:456", "123:457"],
    "name": "Navigation Elements"
  }
}
```

### ungroup_nodes
Ungroups a group into its constituent nodes.

**Parameters:**
- `node` (string): Group node ID

**Example:**
```json
{
  "command": "ungroup_nodes",
  "params": {
    "node": "123:456"
  }
}
```

### flatten_node
Flattens a node by removing its hierarchy.

**Parameters:**
- `node` (string): Node ID to flatten

**Example:**
```json
{
  "command": "flatten_node",
  "params": {
    "node": "123:456"
  }
}
```

### flatten_selection
Flattens currently selected nodes.

**Parameters:**
- None

**Example:**
```json
{
  "command": "flatten_selection",
  "params": {}
}
```

### clone_nodes
Clones multiple nodes.

**Parameters:**
- `nodes` (array): Array of node IDs to clone
- `offsets` (array, optional): X,Y offsets for each clone

**Example:**
```json
{
  "command": "clone_nodes",
  "params": {
    "nodes": ["123:456", "123:457"],
    "offsets": [
      {"x": 200, "y": 0},
      {"x": 200, "y": 0}
    ]
  }
}
```

### resize_nodes
Resizes multiple nodes.

**Parameters:**
- `nodes` (array): Array of node IDs
- `sizes` (array): Array of {width, height} values

**Example:**
```json
{
  "command": "resize_nodes",
  "params": {
    "nodes": ["123:456", "123:457"],
    "sizes": [
      {"width": 200, "height": 100},
      {"width": 300, "height": 150}
    ]
  }
}
```

### set_auto_layout
Applies auto layout to a frame.

**Parameters:**
- `node` (string): Node ID to apply auto layout to
- `direction` (string): "VERTICAL" or "HORIZONTAL"
- `spacing` (number): Space between items
- `padding` (object): Padding values
- `alignItems` (string, optional): Alignment of children
- `resizing` (object, optional): Resize behavior settings

**Example:**
```json
{
  "command": "set_auto_layout",
  "params": {
    "node": "123:456",
    "direction": "VERTICAL",
    "spacing": 16,
    "padding": {
      "top": 16,
      "right": 16,
      "bottom": 16,
      "left": 16
    },
    "alignItems": "CENTER",
    "resizing": {
      "mode": "HUG",
      "width": 200,
      "height": "AUTO"
    }
  }
}
```

### convert_rectangle_to_frame
Converts a rectangle to a frame.

**Parameters:**
- `node` (string): Node ID of the rectangle to convert

**Example:**
```json
{
  "command": "convert_rectangle_to_frame",
  "params": {
    "node": "123:456"
  }
}
```

### union_selection
Performs a union operation on selected shapes.

**Parameters:**
- None

**Example:**
```json
{
  "command": "union_selection",
  "params": {}
}
```

### subtract_selection
Performs a subtract operation on selected shapes.

**Parameters:**
- None

**Example:**
```json
{
  "command": "subtract_selection",
  "params": {}
}
```

### intersect_selection
Performs an intersect operation on selected shapes.

**Parameters:**
- None

**Example:**
```json
{
  "command": "intersect_selection",
  "params": {}
}
```

### exclude_selection
Performs an exclude operation on selected shapes.

**Parameters:**
- None

**Example:**
```json
{
  "command": "exclude_selection",
  "params": {}
}
```

### get_selection
Gets the currently selected nodes.

**Parameters:**
- None

**Returns:**
- Array of selected node IDs

**Example:**
```json
{
  "command": "get_selection",
  "params": {}
}
```

### set_selection
Sets the selection to specific nodes.

**Parameters:**
- `nodes` (array): Array of node IDs to select

**Example:**
```json
{
  "command": "set_selection",
  "params": {
    "nodes": ["123:456", "123:457"]
  }
}
```

### get_available_tools
Returns a list of all available MCP tools.

**Parameters:**
- None

**Returns:**
- Array of tool names and descriptions

**Example:**
```json
{
  "command": "get_available_tools",
  "params": {}
}
```

## Advanced Usage Examples

### Creating a Mobile App Screen with Header

```json
// Create the mobile frame
{
  "command": "create_frame",
  "params": {
    "x": 100,
    "y": 100,
    "width": 375,
    "height": 812,
    "name": "Mobile Screen"
  }
}

// Create header rectangle
{
  "command": "create_rectangle",
  "params": {
    "x": 0,
    "y": 0,
    "width": 375,
    "height": 64,
    "fill": {"type": "SOLID", "color": {"r": 1, "g": 1, "b": 1}},
    "name": "Header"
  }
}

// Add header title
{
  "command": "create_text",
  "params": {
    "x": 187.5,
    "y": 22,
    "text": "App Title",
    "fontSize": 18,
    "fontName": {"family": "Inter", "style": "Bold"},
    "fill": {"type": "SOLID", "color": {"r": 0, "g": 0, "b": 0}},
    "name": "Header Title"
  }
}
```

### Creating a Design System Color Palette with Gradients

```json
// Create gradient variables
{
  "command": "create_gradient_variables",
  "params": {
    "gradients": [
      {
        "name": "Primary Gradient",
        "type": "LINEAR",
        "stops": [
          {"position": 0, "color": {"r": 0.2, "g": 0.4, "b": 0.8, "a": 1}},
          {"position": 1, "color": {"r": 0.4, "g": 0.6, "b": 1, "a": 1}}
        ]
      },
      {
        "name": "Accent Gradient",
        "type": "RADIAL",
        "stops": [
          {"position": 0, "color": {"r": 0.8, "g": 0.2, "b": 0.4, "a": 1}},
          {"position": 1, "color": {"r": 1, "g": 0.4, "b": 0.6, "a": 1}}
        ]
      }
    ]
  }
}

// Create display rectangles
{
  "command": "create_rectangles",
  "params": {
    "rectangles": [
      {
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 100,
        "name": "Primary Gradient"
      },
      {
        "x": 100,
        "y": 220,
        "width": 200,
        "height": 100,
        "name": "Accent Gradient"
      }
    ]
  }
}

// Apply gradients to rectangles
{
  "command": "apply_gradient_styles",
  "params": {
    "nodes": ["123:456", "123:457"],
    "gradient": {
      "type": "LINEAR",
      "stops": [
        {"position": 0, "color": {"r": 0.2, "g": 0.4, "b": 0.8, "a": 1}},
        {"position": 1, "color": {"r": 0.4, "g": 0.6, "b": 1, "a": 1}}
      ]
    }
  }
}
```

## Best Practices

1. **Use Batch Commands** - Whenever possible, use batch commands (e.g., `create_rectangles` instead of multiple `create_rectangle` calls) for better performance.

2. **Name Your Layers** - Always name your layers for better organization and easier selection with Claude later.

3. **Group Related Elements** - Use `group_nodes` to keep related elements together and maintain a clean layer hierarchy.

4. **Component-Based Design** - Create components for reusable elements to maintain consistency across your design.

5. **Error Handling** - If a command fails, check the WebSocket server logs for troubleshooting information.

## Troubleshooting

If you encounter issues with commands:

1. **Check WebSocket Connection** - Ensure the WebSocket server is running at http://localhost:3055/status

2. **Verify Channel ID** - Make sure you're using the correct channel ID from the Figma plugin

3. **Inspect Error Messages** - Look at the WebSocket server logs for detailed error information

4. **Command Format** - Verify your command JSON is properly formatted with all required parameters

5. **Figma Plugin Status** - Confirm the Claude MCP Plugin is running in your Figma instance

## Conclusion

The Claude Talk to Figma MCP provides powerful capabilities for AI-assisted design in Figma. By mastering these commands, you can create sophisticated designs, automate repetitive tasks, and enhance your workflow through natural language instructions to Claude.

For updates and new features, check the changelog in the repository as this integration continues to evolve with regular additions to its capabilities.

Sources
[1] Available_MCP_Commands.md https://github.com/eonist/claude-talk-to-figma-mcp/blob/main/docs/Available_MCP_Commands.md
[2] GitHub - eonist/claude-talk-to-figma-mcp: A Model Context Protocol (MCP) that allows any AI agent to interact directly with Figma https://github.com/eonist/claude-talk-to-figma-mcp
[3] Figma - MCP Server - Magic Slides https://www.magicslides.app/mcps/matthewdailey-figma
[4] The MCP's Commands https://www.astro.princeton.edu/~rhl/mcp/cmds.html
[5] Talk to Figma MCP - UBOS.tech https://ubos.tech/mcp/talk-to-figma-mcp/
[6] Claude MCP Server to work with figma - GitHub https://github.com/karthiks3000/figma-mcp-server
[7] arinspunk/claude-talk-to-figma-mcp - GitHub https://github.com/arinspunk/claude-talk-to-figma-mcp
[8] `RegisterCommand` function does not return `source` variable - Cfx.re https://forum.cfx.re/t/registercommand-function-does-not-return-source-variable/5167219
[9] Unknown file extension ".ts" for a TypeScript file - Stack Overflow https://stackoverflow.com/questions/62096269/unknown-file-extension-ts-for-a-typescript-file
[10] claude-talk-to-figma-mcp on NPM https://libraries.io/npm/claude-talk-to-figma-mcp
[11] GitHub - smithery-ai/mcp-figma https://github.com/smithery-ai/mcp-figma
[12] GitHub - MatthewDailey/figma-mcp: ModelContextProtocol for Figma's REST API https://github.com/MatthewDailey/figma-mcp
[13] Converting Figma designs with Cursor MCP - YouTube https://www.youtube.com/watch?v=X-aX1TuGP0s
[14] sonnylazuardi/cursor-talk-to-figma-mcp - GitHub https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp
[15] mcp-figma/USAGE.md at main - GitHub https://github.com/smithery-ai/mcp-figma/blob/main/USAGE.md
[16] Claude Code designing in Figma with MCP server and plug-in https://www.linkedin.com/posts/sonnylazuardi_claude-code-designing-in-figma-with-mcp-server-activity-7308248516710027264-j_5K
[17] GitHub - tonycueva/claude-figma-mcp https://github.com/tonycueva/claude-figma-mcp
[18] Cursor Talk to Figma MCP Server - GenAI Works https://genai.works/mcp-servers/Cursor-Talk-to-Figma-MCP-Server
[19] Trying the Cursor talk to figma plugin - YouTube https://www.youtube.com/watch?v=8XLcOJGllcU
[20] Figma MCP Server https://mcp.so/zh/server/Figma-Context-MCP?tab=content
[21] @chrusic/todoist-mcp-server-extended https://www.npmjs.com/package/@chrusic/todoist-mcp-server-extended?activeTab=code
[22] Trying out MCP-GenUI with Figma - Sherizan https://www.sherizan.com/blog/01-figma-mcp
[23] Talk to Figma MCP server for AI agents - Playbooks https://playbooks.com/mcp/yhc984-talk-to-figma
[24] MCP - Connect your AI tool to Figma https://html.to.design/docs/mcp-tab/
[25] Introduction to MinIO Client (MC) Commands https://www.youtube.com/watch?v=pukQgDdXfqA
[26] Sonny Lazuardi's Post - LinkedIn https://www.linkedin.com/posts/sonnylazuardi_just-wanted-to-share-my-latest-experiment-activity-7307821553654657024-yrh8
[27] Talk to Figma MCP server for AI agents - Playbooks https://playbooks.com/mcp/sonnylazuardi-talk-to-figma
[28] Figma Context MCP - Claude MCP Servers https://www.claudemcp.com/servers/figma-context-mcp
[29] GitHub - Cognitive-Stack/mcphub: Embeddable Model Context Protocol (MCP)… | Cognitive Stack https://www.linkedin.com/posts/cognitive-stack_github-cognitive-stackmcphub-embeddable-activity-7317479933729984512-i3SB
[30] MCP for PMs: How To Automate Figma → Jira (Epics, Stories) in 10 ... https://www.productcompass.pm/p/mcp-case-study-jira-figma
[31] arinspunk/claude-talk-to-figma-mcp - GitHub https://github.com/arinspunk/claude-talk-to-figma-mcp
[32] Multiline text feature https://it.edu.is-best.net/?question=git-1746489518952&update=1746403200026
[33] Question - Can't register command - PaperMC https://forums.papermc.io/threads/cant-register-command.802/
[34] server.ts - angular/universal-starter - GitHub https://github.com/angular/universal-starter/blob/master/server.ts
[35] How to seperate rectangles in tkinter using the canvas function? https://stackoverflow.com/questions/51680892
[36] Issues · sonnylazuardi/cursor-talk-to-figma-mcp - GitHub https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp/issues
[37] server.ts - vivo-project/Vitro-angular - GitHub https://github.com/vivo-project/Vitro-angular/blob/main/server.ts
[38] React Drawing Basic Shapes - KendoReact - Telerik.com https://www.telerik.com/kendo-react-ui/components/drawing/basic-shapes
[39] tsup.config.ts - sonnylazuardi/cursor-talk-to-figma-mcp - GitHub https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp/blob/main/tsup.config.ts
[40] Recently Active 'rte' Questions - Page 1 - Stack Overflow https://stackoverflow.com/questions/tagged/rte?page=1&sort=Active&pageSize=%7Bpagesize%7D
[41] I want to draw rectangle with double edges in Tkinter library in python? https://stackoverflow.com/questions/46418371/i-want-to-draw-rectangle-with-double-edges-in-tkinter-library-in-python
[42] Implementation Plan for create_rectangles Feature - Education United https://en.edu.66ghz.com/?question=git-1746461047342&update=1746403200026
[43] Tcl Tk Canvas Rectangle - Tutorialspoint https://www.tutorialspoint.com/tcl-tk/tk_canvas_rectangle.htm
[44] #figma #claude #mcp #ai #claude #ai #vibecoding | 😺Juan Maguid https://www.linkedin.com/posts/temperamento_figma-claude-mcp-activity-7320462080447262720-BZ1d
[45] figma-mcp/README.md at main · MatthewDailey/figma-mcp https://github.com/MatthewDailey/figma-mcp/blob/main/README.md
[46] Building with AI - From Figma to Production - with Claude x Cursor & V0 https://www.youtube.com/watch?v=AYmV_DZf7Vw
[47] GitHub - karthiks3000/figma-mcp-server: Claude MCP Server to work with figma https://github.com/karthiks3000/figma-mcp-server
[48] Figma MCP Server https://ubos.tech/mcp/figma-mcp-server-8/
[49] Claude Code designing in Figma with MCP server and plug-in | Sonny Lazuardi https://www.linkedin.com/posts/sonnylazuardi_claude-code-designing-in-figma-with-mcp-server-activity-7308248516710027264-j_5K
[50] Claude Code 30-min Tutorial: Coding a Figma to Code Plugin https://www.youtube.com/watch?v=DAR2CPfu7oQ
[51] HTML Canvas Rectangles - W3Schools https://www.w3schools.com/graphics/canvas_rectangles.asp
[52] Claude Code designing in Figma with MCP server and plug-in https://www.youtube.com/watch?v=1L1tSwJk30Y
[53] Figma - MCP Server https://www.magicslides.app/mcps/matthewdailey-figma
[54] @hapins/figma-mcp https://www.npmjs.com/package/@hapins/figma-mcp
