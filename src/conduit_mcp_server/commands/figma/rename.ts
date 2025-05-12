import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FigmaClient } from "../../clients/figma-client.js";
import { logger } from "../../utils/logger.js";
import { ensureNodeIdIsString } from "../../utils/node-utils.js";

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
    "Rename a single node in Figma with optional TextNode autoRename",
    {
      nodeId: z.string().describe("The ID of the node to rename"),
      newName: z.string().describe("The new name for the node"),
      setAutoRename: z.boolean().optional().describe("Whether to preserve TextNode autoRename")
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
    "Rename specified layers by exact name or pattern replace",
    {
      layer_ids: z.array(z.string()).describe("IDs of layers to rename"),
      new_name: z.string().describe("New base name or pattern including tokens"),
      match_pattern: z.string().optional().describe("Regex to match in existing name"),
      replace_with: z.string().optional().describe("Text to replace matched pattern")
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
    "Rename multiple layers with distinct new names",
    {
      layer_ids: z.array(z.string()).describe("Array of layer IDs to rename"),
      new_names: z.array(z.string()).describe("Array of new names corresponding to each layer ID")
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
    "AI-powered rename of specified layers",
    {
      layer_ids: z.array(z.string()).describe("IDs of layers to rename"),
      context_prompt: z.string().optional().describe("Prompt for AI renaming")
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
