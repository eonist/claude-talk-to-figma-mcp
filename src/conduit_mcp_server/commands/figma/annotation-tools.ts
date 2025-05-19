import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../clients/figma-client.js";
import { GetAnnotationParams, SetAnnotationParams, SetAnnotationEntry, AnnotationInput } from "../../types/command-params.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../types/commands.js";

/**
 * Registers annotation commands with the MCP server.
 */
export function registerAnnotationCommands(server: McpServer, figmaClient: FigmaClient) {
  // get_annotation
  server.tool(
    MCP_COMMANDS.GET_ANNOTATION,
    `Get annotation(s) for one or more Figma nodes.

Parameters:
  - nodeId: (string, optional) Node ID for single node.
  - nodeIds: (string[], optional) Array of node IDs for batch.

Returns:
  - For single: { nodeId, annotations }
  - For batch: Array<{ nodeId, annotations }>
`,
    {
      nodeId: z.string().optional(),
      nodeIds: z.array(z.string()).optional()
    },
    {
      title: "Get Annotation(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" },
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "Returns empty array if node(s) have no annotations.",
        "Throws error if node(s) not found."
      ],
      extraInfo: "Use to retrieve annotation(s) for one or more nodes."
    },
    async (args) => {
      const result = await handleGetAnnotation(figmaClient, args);
      if (Array.isArray(result)) {
        return {
          content: result.map(r => ({
            type: "text",
            text: JSON.stringify(r)
          }))
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      }
    }
  );

  // set_annotation
  server.tool(
    MCP_COMMANDS.SET_ANNOTATION,
    `Set, update, or delete annotation(s) for one or more Figma nodes.

Parameters:
  - entry: { nodeId, annotation, delete } (for single)
  - entries: Array<{ nodeId, annotation, delete }> (for batch)
    - annotation: { label, labelMarkdown }
    - delete: (boolean, optional) If true, deletes annotation(s) for node(s).

Returns:
  - For single: { nodeId, updated/deleted }
  - For batch: Array<{ nodeId, updated/deleted }>
`,
    {
      entry: z
        .object({
          nodeId: z.string(),
          annotation: z
            .object({
              label: z.string().optional(),
              labelMarkdown: z.string().optional()
            })
            .optional(),
          delete: z.boolean().optional()
        })
        .optional(),
      entries: z
        .array(
          z.object({
            nodeId: z.string(),
            annotation: z
              .object({
                label: z.string().optional(),
                labelMarkdown: z.string().optional()
              })
              .optional(),
            delete: z.boolean().optional()
          })
        )
        .optional()
    },
    {
      title: "Set Annotation(s)",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entry: { nodeId: "123:456", annotation: { labelMarkdown: "## Note" } } },
        { entries: [
          { nodeId: "123:456", annotation: { label: "A" } },
          { nodeId: "789:101", annotation: { labelMarkdown: "**B**" }, delete: true }
        ]}
      ]),
      edgeCaseWarnings: [
        "Throws error if node(s) not found.",
        "If delete is true, annotation(s) are removed for the node(s)."
      ],
      extraInfo: "Use to set, update, or delete annotation(s) for one or more nodes."
    },
    async (args) => {
      const result = await handleSetAnnotation(figmaClient, args);
      if (Array.isArray(result)) {
        return {
          content: result.map(r => ({
            type: "text",
            text: JSON.stringify(r)
          }))
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      }
    }
  );
}

/**
 * Handler for get_annotation command (single or batch).
 * Returns the annotations property for the specified node(s).
 */
export async function handleGetAnnotation(figmaClient: any, args: any) {
  // Single node
  if (args.nodeId) {
    const node = await figmaClient.getNodeById(args.nodeId);
    return {
      nodeId: args.nodeId,
      annotations: node?.annotations || []
    };
  }
  // Batch
  if (args.nodeIds && Array.isArray(args.nodeIds)) {
    const results = [];
    for (const nodeId of args.nodeIds) {
      const node = await figmaClient.getNodeById(nodeId);
      results.push({
        nodeId,
        annotations: node?.annotations || []
      });
    }
    return results;
  }
  throw new Error("Must provide nodeId or nodeIds");
}

/**
 * Handler for set_annotation command (single or batch).
 * Can create, update, or delete annotations for node(s).
 */
export async function handleSetAnnotation(figmaClient: any, args: any) {
  // Helper to set or delete annotation for a node
  async function setOrDelete(entry: SetAnnotationEntry) {
    const node = await figmaClient.getNodeById(entry.nodeId);
    if (!node) return { nodeId: entry.nodeId, success: false, error: "Node not found" };
    if (entry.delete) {
      node.annotations = [];
      return { nodeId: entry.nodeId, deleted: true };
    }
    if (entry.annotation) {
      // Figma supports an array of annotations, but for simplicity, we set a single annotation per call
      node.annotations = [entry.annotation];
      return { nodeId: entry.nodeId, updated: true, annotation: entry.annotation };
    }
    return { nodeId: entry.nodeId, success: false, error: "No annotation or delete flag provided" };
  }

  // Single
  if (args.entry) {
    return await setOrDelete(args.entry);
  }
  // Batch
  if (args.entries && Array.isArray(args.entries)) {
    const results = [];
    for (const entry of args.entries) {
      results.push(await setOrDelete(entry));
    }
    return results;
  }
  throw new Error("Must provide entry or entries");
}
