import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers boolean operation commands:
 * - flatten_selection
 * - union_selection
 * - subtract_selection
 * - intersect_selection
 * - exclude_selection
 */
export function registerBooleanTools(server: McpServer, figmaClient: FigmaClient) {
  // Flatten Selection
  server.tool(
    "flatten_selection",
    `Flatten a selection of nodes in Figma.`,
    {
      nodeIds: z.array(
        z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID." })
      ).min(1).max(100),
    },
    async ({ nodeIds }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      await figmaClient.executeCommand("flatten_selection", { nodeIds: ids });
      return { content: [{ type: "text", text: `Flattened ${ids.length} nodes` }] };
    }
  );

  // Union Selection
  server.tool(
    "union_selection",
    `Union selected shapes.`,
    {
      nodeIds: z.array(
        z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID." })
      ).min(2).max(100),
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("union_selection", { nodeIds });
      return { content: [{ type: "text", text: `Unioned ${nodeIds.length} nodes` }] };
    }
  );

  // Subtract Selection
  server.tool(
    "subtract_selection",
    `Subtract top shapes from bottom shape.`,
    {
      nodeIds: z.array(
        z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID." })
      ).min(2).max(100),
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("subtract_selection", { nodeIds });
      return { content: [{ type: "text", text: `Subtracted ${nodeIds.length} nodes` }] };
    }
  );

  // Intersect Selection
  server.tool(
    "intersect_selection",
    `Intersect selected shapes.`,
    {
      nodeIds: z.array(
        z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID." })
      ).min(2).max(100),
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("intersect_selection", { nodeIds });
      return { content: [{ type: "text", text: `Intersected ${nodeIds.length} nodes` }] };
    }
  );

  // Exclude Selection
  server.tool(
    "exclude_selection",
    `Exclude overlapping areas of selected shapes.`,
    {
      nodeIds: z.array(
        z.string().refine(isValidNodeId, { message: "Must be a valid Figma node ID." })
      ).min(2).max(100),
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("exclude_selection", { nodeIds });
      return { content: [{ type: "text", text: `Excluded ${nodeIds.length} nodes` }] };
    }
  );
}
