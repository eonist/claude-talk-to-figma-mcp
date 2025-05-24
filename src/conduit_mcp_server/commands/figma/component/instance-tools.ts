import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { CreateComponentInstanceSchema } from "./schema/create-component-instance-schema.js";

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

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the created instance IDs.
`,
    CreateComponentInstanceSchema.shape,
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
        const response = {
          success: false,
          error: {
            message: "You must provide 'entry' or 'entries'.",
            results: [],
            meta: {
              operation: "create_instances_from_components",
              params: { entry, entries }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      const results = [];
      for (const cfg of instancesArr) {
        try {
          const res = await figmaClient.executeCommand(MCP_COMMANDS.CREATE_COMPONENT_INSTANCE, cfg);
          results.push({
            componentKey: cfg.componentKey,
            x: cfg.x,
            y: cfg.y,
            instanceId: res.id,
            success: true
          });
        } catch (err) {
          results.push({
            componentKey: cfg.componentKey,
            x: cfg.x,
            y: cfg.y,
            success: false,
            error: err instanceof Error ? err.message : String(err),
            meta: {
              operation: "create_instances_from_components",
              params: cfg
            }
          });
        }
      }
      const anySuccess = results.some(r => r.success);
      let response;
      if (anySuccess) {
        response = { success: true, results };
      } else {
        response = {
          success: false,
          error: {
            message: "All create_instances_from_components operations failed",
            results,
            meta: {
              operation: "create_instances_from_components",
              params: instancesArr
            }
          }
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );
}
