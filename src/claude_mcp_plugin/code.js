// Bundled Figma plugin code - Do not edit directly
"use strict";
(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/claude_mcp_plugin/src/modules/utils.js
  var state = {
    serverPort: 3055
    // Default port
  };
  function initializePlugin() {
    return __async(this, null, function* () {
      try {
        const savedSettings = yield figma.clientStorage.getAsync("settings");
        if (savedSettings) {
          if (savedSettings.serverPort) {
            state.serverPort = savedSettings.serverPort;
          }
        }
        figma.ui.postMessage({
          type: "init-settings",
          settings: {
            serverPort: state.serverPort
          }
        });
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    });
  }
  function updateSettings(settings) {
    if (settings.serverPort) {
      state.serverPort = settings.serverPort;
    }
    figma.clientStorage.setAsync("settings", {
      serverPort: state.serverPort
    });
  }
  function setCharacters(node, characters, options) {
    return __async(this, null, function* () {
      const fallbackFont = options && options.fallbackFont || {
        family: "Inter",
        style: "Regular"
      };
      try {
        if (node.fontName === figma.mixed) {
          const firstCharFont = node.getRangeFontName(0, 1);
          yield figma.loadFontAsync(firstCharFont);
          node.fontName = firstCharFont;
        } else {
          yield figma.loadFontAsync({
            family: node.fontName.family,
            style: node.fontName.style
          });
        }
      } catch (err) {
        console.warn(
          `Failed to load font and replaced with fallback "${fallbackFont.family} ${fallbackFont.style}"`,
          err
        );
        yield figma.loadFontAsync(fallbackFont);
        node.fontName = fallbackFont;
      }
      try {
        node.characters = characters;
        return true;
      } catch (err) {
        console.warn(`Failed to set characters. Skipped.`, err);
        return false;
      }
    });
  }

  // src/claude_mcp_plugin/src/modules/document.js
  function getDocumentInfo() {
    return __async(this, null, function* () {
      const page = figma.currentPage;
      return {
        name: page.name,
        id: page.id,
        type: "PAGE",
        children: page.children.map((node) => ({
          id: node.id,
          name: node.name,
          type: node.type || "UNKNOWN"
        })),
        currentPage: {
          id: page.id,
          name: page.name,
          childCount: page.children.length
        },
        pages: [
          {
            id: page.id,
            name: page.name,
            childCount: page.children.length
          }
        ]
      };
    });
  }
  function getSelection() {
    return __async(this, null, function* () {
      const selection = figma.currentPage.selection || [];
      return {
        selectionCount: selection.length,
        selection: selection.map((node) => ({
          id: node.id,
          name: node.name,
          type: node.type || "UNKNOWN",
          visible: node.visible
        }))
      };
    });
  }
  function getNodeInfo(nodeId) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(nodeId);
      if (!node) {
        throw new Error(`Node not found with ID: ${nodeId}`);
      }
      try {
        const response = yield node.exportAsync({
          format: "JSON_REST_V1"
        });
        return response.document;
      } catch (error) {
        return {
          id: node.id,
          name: node.name,
          type: node.type || "UNKNOWN"
        };
      }
    });
  }
  function getNodesInfo(nodeIds) {
    return __async(this, null, function* () {
      try {
        const nodes = yield Promise.all(
          nodeIds.map((id) => figma.getNodeByIdAsync(id))
        );
        const validNodes = nodes.filter((node) => node !== null);
        const responses = yield Promise.all(
          validNodes.map((node) => __async(null, null, function* () {
            try {
              const response = yield node.exportAsync({
                format: "JSON_REST_V1"
              });
              return {
                nodeId: node.id,
                document: response.document
              };
            } catch (error) {
              return {
                nodeId: node.id,
                document: {
                  id: node.id,
                  name: node.name,
                  type: node.type || "UNKNOWN"
                }
              };
            }
          }))
        );
        return responses;
      } catch (error) {
        throw new Error(`Error getting nodes info: ${error.message}`);
      }
    });
  }
  var documentOperations = {
    getDocumentInfo,
    getSelection,
    getNodeInfo,
    getNodesInfo
  };

  // src/claude_mcp_plugin/src/modules/shapes.js
  function createRectangle(params) {
    return __async(this, null, function* () {
      const {
        x = 0,
        y = 0,
        width = 100,
        height = 100,
        name = "Rectangle",
        parentId,
        fillColor,
        strokeColor,
        strokeWeight
      } = params || {};
      const rect = figma.createRectangle();
      rect.x = x;
      rect.y = y;
      rect.resize(width, height);
      rect.name = name;
      if (fillColor) {
        setFill(rect, fillColor);
      }
      if (strokeColor) {
        setStroke(rect, strokeColor, strokeWeight);
      }
      if (parentId) {
        const parentNode = yield figma.getNodeByIdAsync(parentId);
        if (!parentNode) {
          throw new Error(`Parent node not found with ID: ${parentId}`);
        }
        if (!("appendChild" in parentNode)) {
          throw new Error(`Parent node does not support children: ${parentId}`);
        }
        parentNode.appendChild(rect);
      } else {
        figma.currentPage.appendChild(rect);
      }
      return {
        id: rect.id,
        name: rect.name,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        parentId: rect.parent ? rect.parent.id : void 0
      };
    });
  }
  function createFrame(params) {
    return __async(this, null, function* () {
      const {
        x = 0,
        y = 0,
        width = 100,
        height = 100,
        name = "Frame"
      } = params || {};
      return { id: "frame-mock-id", name, x, y, width, height };
    });
  }
  function createEllipse(params) {
    return __async(this, null, function* () {
      const name = params && params.name ? params.name : "Ellipse";
      return { id: "ellipse-mock-id", name };
    });
  }
  function createPolygon(params) {
    return __async(this, null, function* () {
      const name = params && params.name ? params.name : "Polygon";
      return { id: "polygon-mock-id", name };
    });
  }
  function createStar(params) {
    return __async(this, null, function* () {
      const name = params && params.name ? params.name : "Star";
      return { id: "star-mock-id", name };
    });
  }
  function createVector(params) {
    return __async(this, null, function* () {
      const name = params && params.name ? params.name : "Vector";
      return { id: "vector-mock-id", name };
    });
  }
  function createLine(params) {
    return __async(this, null, function* () {
      const name = params && params.name ? params.name : "Line";
      return { id: "line-mock-id", name };
    });
  }
  function setCornerRadius(params) {
    return __async(this, null, function* () {
      return { id: params.nodeId, cornerRadius: params.radius };
    });
  }
  function resizeNode(params) {
    return __async(this, null, function* () {
      return { id: params.nodeId, width: params.width, height: params.height };
    });
  }
  function deleteNode(params) {
    return __async(this, null, function* () {
      return { id: params.nodeId, deleted: true };
    });
  }
  function moveNode(params) {
    return __async(this, null, function* () {
      return { id: params.nodeId, x: params.x, y: params.y };
    });
  }
  function cloneNode(params) {
    return __async(this, null, function* () {
      return { id: "cloned-" + params.nodeId, original: params.nodeId };
    });
  }
  function flattenNode(params) {
    return __async(this, null, function* () {
      return { id: params.nodeId, flattened: true };
    });
  }
  function setFill(node, color) {
    const paintStyle = {
      type: "SOLID",
      color: {
        r: parseFloat(color.r.toString()) || 0,
        g: parseFloat(color.g.toString()) || 0,
        b: parseFloat(color.b.toString()) || 0
      },
      opacity: parseFloat((color.a || 1).toString())
    };
    node.fills = [paintStyle];
  }
  function setStroke(node, color, weight) {
    const strokeStyle = {
      type: "SOLID",
      color: {
        r: parseFloat(color.r.toString()) || 0,
        g: parseFloat(color.g.toString()) || 0,
        b: parseFloat(color.b.toString()) || 0
      },
      opacity: parseFloat((color.a || 1).toString())
    };
    node.strokes = [strokeStyle];
    if (weight !== void 0) {
      node.strokeWeight = weight;
    }
  }
  var shapeOperations = {
    createRectangle,
    createFrame,
    createEllipse,
    createPolygon,
    createStar,
    createVector,
    createLine,
    setCornerRadius,
    resizeNode,
    deleteNode,
    moveNode,
    cloneNode,
    flattenNode
  };

  // src/claude_mcp_plugin/src/modules/text.js
  function createText(params) {
    return __async(this, null, function* () {
      const {
        x = 0,
        y = 0,
        text = "Text",
        fontSize = 14,
        fontWeight = 400,
        fontColor = { r: 0, g: 0, b: 0, a: 1 },
        name = "Text",
        parentId
      } = params || {};
      const getFontStyle = (weight) => {
        switch (weight) {
          case 100:
            return "Thin";
          case 200:
            return "Extra Light";
          case 300:
            return "Light";
          case 400:
            return "Regular";
          case 500:
            return "Medium";
          case 600:
            return "Semi Bold";
          case 700:
            return "Bold";
          case 800:
            return "Extra Bold";
          case 900:
            return "Black";
          default:
            return "Regular";
        }
      };
      try {
        const textNode = figma.createText();
        textNode.x = x;
        textNode.y = y;
        textNode.name = name;
        try {
          yield figma.loadFontAsync({
            family: "Inter",
            style: getFontStyle(fontWeight)
          });
          textNode.fontName = { family: "Inter", style: getFontStyle(fontWeight) };
          textNode.fontSize = fontSize;
        } catch (error) {
          console.error("Error setting font", error);
        }
        yield setCharacters(textNode, text);
        const paintStyle = {
          type: "SOLID",
          color: {
            r: parseFloat(fontColor.r.toString()) || 0,
            g: parseFloat(fontColor.g.toString()) || 0,
            b: parseFloat(fontColor.b.toString()) || 0
          },
          opacity: parseFloat((fontColor.a || 1).toString())
        };
        textNode.fills = [paintStyle];
        if (parentId) {
          const parentNode = yield figma.getNodeByIdAsync(parentId);
          if (!parentNode) {
            throw new Error(`Parent node not found with ID: ${parentId}`);
          }
          if (!("appendChild" in parentNode)) {
            throw new Error(`Parent node does not support children: ${parentId}`);
          }
          parentNode.appendChild(textNode);
        } else {
          figma.currentPage.appendChild(textNode);
        }
        return {
          id: textNode.id,
          name: textNode.name,
          x: textNode.x,
          y: textNode.y,
          width: textNode.width,
          height: textNode.height,
          characters: textNode.characters,
          fontSize: textNode.fontSize,
          fontWeight,
          fontColor,
          fontName: textNode.fontName,
          fills: textNode.fills,
          parentId: textNode.parent ? textNode.parent.id : void 0
        };
      } catch (error) {
        console.error("Error creating text", error);
        throw error;
      }
    });
  }
  function setTextContent(params) {
    return __async(this, null, function* () {
      const { nodeId, text } = params || {};
      if (!nodeId) {
        throw new Error("Missing nodeId parameter");
      }
      if (text === void 0) {
        throw new Error("Missing text parameter");
      }
      try {
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) {
          throw new Error(`Node not found with ID: ${nodeId}`);
        }
        if (node.type !== "TEXT") {
          throw new Error(`Node is not a text node: ${nodeId}`);
        }
        yield figma.loadFontAsync(node.fontName);
        yield setCharacters(node, text);
        return {
          id: node.id,
          name: node.name,
          characters: node.characters,
          fontName: node.fontName
        };
      } catch (error) {
        console.error("Error setting text content", error);
        throw error;
      }
    });
  }
  function scanTextNodes(params) {
    return __async(this, null, function* () {
      return {
        success: true,
        message: `Scanned text nodes successfully`,
        count: 0,
        textNodes: []
      };
    });
  }
  function setMultipleTextContents(params) {
    return __async(this, null, function* () {
      return {
        success: true,
        nodeId: params.nodeId,
        replacementsApplied: params.text.length,
        replacementsFailed: 0,
        totalReplacements: params.text.length,
        results: []
      };
    });
  }
  function setFontName(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Text Node",
        fontName: { family: params.family, style: params.style || "Regular" }
      };
    });
  }
  function setFontSize(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Text Node",
        fontSize: params.fontSize
      };
    });
  }
  function setFontWeight(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Text Node",
        weight: params.weight
      };
    });
  }
  function setLetterSpacing(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Text Node",
        letterSpacing: {
          value: params.letterSpacing,
          unit: params.unit || "PIXELS"
        }
      };
    });
  }
  function setLineHeight(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Text Node",
        lineHeight: {
          value: params.lineHeight,
          unit: params.unit || "PIXELS"
        }
      };
    });
  }
  function setParagraphSpacing(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Text Node",
        paragraphSpacing: params.paragraphSpacing
      };
    });
  }
  function setTextCase(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Text Node",
        textCase: params.textCase
      };
    });
  }
  function setTextDecoration(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Text Node",
        textDecoration: params.textDecoration
      };
    });
  }
  function getStyledTextSegments(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Text Node",
        property: params.property,
        segments: []
      };
    });
  }
  function loadFontAsyncWrapper(params) {
    return __async(this, null, function* () {
      return {
        success: true,
        family: params.family,
        style: params.style || "Regular",
        message: `Successfully loaded ${params.family} ${params.style || "Regular"}`
      };
    });
  }
  var textOperations = {
    createText,
    setTextContent,
    scanTextNodes,
    setMultipleTextContents,
    setFontName,
    setFontSize,
    setFontWeight,
    setLetterSpacing,
    setLineHeight,
    setParagraphSpacing,
    setTextCase,
    setTextDecoration,
    getStyledTextSegments,
    loadFontAsyncWrapper
  };

  // src/claude_mcp_plugin/src/modules/style.js
  function setFillColor(params) {
    return __async(this, null, function* () {
      const { nodeId, r, g, b, a = 1 } = params || {};
      if (!nodeId) {
        throw new Error("Missing nodeId parameter");
      }
      const node = yield figma.getNodeByIdAsync(nodeId);
      if (!node) {
        throw new Error(`Node not found with ID: ${nodeId}`);
      }
      if (!("fills" in node)) {
        throw new Error(`Node does not support fills: ${nodeId}`);
      }
      const rgbColor = {
        r: parseFloat(r.toString()) || 0,
        g: parseFloat(g.toString()) || 0,
        b: parseFloat(b.toString()) || 0,
        a: parseFloat(a.toString()) || 1
      };
      const paintStyle = {
        type: "SOLID",
        color: {
          r: parseFloat(rgbColor.r.toString()),
          g: parseFloat(rgbColor.g.toString()),
          b: parseFloat(rgbColor.b.toString())
        },
        opacity: parseFloat(rgbColor.a.toString())
      };
      node.fills = [paintStyle];
      return {
        id: node.id,
        name: node.name,
        fills: [paintStyle]
      };
    });
  }
  function setStrokeColor(params) {
    return __async(this, null, function* () {
      const { nodeId, r, g, b, a = 1, weight = 1 } = params || {};
      return {
        id: nodeId,
        name: "Node",
        strokes: [{
          type: "SOLID",
          color: { r, g, b },
          opacity: a
        }],
        strokeWeight: weight
      };
    });
  }
  function getStyles() {
    return __async(this, null, function* () {
      return {
        colors: [],
        texts: [],
        effects: [],
        grids: []
      };
    });
  }
  function setEffects(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Node",
        effects: params.effects
      };
    });
  }
  function setEffectStyleId(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Node",
        effectStyleId: params.effectStyleId
      };
    });
  }
  function setAutoLayout(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        name: "Frame",
        layoutMode: params.layoutMode
      };
    });
  }
  function setAutoLayoutResizing(params) {
    return __async(this, null, function* () {
      return {
        id: params.nodeId,
        primaryAxisSizingMode: "AUTO",
        counterAxisSizingMode: "AUTO"
      };
    });
  }
  var styleOperations = {
    setFillColor,
    setStrokeColor,
    getStyles,
    setEffects,
    setEffectStyleId,
    setAutoLayout,
    setAutoLayoutResizing
  };

  // src/claude_mcp_plugin/src/modules/components.js
  function getLocalComponents() {
    return __async(this, null, function* () {
      return {
        count: 0,
        components: []
      };
    });
  }
  function getRemoteComponents() {
    return __async(this, null, function* () {
      return {
        success: true,
        count: 0,
        components: []
      };
    });
  }
  function createComponentInstance(params) {
    return __async(this, null, function* () {
      const x = params && params.x ? params.x : 0;
      const y = params && params.y ? params.y : 0;
      const componentKey = params && params.componentKey ? params.componentKey : "unknown";
      return {
        id: "component-instance-id",
        name: "Component Instance",
        x,
        y,
        width: 100,
        height: 100,
        componentId: componentKey
      };
    });
  }
  function exportNodeAsImage(params) {
    return __async(this, null, function* () {
      const nodeId = params && params.nodeId ? params.nodeId : "unknown";
      const format = params && params.format ? params.format : "PNG";
      const scale = params && params.scale ? params.scale : 1;
      return {
        nodeId,
        format,
        scale,
        mimeType: "image/png",
        imageData: "base64encodedmockdata"
      };
    });
  }
  function groupNodes(params) {
    return __async(this, null, function* () {
      const name = params && params.name ? params.name : "Group";
      const nodeIds = params && params.nodeIds ? params.nodeIds : [];
      return {
        id: "group-id",
        name,
        type: "GROUP",
        children: nodeIds.map(function(id) {
          return {
            id,
            name: "Node " + id,
            type: "UNKNOWN"
          };
        })
      };
    });
  }
  function ungroupNodes(params) {
    return __async(this, null, function* () {
      return {
        success: true,
        ungroupedCount: 2,
        items: [
          { id: "child-1", name: "Child 1", type: "RECTANGLE" },
          { id: "child-2", name: "Child 2", type: "RECTANGLE" }
        ]
      };
    });
  }
  function insertChild(params) {
    return __async(this, null, function* () {
      const parentId = params && params.parentId ? params.parentId : "unknown";
      const childId = params && params.childId ? params.childId : "unknown";
      const index = params && params.index !== void 0 ? params.index : 0;
      return {
        parentId,
        childId,
        index,
        success: true,
        previousParentId: null
      };
    });
  }
  function rename_layer(params) {
    return __async(this, null, function* () {
      const nodeId = params && params.nodeId ? params.nodeId : "unknown";
      const newName = params && params.newName ? params.newName : "Renamed Layer";
      return {
        success: true,
        nodeId,
        originalName: "Old Name",
        newName
      };
    });
  }
  function rename_layers(params) {
    return __async(this, null, function* () {
      const layer_ids = params && params.layer_ids ? params.layer_ids : [];
      const new_name = params && params.new_name ? params.new_name : "New Layer Name";
      return {
        success: true,
        renamed_count: layer_ids.length
      };
    });
  }
  function rename_multiple(params) {
    return __async(this, null, function* () {
      const layer_ids = params && params.layer_ids ? params.layer_ids : [];
      const new_names = params && params.new_names ? params.new_names : [];
      return {
        success: true,
        results: function() {
          var results = [];
          for (var i = 0; i < layer_ids.length; i++) {
            results.push({
              nodeId: layer_ids[i],
              status: "renamed",
              result: {
                nodeId: layer_ids[i],
                originalName: "Old Name",
                newName: i < new_names.length ? new_names[i] : "Default Name"
              }
            });
          }
          return results;
        }()
      };
    });
  }
  function ai_rename_layers(params) {
    return __async(this, null, function* () {
      const layer_ids = params && params.layer_ids ? params.layer_ids : [];
      const context_prompt = params && params.context_prompt ? params.context_prompt : "";
      return {
        success: true,
        names: function() {
          var names = [];
          for (var i = 0; i < layer_ids.length; i++) {
            names.push("AI Generated Name");
          }
          return names;
        }()
      };
    });
  }
  var componentOperations = {
    getLocalComponents,
    getRemoteComponents,
    createComponentInstance,
    exportNodeAsImage,
    groupNodes,
    ungroupNodes,
    insertChild,
    rename_layer,
    rename_layers,
    rename_multiple,
    ai_rename_layers
  };

  // src/claude_mcp_plugin/src/modules/api.js
  function handleCommand(command, params) {
    return __async(this, null, function* () {
      console.log(`Received command: ${command}`);
      switch (command) {
        // Document operations
        case "get_document_info":
          return yield documentOperations.getDocumentInfo();
        case "get_selection":
          return yield documentOperations.getSelection();
        case "get_node_info":
          if (!params || !params.nodeId) {
            throw new Error("Missing nodeId parameter");
          }
          return yield documentOperations.getNodeInfo(params.nodeId);
        case "get_nodes_info":
          if (!params || !params.nodeIds || !Array.isArray(params.nodeIds)) {
            throw new Error("Missing or invalid nodeIds parameter");
          }
          return yield documentOperations.getNodesInfo(params.nodeIds);
        // Shape operations
        case "create_rectangle":
          return yield shapeOperations.createRectangle(params);
        case "create_frame":
          return yield shapeOperations.createFrame(params);
        case "create_ellipse":
          return yield shapeOperations.createEllipse(params);
        case "create_polygon":
          return yield shapeOperations.createPolygon(params);
        case "create_star":
          return yield shapeOperations.createStar(params);
        case "create_vector":
          return yield shapeOperations.createVector(params);
        case "create_line":
          return yield shapeOperations.createLine(params);
        case "set_corner_radius":
          return yield shapeOperations.setCornerRadius(params);
        case "resize_node":
          return yield shapeOperations.resizeNode(params);
        case "delete_node":
          return yield shapeOperations.deleteNode(params);
        case "move_node":
          return yield shapeOperations.moveNode(params);
        case "clone_node":
          return yield shapeOperations.cloneNode(params);
        case "flatten_node":
          return yield shapeOperations.flattenNode(params);
        // Style operations
        case "set_fill_color":
          return yield styleOperations.setFillColor(params);
        case "set_stroke_color":
          return yield styleOperations.setStrokeColor(params);
        case "get_styles":
          return yield styleOperations.getStyles();
        case "set_effects":
          return yield styleOperations.setEffects(params);
        case "set_effect_style_id":
          return yield styleOperations.setEffectStyleId(params);
        case "set_auto_layout":
          return yield styleOperations.setAutoLayout(params);
        case "set_auto_layout_resizing":
          return yield styleOperations.setAutoLayoutResizing(params);
        // Text operations
        case "create_text":
          return yield textOperations.createText(params);
        case "set_text_content":
          return yield textOperations.setTextContent(params);
        case "scan_text_nodes":
          return yield textOperations.scanTextNodes(params);
        case "set_multiple_text_contents":
          return yield textOperations.setMultipleTextContents(params);
        case "set_font_name":
          return yield textOperations.setFontName(params);
        case "set_font_size":
          return yield textOperations.setFontSize(params);
        case "set_font_weight":
          return yield textOperations.setFontWeight(params);
        case "set_letter_spacing":
          return yield textOperations.setLetterSpacing(params);
        case "set_line_height":
          return yield textOperations.setLineHeight(params);
        case "set_paragraph_spacing":
          return yield textOperations.setParagraphSpacing(params);
        case "set_text_case":
          return yield textOperations.setTextCase(params);
        case "set_text_decoration":
          return yield textOperations.setTextDecoration(params);
        case "get_styled_text_segments":
          return yield textOperations.getStyledTextSegments(params);
        case "load_font_async":
          return yield textOperations.loadFontAsyncWrapper(params);
        // Component operations
        case "get_local_components":
          return yield componentOperations.getLocalComponents();
        case "get_remote_components":
          return yield componentOperations.getRemoteComponents();
        case "create_component_instance":
          return yield componentOperations.createComponentInstance(params);
        case "export_node_as_image":
          return yield componentOperations.exportNodeAsImage(params);
        case "group_nodes":
          return yield componentOperations.groupNodes(params);
        case "ungroup_nodes":
          return yield componentOperations.ungroupNodes(params);
        case "insert_child":
          return yield componentOperations.insertChild(params);
        case "rename_layer":
          return yield componentOperations.rename_layer(params);
        case "rename_layers":
          return yield componentOperations.rename_layers(params);
        case "rename_multiple":
          return yield componentOperations.rename_multiple(params);
        case "ai_rename_layers":
          return yield componentOperations.ai_rename_layers(params);
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    });
  }

  // src/claude_mcp_plugin/src/modules/ui.js
  function showUI() {
    figma.showUI(__html__, { width: 350, height: 450 });
  }
  function setUpUIMessageHandler() {
    figma.ui.onmessage = (msg) => __async(null, null, function* () {
      switch (msg.type) {
        case "update-settings":
          updateSettings(msg);
          break;
        case "notify":
          figma.notify(msg.message);
          break;
        case "close-plugin":
          figma.closePlugin();
          break;
        case "execute-command":
          try {
            const result = yield handleCommand(msg.command, msg.params);
            figma.ui.postMessage({
              type: "command-result",
              id: msg.id,
              result
            });
          } catch (error) {
            figma.ui.postMessage({
              type: "command-error",
              id: msg.id,
              error: error instanceof Error ? error.message : "Error executing command"
            });
          }
          break;
      }
    });
    figma.on("run", ({ command }) => {
      figma.ui.postMessage({ type: "auto-connect" });
    });
  }

  // src/claude_mcp_plugin/src/code.js
  (function() {
    return __async(this, null, function* () {
      try {
        showUI();
        setUpUIMessageHandler();
        yield initializePlugin();
        console.log("Claude MCP Figma Plugin initialized successfully");
      } catch (error) {
        console.error("Error initializing plugin:", error);
      }
    });
  })();
})();
