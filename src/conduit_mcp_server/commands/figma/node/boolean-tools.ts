/**
 * Registers boolean operation tools on the MCP server for Figma node manipulation.
 * 
 * This function adds a unified boolean operation tool that supports union, subtract, 
 * intersect, and exclude operations on vector nodes in Figma. The tool validates 
 * input parameters, executes the corresponding Figma API commands, and returns 
 * structured results with success/error information.
 * 
 * @param {McpServer} server - The MCP server instance to register the boolean tools on
 * @param {FigmaClient} figmaClient - The Figma client instance used to communicate with the Figma API
 * 
 * @returns {void} This function has no return value but registers the tools asynchronously
 * 
 * @throws {Error} Throws an error if the server or figmaClient parameters are invalid
 * 
 * @example
 * ```
 * const server = new McpServer();
 * const figmaClient = new FigmaClient(apiKey);
 * registerBooleanTools(server, figmaClient);
 * ```
 * 
 * @since 1.0.0
 * @see {@link https://www.figma.com/developers/api#boolean-operations} Figma Boolean Operations API
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { BooleanSchema } from "./schema/boolean-schema.js";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./schema/node-ids-schema.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers boolean operation commands on the MCP server.
 *
 * This function adds tools for flattening selections and performing boolean operations
 * such as union, subtract, intersect, and exclude on nodes in Figma. It validates inputs,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerBooleanTools(server, figmaClient);
 */
export function registerBooleanTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified Boolean Operation Tool
  server.tool(
    MCP_COMMANDS.BOOLEAN,
    `Perform boolean operations (union, subtract, intersect, exclude) on Figma nodes.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the result.
`,
    BooleanSchema,
    {
      title: "Boolean Operation",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { operation: "union", nodeIds: ["123:456", "789:101"] },
        { operation: "subtract", nodeIds: ["123:456", "789:101"] },
        { operation: "intersect", nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "At least two nodeIds are required for boolean operations.",
        "All nodeIds must be valid and belong to the same parent.",
        "Boolean operations change z-order and shape.",
        "Only nodes that support boolean operations are valid."
      ],
      extraInfo: "Boolean operations are useful for combining or subtracting shapes in vector editing."
    },
    async ({ operation, nodeIds }) => {
      const ids = (nodeIds && nodeIds.length) ? nodeIds.map(ensureNodeIdIsString) : [];
      if (ids.length < 2) {
        const response = {
          success: false,
          error: {
            message: "At least two nodeIds are required for boolean operations.",
            results: [],
            meta: {
              operation: "boolean",
              params: { operation, nodeIds }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      try {
        await figmaClient.executeCommand(MCP_COMMANDS.BOOLEAN, { operation, nodeIds: ids });
        const response = {
          success: true,
          results: [{
            nodeIds: ids,
            operation,
            success: true
          }]
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [{
              nodeIds: ids,
              operation,
              success: false,
              error: error instanceof Error ? error.message : String(error),
              meta: {
                operation: "boolean",
                params: { operation, nodeIds }
              }
            }],
            meta: {
              operation: "boolean",
              params: { operation, nodeIds }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
    }
  );
}
