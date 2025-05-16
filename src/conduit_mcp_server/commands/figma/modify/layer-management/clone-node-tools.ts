import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { isValidNodeId } from "../../../../utils/figma/is-valid-node-id.js";

/**
 * Registers clone node commands on the MCP server.
 *
 * This function adds tools named "clone_node" and "clone_nodes" to the MCP server,
 * enabling cloning of single or multiple nodes in Figma. It validates inputs,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerCloneNodeTools(server, figmaClient);
 */
export function registerCloneNodeTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified single/batch node clone
  server.tool(
    "clone_node",
    `Clones one or more nodes in Figma. Accepts either a single node config (via 'node') or an array of configs (via 'nodes'). Optionally, you can specify positions, offsets, and parent.

Input:
  - node: A single node clone configuration object ({ nodeId, position?, offsetX?, offsetY?, parentId? }).
  - nodes: An array of node clone configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the new node ID(s).
`,
    {
      node: z.object({
        nodeId: z.string()
          .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
          .describe("ID of the node to clone."),
        position: z.object({
          x: z.number(),
          y: z.number()
        }).optional(),
        offsetX: z.number().optional(),
        offsetY: z.number().optional(),
        parentId: z.string().optional()
      }).optional(),
      nodes: z.array(
        z.object({
          nodeId: z.string()
            .refine(isValidNodeId, { message: "Must be a valid Figma node ID (simple or complex format, e.g., '123:456' or 'I422:10713;1082:2236')" })
            .describe("ID of the node to clone."),
          position: z.object({
            x: z.number(),
            y: z.number()
          }).optional(),
          offsetX: z.number().optional(),
          offsetY: z.number().optional(),
          parentId: z.string().optional()
        })
      ).optional()
    },
    {
      title: "Clone Node(s)",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { node: { nodeId: "123:456" } },
        { nodes: [
          { nodeId: "123:456", offsetX: 100, offsetY: 0 },
          { nodeId: "789:101", position: { x: 200, y: 300 } }
        ]}
      ]),
      edgeCaseWarnings: [
        "Cloning a node duplicates all its children.",
        "Cloned nodes may overlap with originals if no position/offset is specified.",
        "Ensure nodeId is valid to avoid errors.",
        "Batch cloning large numbers of nodes may impact performance."
      ],
      extraInfo: "Cloning is useful for duplicating components or layouts. Use offsets or positions for layout control."
    },
    async (args) => {
      try {
        let nodesArr;
        if (args.nodes) {
          nodesArr = args.nodes;
        } else if (args.node) {
          nodesArr = [args.node];
        } else {
          throw new Error("You must provide either 'node' or 'nodes' as input.");
        }
        const results = [];
        for (const cfg of nodesArr) {
          const id = ensureNodeIdIsString(cfg.nodeId);
          const params: any = { nodeId: id };
          if (cfg.position) params.position = cfg.position;
          if (cfg.offsetX !== undefined) params.offsetX = cfg.offsetX;
          if (cfg.offsetY !== undefined) params.offsetY = cfg.offsetY;
          if (cfg.parentId) params.parentId = cfg.parentId;
          const result = await figmaClient.executeCommand("clone_node", params);
          results.push(result.newNodeId ?? "(unknown)");
        }
        if (results.length === 1) {
          return {
            content: [{
              type: "text",
              text: `Cloned node to new node ${results[0]}`
            }]
          };
        } else {
          return {
            content: [{
              type: "text",
              text: `Cloned ${results.length} nodes. New node IDs: ${results.join(", ")}`
            }]
          };
        }
      } catch (err) {
        return handleToolError(err, "layer-management-tools", "clone_node") as any;
      }
    }
  );
}
