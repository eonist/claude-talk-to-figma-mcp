import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers property-manipulation-related modify commands:
 * - set_text_content
 * - set_multiple_text_contents
 */
export function registerTextContentTools(server: McpServer, figmaClient: FigmaClient) {
  // Set Text Content
  server.tool(
    "set_text_content",
    `Set the text content of an existing text node in Figma.

Parameters:
  - nodeId (string, required): The ID of the text node to update.
  - text (string, required): The new text content.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Updated text of 123:456" }] }

Annotations:
  - title: "Set Text Content"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "text": "Updated text"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Updated text of 123:456" }]
    }

Additional Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "text": "Hello, world!"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Updated text of 123:456" }]
    }

Error Handling:
  - Returns an error if nodeId is invalid or not found.
  - Returns an error if text is empty or exceeds maximum length.

Security Notes:
  - All inputs are validated and sanitized. nodeId must match the expected format (e.g., "123:456").
  - Text content is limited to 10,000 characters to prevent abuse.

Output Schema:
  {
    "content": [
      {
        "type": "text",
        "text": "Updated text of <nodeId>"
      }
    ]
  }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      text: z.string()
        .min(1)
        .max(10000)
        .describe("The new text content to set for the node. Must be a non-empty string. Maximum length 10,000 characters."),
    },
    async ({ nodeId, text }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_text_content", { nodeId: id, text });
      return { content: [{ type: "text", text: `Updated text of ${id}` }] };
    }
  );

  // Set Multiple Text Contents
  server.tool(
    "set_multiple_text_contents",
    `Set multiple text contents parallelly in a node.

Parameters:
  - nodeId (string, required): The ID of the parent node.
  - text (array, required): Array of objects with nodeId and text.

Returns:
  - content: Array containing a text message with the number of text nodes updated.
    Example: { "content": [{ "type": "text", "text": "Updated 3 text nodes" }] }

Annotations:
  - title: "Set Multiple Text Contents"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "parent:123",
      "text": [
        { "nodeId": "child:1", "text": "A" },
        { "nodeId": "child:2", "text": "B" }
      ]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Updated 2 text nodes" }]
    }

Error Handling:
  - Returns an error if any nodeId is invalid or not found.
  - Returns an error if any text is empty or exceeds maximum length.
  - Returns an error if the array is empty or exceeds 100 items.

Security Notes:
  - All inputs are validated and sanitized. All nodeIds must match the expected format.
  - Text content is limited to 10,000 characters per node and 100 nodes per call.

Output Schema:
  {
    "content": [
      {
        "type": "text",
        "text": "Updated <N> text nodes"
      }
    ]
  }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma parent node ID. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      text: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .describe("The unique Figma child text node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
          text: z.string()
            .min(1)
            .max(10000)
            .describe("The new text content to set for the child node. Must be a non-empty string. Maximum length 10,000 characters."),
        })
      )
      .min(1)
      .max(100)
      .describe("Array of objects specifying nodeId and text for each child text node to update. Must contain 1 to 100 items."),
    },
    async ({ nodeId, text }) => {
      const parent = ensureNodeIdIsString(nodeId);
      const payload = text.map(t => ({ nodeId: ensureNodeIdIsString(t.nodeId), text: t.text }));
      await figmaClient.executeCommand("set_multiple_text_contents", { nodeId: parent, text: payload });
      return { content: [{ type: "text", text: `Updated ${payload.length} text nodes` }] };
    }
  );
}
