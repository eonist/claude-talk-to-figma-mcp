import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { GetAnnotationParams, SetAnnotationParams, SetAnnotationEntry, AnnotationInput } from "../../types/command-params.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers annotation commands with the MCP server.
 */
export function registerAnnotationCommands(server: McpServer, figmaClient: FigmaClient) {
  // get_annotation
  server.tool(
    MCP_COMMANDS.GET_ANNOTATION,
    `Get annotation(s) for one or more Figma nodes.

Returns:
  - For single: { nodeId, annotations }
  - For batch: Array<{ nodeId, annotations }>
`,
    {
      nodeId: z.string().optional().describe("The ID of a single node to get annotations for. Optional."),
      nodeIds: z.array(z.string()).optional().describe("An array of node IDs to get annotations for in batch. Optional.")
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
      try {
        const result = await handleGetAnnotation(figmaClient, args);
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
      } catch (err) {
        const response = {
          success: false,
          error: {
            message: err instanceof Error ? err.message : String(err),
            results: [],
            meta: {
              operation: "get_annotation",
              params: args
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

  // set_annotation
  server.tool(
    MCP_COMMANDS.SET_ANNOTATION,
    `Set, update, or delete annotation(s) for one or more Figma nodes.

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
        .optional()
        .describe("A single annotation operation to perform. Optional."),
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
        .describe("An array of annotation operations to perform in batch. Optional.")
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
      try {
        const result = await handleSetAnnotation(figmaClient, args);
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
      } catch (err) {
        const response = {
          success: false,
          error: {
            message: err instanceof Error ? err.message : String(err),
            results: [],
            meta: {
              operation: "set_annotation",
              params: args
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
