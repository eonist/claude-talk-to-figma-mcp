import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { handleToolError } from "../../../utils/error-handling.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers the unified batch/single component creation tool on the MCP server.
 *
 * This function adds a tool named "create_components_from_nodes" to the MCP server,
 * enabling conversion of one or more Figma nodes into reusable components.
 * It validates input, executes the corresponding Figma command for each node, and returns the results.
 *
 * @param {McpServer} server - The MCP server instance to register the tool on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tool asynchronously.
 *
 * @example
 * registerNodeTools(server, figmaClient);
 */
export function registerNodeTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.CREATE_COMPONENTS_FROM_NODE,
    `Converts one or more existing nodes into components in Figma.

Returns:
  - content: Array of objects. Each object contains:
      - type: "text"
      - text: JSON string with created component IDs and any errors.
`,
    {
      entry: z
        .object({
          nodeId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (e.g., '123:456')" }),
          maintain_position: z.boolean().optional(),
        })
        .optional(),
      entries: z
        .array(
          z.object({
            nodeId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID (e.g., '123:456')" }),
            maintain_position: z.boolean().optional(),
          })
        )
        .optional(),
      skip_errors: z.boolean().optional(),
    },
    {
      title: "Create Components From Node(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entry: { nodeId: "123:456" } },
        { entries: [{ nodeId: "123:456" }, { nodeId: "789:101", maintain_position: true }], skip_errors: true }
      ]),
      edgeCaseWarnings: [
        "Each nodeId must be a valid Figma node ID.",
        "If a node is not convertible, the command will fail unless skip_errors is true.",
        "Nodes must not already be components."
      ],
      extraInfo: "Converts one or more nodes into reusable components for design systems. Supports both single and batch input."
    },
    async ({ entry, entries, skip_errors }): Promise<any> => {
      // Normalize to array of entries
      const nodeEntries =
        Array.isArray(entries) && entries.length > 0
          ? entries
          : entry
          ? [entry]
          : [];

      const results: Array<{ nodeId: string; componentId?: string; success: boolean; error?: string; meta?: any }> = [];
      for (const node of nodeEntries) {
        try {
          const id = ensureNodeIdIsString(node.nodeId);
          const result = await figmaClient.executeCommand(MCP_COMMANDS.CREATE_COMPONENTS_FROM_NODE, {
            entry: { nodeId: id, maintain_position: node.maintain_position }
          });
          results.push({
            nodeId: id,
            componentId: result.componentId || (Array.isArray(result) && result[0]?.componentId),
            success: true
          });
        } catch (err: any) {
          if (skip_errors) {
            results.push({
              nodeId: node.nodeId,
              success: false,
              error: err instanceof Error ? err.message : String(err),
              meta: {
                operation: "create_components_from_nodes",
                params: node
              }
            });
            continue;
          }
          // If not skipping errors, fail immediately
          return handleToolError(err, "component-creation-tools", "create_components_from_nodes") as any;
        }
      }
      const anySuccess = results.some(r => r.success);
      let response;
      if (anySuccess) {
        response = { success: true, results };
      } else {
        response = {
          success: false,
          error: {
            message: "All create_components_from_nodes operations failed",
            results,
            meta: {
              operation: "create_components_from_nodes",
              params: nodeEntries
            }
          }
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    }
  );
}
