import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../../clients/figma-client.js";
import { logger } from "../../../utils/logger.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers rename commands for the MCP server
 * 
 * These commands handle operations for renaming elements in Figma, including:
 * - Renaming a single layer
 * - Batch renaming multiple layers
 * - AI-assisted renaming
 * - Targeted renaming of multiple elements with individual names
 * 
 * @param {McpServer} server - The MCP server instance
 * @param {FigmaClient} figmaClient - The Figma client instance
 */
export function registerRenameCommands(server: McpServer, figmaClient: FigmaClient) {

  /**
   * Rename Layer Tool
   *
   * Renames a single Figma node with optional TextNode autoRename control.
   */
  server.tool(
    "rename_layer",
    `Rename a single node in Figma with optional TextNode autoRename.

Parameters:
  - nodeId (string, required): The ID of the node to rename.
  - newName (string, required): The new name for the node.
  - setAutoRename (boolean, optional): Whether to preserve TextNode autoRename.

Returns:
  - content: Array containing a text message with the original and new name.
    Example: { "content": [{ "type": "text", "text": "Renamed node from \"Old\" to \"New\"" }] }

Annotations:
  - title: "Rename Layer"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "nodeId": "123:456",
      "newName": "New Layer Name",
      "setAutoRename": true
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Renamed node from \"Old\" to \"New\" with autoRename enabled" }]
    }
`,
    {
      // Enforce Figma node ID format (e.g., "123:456") for validation and LLM clarity
      nodeId: z.string()
        .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
        .describe("The unique Figma node ID to rename. Must be a string in the format '123:456'."),
      // Enforce non-empty string for newName, reasonable length
      newName: z.string()
        .min(1)
        .max(100)
        .describe("The new name for the node. Must be a non-empty string up to 100 characters."),
      setAutoRename: z.boolean().optional().describe("Whether to preserve TextNode autoRename"),
    },
    async ({ nodeId, newName, setAutoRename }) => {
      try {
        // Ensure nodeId is treated as a string and validate it's not an object
        const nodeIdString = ensureNodeIdIsString(nodeId);
        logger.debug(`Renaming node with ID: ${nodeIdString} to "${newName}"`);
        
        const result = await figmaClient.executeCommand("rename_layer", {
          nodeId: nodeIdString,
          newName,
          setAutoRename
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Renamed node from "${result.originalName}" to "${result.newName}"${setAutoRename !== undefined ? ` with autoRename ${setAutoRename ? 'enabled' : 'disabled'}` : ''}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error renaming node: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Rename Layers Tool
   *
   * Renames multiple Figma layers either by assigning a new base name or through a
   * regex pattern-based replacement.
   */
  server.tool(
    "rename_layers",
    `Rename specified layers by exact name or pattern replace.

Parameters:
  - layer_ids (array, required): IDs of layers to rename.
  - new_name (string, required): New base name or pattern including tokens.
  - match_pattern (string, optional): Regex to match in existing name.
  - replace_with (string, optional): Text to replace matched pattern.

Returns:
  - content: Array containing a text message with the number of layers renamed.
    Example: { "content": [{ "type": "text", "text": "Successfully renamed 5 layers" }] }

Annotations:
  - title: "Rename Layers"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "layer_ids": ["123:456", "789:101"],
      "new_name": "BaseName",
      "match_pattern": "Old",
      "replace_with": "New"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Successfully renamed 2 layers" }]
    }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      layer_ids: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to rename. Must be a string in the format '123:456'.")
      )
      .min(1)
      .max(100)
      .describe("IDs of layers to rename. Must contain 1 to 100 items."),
      // Enforce non-empty string for new_name, reasonable length
      new_name: z.string()
        .min(1)
        .max(100)
        .describe("New base name or pattern including tokens. Must be a non-empty string up to 100 characters."),
      match_pattern: z.string().optional().describe("Regex to match in existing name"),
      replace_with: z.string().optional().describe("Text to replace matched pattern"),
    },
    async ({ layer_ids, new_name, match_pattern, replace_with }) => {
      try {
        // Ensure all layer_ids are treated as strings
        const layerIdStrings = layer_ids.map(id => ensureNodeIdIsString(id));
        logger.debug(`Renaming ${layerIdStrings.length} layers with pattern "${new_name}"`);
        
        const result = await figmaClient.executeCommand("rename_layers", {
          layer_ids: layerIdStrings,
          new_name,
          match_pattern,
          replace_with
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Successfully renamed ${result.renamed_count} layers`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error renaming layers: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * Rename Multiple Layers Tool
   *
   * Renames multiple layers with distinct new names.
   */
  server.tool(
    "rename_multiple",
    `Rename multiple layers with distinct new names.

Parameters:
  - layer_ids (array, required): Array of layer IDs to rename.
  - new_names (array, required): Array of new names corresponding to each layer ID.

Returns:
  - content: Array containing a text message with the renamed layers as JSON.

Annotations:
  - title: "Rename Multiple Layers"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "layer_ids": ["123:456", "789:101"],
      "new_names": ["Layer A", "Layer B"]
    }
  Output:
    {
      "content": [{ "type": "text", "text": "Renamed multiple layers: { ... }" }]
    }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      layer_ids: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to rename. Must be a string in the format '123:456'.")
      )
      .min(1)
      .max(100)
      .describe("Array of layer IDs to rename. Must contain 1 to 100 items."),
      // Enforce array of non-empty strings for new_names, each reasonable length
      new_names: z.array(
        z.string()
          .min(1)
          .max(100)
          .describe("A new name for a layer. Must be a non-empty string up to 100 characters.")
      )
      .min(1)
      .max(100)
      .describe("Array of new names corresponding to each layer ID. Must contain 1 to 100 items."),
    },
    async ({ layer_ids, new_names }) => {
      try {
        if (!Array.isArray(layer_ids) || !Array.isArray(new_names)) {
          throw new Error("layer_ids and new_names must be arrays");
        }
        
        if (layer_ids.length !== new_names.length) {
          throw new Error("layer_ids and new_names must be of equal length");
        }

        // Ensure all layer_ids are treated as strings
        const layerIdStrings = layer_ids.map(id => ensureNodeIdIsString(id));
        logger.debug(`Renaming ${layerIdStrings.length} layers with individual names`);
        
        const result = await figmaClient.executeCommand("rename_multiple", {
          layer_ids: layerIdStrings,
          new_names
        });
        
        return {
          content: [
            {
              type: "text",
              text: `Renamed multiple layers: ${JSON.stringify(result, null, 2)}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error renaming multiple layers: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  /**
   * AI-Powered Rename Layers Tool
   *
   * Leverages artificial intelligence to intelligently rename multiple Figma layers.
   */
  server.tool(
    "ai_rename_layers",
    `AI-powered rename of specified layers.

Parameters:
  - layer_ids (array, required): IDs of layers to rename.
  - context_prompt (string, optional): Prompt for AI renaming.

Returns:
  - content: Array containing a text message with the AI renaming results.

Annotations:
  - title: "AI Rename Layers"
  - idempotentHint: true
  - destructiveHint: false
  - readOnlyHint: false
  - openWorldHint: false

---
Usage Example:
  Input:
    {
      "layer_ids": ["123:456", "789:101"],
      "context_prompt": "Rename for clarity"
    }
  Output:
    {
      "content": [{ "type": "text", "text": "AI renaming completed successfully.\nNew names:\n- Layer 123:456: \"Header\"\n- Layer 789:101: \"Footer\"" }]
    }
`,
    {
      // Enforce array of Figma node IDs, each must match format
      layer_ids: z.array(
        z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("A Figma node ID to rename. Must be a string in the format '123:456'.")
      )
      .min(1)
      .max(100)
      .describe("IDs of layers to rename. Must contain 1 to 100 items."),
      // Enforce non-empty string for context_prompt if provided, reasonable length
      context_prompt: z.string()
        .min(1)
        .max(200)
        .optional()
        .describe("Prompt for AI renaming. If provided, must be a non-empty string up to 200 characters."),
    },
    async ({ layer_ids, context_prompt }) => {
      try {
        // Ensure all layer_ids are treated as strings
        const layerIdStrings = layer_ids.map(id => ensureNodeIdIsString(id));
        logger.debug(`AI renaming ${layerIdStrings.length} layers with prompt: "${context_prompt || 'default'}"`);
        
        const result = await figmaClient.executeCommand("ai_rename_layers", {
          layer_ids: layerIdStrings,
          context_prompt
        });
        
        // Format the success message based on the result structure
        let successMessage;
        if (result.success && result.names) {
          const formattedNames = result.names.map((name: string, index: number) => {
            return `- Layer ${layer_ids[index]}: "${name}"`;
          }).join('\n');
          
          successMessage = `AI renaming completed successfully.\nNew names:\n${formattedNames}`;
        } else {
          successMessage = `AI renaming completed with status: ${result.success ? 'success' : 'failure'}`;
        }
        
        return {
          content: [
            {
              type: "text",
              text: successMessage
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error during AI renaming: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}
