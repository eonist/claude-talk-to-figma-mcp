import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";

/**
 * Registers component-creation-related commands on the MCP server.
 *
 * This function adds tools named "create_component_instance" and "create_component_instances" to the MCP server,
 * enabling creation of single or multiple component instances in Figma.
 * It validates inputs, executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerInstanceTools(server, figmaClient);
 */
export function registerInstanceTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified single/batch component instance creation
  server.tool(
    "create_component_instance",
    `Creates one or more component instances in Figma. Accepts either a single instance config (via 'instance') or an array of configs (via 'instances').

Input:
  - instance: A single component instance configuration object.
  - instances: An array of component instance configuration objects.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created component instance node ID(s).
`,
    {
      instance: z.object({
        componentKey: z.string()
          .min(1)
          .max(100)
          .describe("The key of the component to instantiate. Must be a non-empty string. Maximum length 100 characters."),
        x: z.number()
          .min(-10000)
          .max(10000)
          .describe("X coordinate for the instance. Must be between -10,000 and 10,000."),
        y: z.number()
          .min(-10000)
          .max(10000)
          .describe("Y coordinate for the instance. Must be between -10,000 and 10,000."),
      }).optional(),
      instances: z.array(
        z.object({
          componentKey: z.string()
            .min(1)
            .max(100)
            .describe("The key of the component to instantiate. Must be a non-empty string. Maximum length 100 characters."),
          x: z.number()
            .min(-10000)
            .max(10000)
            .describe("X coordinate for the instance. Must be between -10,000 and 10,000."),
          y: z.number()
            .min(-10000)
            .max(10000)
            .describe("Y coordinate for the instance. Must be between -10,000 and 10,000."),
        })
      ).optional(),
    },
    {
      title: "Create Component Instance(s)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {
          instance: {
            componentKey: "abc123",
            x: 100,
            y: 200
          }
        },
        {
          instances: [
            { componentKey: "abc123", x: 100, y: 200 },
            { componentKey: "def456", x: 300, y: 400 }
          ]
        }
      ]),
      edgeCaseWarnings: [
        "componentKey must be a valid component key.",
        "x and y must be within allowed range.",
        "If any componentKey is invalid, that instance will fail."
      ],
      extraInfo: "Creates one or more instances of a component at the specified position(s)."
    },
    async (args) => {
      try {
        let instancesArr;
        if (args.instances) {
          instancesArr = args.instances;
        } else if (args.instance) {
          instancesArr = [args.instance];
        } else {
          throw new Error("You must provide either 'instance' or 'instances' as input.");
        }
        const results = await processBatch(
          instancesArr,
          cfg => figmaClient.executeCommand("create_component_instance", cfg).then(res => res.id)
        );
        const nodeIds = results.map(r => r.result).filter(Boolean);
        if (nodeIds.length === 1) {
          return { content: [{ type: "text", text: `Created component instance ${nodeIds[0]}` }] };
        } else {
          return { content: [{ type: "text", text: `Created component instances: ${nodeIds.join(", ")}` }] };
        }
      } catch (err) {
        return handleToolError(err, "component-creation-tools", "create_component_instance") as any;
      }
    }
  );
}
