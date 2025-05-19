import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

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

Parameters:
  - operation (string, required): One of "union", "subtract", "intersect", "exclude".
  - selection (boolean, optional): If true, use the current selection in Figma.
  - nodeId (string, optional): Single node ID.
  - nodeIds (array of string, optional): Multiple node IDs (min 2).

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the result.
`,
    {
      operation: z.enum(["union", "subtract", "intersect", "exclude"]),
      selection: z.boolean().optional(),
      nodeId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID." }).optional(),
      nodeIds: NodeIdsArraySchema(1, 100).optional(),
    },
    {
      title: "Boolean Operation",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { operation: "union", selection: true },
        { operation: "subtract", nodeIds: ["123:456", "789:101"] },
        { operation: "intersect", nodeId: "123:456", nodeIds: ["789:101"] }
      ]),
      edgeCaseWarnings: [
        "If 'selection' is true, the current Figma selection is used and nodeId/nodeIds are ignored.",
        "At least two nodes are required for boolean operations.",
        "All nodeIds must be valid and belong to the same parent.",
        "Boolean operations change z-order and shape.",
        "Only nodes that support boolean operations are valid."
      ],
      extraInfo: "Boolean operations are useful for combining or subtracting shapes in vector editing."
    },
    async ({ operation, selection, nodeId, nodeIds }) => {
      let ids = [];
      if (selection) {
        const sel = await figmaClient.executeCommand(MCP_COMMANDS.GET_SELECTION, {});
        ids = sel.nodeIds || [];
      } else {
        if (nodeIds && nodeIds.length) ids = nodeIds.map(ensureNodeIdIsString);
        if (nodeId) ids.push(ensureNodeIdIsString(nodeId));
      }
      if (ids.length < 2) throw new Error("At least two node IDs are required for boolean operations.");
      const opMap = {
        union: "union_selection",
        subtract: "subtract_selection",
        intersect: "intersect_selection",
        exclude: "exclude_selection"
      };
      await figmaClient.executeCommand(opMap[operation], { nodeIds: ids });
      return { content: [{ type: "text", text: `${operation[0].toUpperCase() + operation.slice(1)}d ${ids.length} nodes` }] };
    }
  );
}
