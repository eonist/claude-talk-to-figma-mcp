import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../../utils/figma/is-valid-node-id.js";
import { NodeIdsArraySchema } from "./node-ids-schema.js";

/**
 * Registers layer-management-related modify commands:
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
    `Flatten a selection of nodes in Figma.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes flattened.
`,
    {
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: NodeIdsArraySchema(1, 100),
    },
    {
      title: "Flatten Selection",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "Flattening is destructive and cannot be undone.",
        "All child layers are merged into a single vector.",
        "Only nodes that support flattening (Frame, Group, etc.) are valid."
      ],
      extraInfo: "Flattening is useful for export and performance, but removes layer structure."
    },
    async ({ nodeIds }) => {
      const ids = nodeIds.map(ensureNodeIdIsString);
      await figmaClient.executeCommand("flatten_selection", { nodeIds: ids });
      return { content: [{ type: "text", text: `Flattened ${ids.length} nodes` }] };
    }
  );

  // Boolean Operations
  server.tool(
    "union_selection",
    `Union selected shapes.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes unioned.
`,
    {
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: NodeIdsArraySchema(2, 100),
    },
    {
      title: "Union Selection",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "All nodeIds must be valid and belong to the same parent.",
        "Unioning nodes changes their z-order and shape.",
        "Only nodes that support union operations are valid."
      ],
      extraInfo: "Unioning is useful for combining shapes into a single vector."
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("union_selection", { nodeIds });
      return { content: [{ type: "text", text: `Unioned ${nodeIds.length} nodes` }] };
    }
  );

  server.tool(
    "subtract_selection",
    `Subtract top shapes from bottom shape.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes subtracted.
`,
    {
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: NodeIdsArraySchema(2, 100),
    },
    {
      title: "Subtract Selection",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "All nodeIds must be valid and belong to the same parent.",
        "Subtracting nodes changes their z-order and shape.",
        "Only nodes that support subtraction operations are valid."
      ],
      extraInfo: "Subtracting is useful for removing overlapping areas from shapes."
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("subtract_selection", { nodeIds });
      return { content: [{ type: "text", text: `Subtracted ${nodeIds.length} nodes` }] };
    }
  );

  server.tool(
    "intersect_selection",
    `Intersect selected shapes.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes intersected.
`,
    {
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: NodeIdsArraySchema(2, 100),
    },
    {
      title: "Intersect Selection",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "All nodeIds must be valid and belong to the same parent.",
        "Intersecting nodes changes their z-order and shape.",
        "Only nodes that support intersection operations are valid."
      ],
      extraInfo: "Intersecting is useful for creating new shapes from overlapping areas."
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("intersect_selection", { nodeIds });
      return { content: [{ type: "text", text: `Intersected ${nodeIds.length} nodes` }] };
    }
  );

  server.tool(
    "exclude_selection",
    `Exclude overlapping areas of selected shapes.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the number of nodes excluded.
`,
    {
      // Validate nodeIds as simple or complex Figma node IDs, preserving original description
      nodeIds: NodeIdsArraySchema(2, 100),
    },
    {
      title: "Exclude Selection",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "All nodeIds must be valid and belong to the same parent.",
        "Excluding nodes changes their z-order and shape.",
        "Only nodes that support exclusion operations are valid."
      ],
      extraInfo: "Excluding is useful for creating new shapes by removing overlapping areas."
    },
    async ({ nodeIds }) => {
      await figmaClient.executeCommand("exclude_selection", { nodeIds });
      return { content: [{ type: "text", text: `Excluded ${nodeIds.length} nodes` }] };
    }
  );
}
