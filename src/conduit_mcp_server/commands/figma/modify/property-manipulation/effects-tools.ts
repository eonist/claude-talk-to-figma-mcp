import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers property-manipulation-related modify commands:
 * - set_effects
 * - set_effect_style_id
 */
export function registerEffectsTools(server: McpServer, figmaClient: FigmaClient) {
  // Set Effects
  server.tool(
    "set_effects",
    `Set visual effects of a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node.
  - effects (array, required): Array of effect objects.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Effects set for 123:456" }] }

Annotations:
  - title: "Set Effects"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "effects": [{ "type": "DROP_SHADOW", "color": "#000000" }]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Effects set for 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      effects: z.array(z.any())
        .min(1)
        .max(20)
        .describe("Array of effect objects to apply. Must contain 1 to 20 items. Each effect object should match Figma's effect schema."),
    },
    async ({ nodeId, effects }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_effects", { nodeId: id, effects });
      return { content: [{ type: "text", text: `Effects set for ${id}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "effects": [{ "type": "DROP_SHADOW", "color": "#000000" }]
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Effects set for 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if effects array is empty or exceeds 20 items.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - effects array is limited to 20 items.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Effects set for <nodeId>"
          }
        ]
      }
    */
  );

  // Set Effect Style ID
  server.tool(
    "set_effect_style_id",
    `Apply an effect style to a node in Figma.

Parameters:
  - nodeId (string, required): The ID of the node.
  - effectStyleId (string, required): The ID of the effect style to apply.

Returns:
  - content: Array containing a text message with the updated node's ID.
    Example: { "content": [{ "type": "text", "text": "Effect style applied to 123:456" }] }

Annotations:
  - title: "Set Effect Style ID"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "effectStyleId": "effect:789"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Effect style applied to 123:456" }]
    }
`,
    {
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to update. Must be a string in the format '123:456' or a complex instance ID like 'I422:10713;1082:2236'."),
      effectStyleId: z.string()
        .min(1)
        .max(100)
        .describe("The ID of the effect style to apply. Must be a non-empty string. Maximum length 100 characters."),
    },
    async ({ nodeId, effectStyleId }) => {
      const id = ensureNodeIdIsString(nodeId);
      await figmaClient.executeCommand("set_effect_style_id", { nodeId: id, effectStyleId });
      return { content: [{ type: "text", text: `Effect style applied to ${id}` }] };
    }
    /*
    Additional Usage Example:
      Input:
        {
          "nodeId": "123:456",
          "effectStyleId": "effect:789"
        }
      Output:
        {
          "content": [{ "type": "text", "text": "Effect style applied to 123:456" }]
        }

    Error Handling:
      - Returns an error if nodeId is invalid or not found.
      - Returns an error if effectStyleId is empty or exceeds maximum length.

    Security Notes:
      - All inputs are validated and sanitized. nodeId must match the expected format.
      - effectStyleId is limited to 100 characters.

    Output Schema:
      {
        "content": [
          {
            "type": "text",
            "text": "Effect style applied to <nodeId>"
          }
        ]
      }
    */
  );
}
