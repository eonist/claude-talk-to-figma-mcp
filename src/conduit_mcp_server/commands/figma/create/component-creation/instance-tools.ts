import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";
import { MCP_COMMANDS } from "../../../../types/commands.js";

/**
 * Registers component-creation-related commands on the MCP server.
 *
 * This function adds a tool named "create_instances_from_components" to the MCP server,
 * enabling creation of single or multiple component instances in Figma. It validates input,
 * executes corresponding Figma commands, and returns informative results.
 *
 * @param {McpServer} server - The MCP server instance to register the tools on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tools asynchronously.
 *
 * @example
 * registerCreateInstancesFromComponentsTools(server, figmaClient);
 */
export function registerCreateInstancesFromComponentsTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.CREATE_COMPONENT_INSTANCE,
    `Creates one or more component instances in Figma. Accepts either a single entry (via 'entry') or an array of entries (via 'entries').

Input:
  - entry: (object, optional) Single instance config: { componentKey, x, y }
  - entries: (array, optional) Array of instance configs

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created instance IDs.

Examples:
  { "entry": { "componentKey": "abc:123", "x": 100, "y": 200 } }
  { "entries": [
      { "componentKey": "abc:123", "x": 100, "y": 200 },
      { "componentKey": "def:456", "x": 300, "y": 400 }
    ] }
`,
    {
      entry: z.object({
        componentKey: z.string().min(1).max(100),
        x: z.number().min(-10000).max(10000),
        y: z.number().min(-10000).max(10000)
      }).optional(),
      entries: z.array(z.object({
        componentKey: z.string().min(1).max(100),
        x: z.number().min(-10000).max(10000),
        y: z.number().min(-10000).max(10000)
      })).optional()
    },
    {
      title: "Create Instances from Components",
      idempotentHint: false,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { entry: { componentKey: "abc:123", x: 100, y: 200 } },
        { entries: [
          { componentKey: "abc:123", x: 100, y: 200 },
          { componentKey: "def:456", x: 300, y: 400 }
        ]}
      ]),
      edgeCaseWarnings: [
        "componentKey must be valid.",
        "x and y must be within Figma canvas bounds.",
        "You must provide either 'entry' or 'entries'."
      ],
      extraInfo: "Creates one or more instances of a component at specified positions."
    },
    async ({ entry, entries }) => {
      let instancesArr = [];
      if (Array.isArray(entries) && entries.length > 0) {
        instancesArr = entries;
      } else if (entry) {
        instancesArr = [entry];
      } else {
        return { content: [{ type: "text", text: "You must provide 'entry' or 'entries'." }] };
      }
      try {
        // Create all instances in parallel
        const results = await Promise.all(
          instancesArr.map(
            cfg => figmaClient.executeCommand("create_component_instance", cfg).then(res => res.id)
          )
        );
        return {
          content: [{
            type: "text",
            text: `Created ${results.length} instance(s): ${results.join(", ")}`
          }]
        };
      } catch (err) {
        return handleToolError(err, "component-creation-tools", "create_instances_from_components") as any;
      }
    }
  );
}
