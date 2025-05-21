import { z } from "zod";
import { FigmaMcpServer } from "../../../types/commands";
import { isValidNodeId } from "../../../utils/figma/is-valid-node-id";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers selection modification tools for Figma.
 * - set_selection: Set the current selection to one or more node IDs.
 */
export function registerSelectionModifyTools(server: FigmaMcpServer) {
  server.tool(
    MCP_COMMANDS.SET_SELECTION,
    {
      description: `Set the current selection in Figma to the specified node(s) by ID.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the selection result as JSON.
`,
      inputSchema: z.object({
        nodeId: z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID." }).optional(),
        nodeIds: z.array(z.string().refine(isValidNodeId)).optional()
      }).refine(
        (data) => data.nodeId || (Array.isArray(data.nodeIds) && data.nodeIds.length > 0),
        { message: "You must provide 'nodeId' or 'nodeIds'." }
      ),
      usageExamples: JSON.stringify([
        { nodeId: "123:456" },
        { nodeIds: ["123:456", "789:101"] }
      ]),
      extraInfo: "Node IDs must be valid and present on the current page. Returns which nodes were selected and which were not found."
    },
    async (params, { figmaClient }) => {
      try {
        const result = await figmaClient.executeCommand(MCP_COMMANDS.SET_SELECTION, params);
        const resultsArr = Array.isArray(result) ? result : [result];
        const response = { success: true, results: resultsArr };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      } catch (error) {
        const response = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : String(error),
            results: [],
            meta: {
              operation: "set_selection",
              params
            }
          }
        };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response)
            }
          ]
        };
      }
    }
  );
}
