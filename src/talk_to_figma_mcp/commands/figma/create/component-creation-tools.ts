import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z, logger, ensureNodeIdIsString } from "./utils.js";
import { processBatch } from "../../../utils/batch-processor.js";
import { handleToolError } from "../../../utils/error-handling.js";

/**
 * Registers component-creation-related commands:
 * - create_component_instance
 * - create_component_instances
 * - create_component_from_node
 */
export function registerComponentCreationCommands(server: McpServer, figmaClient: FigmaClient) {
  // Create single component instance
  server.tool(
    "create_component_instance",
    "Create an instance of a component in Figma",
    {
      componentKey: z.string(),
      x: z.number(),
      y: z.number()
    },
        async ({ componentKey, x, y }): Promise<any> => {
          try {
            const result = await figmaClient.executeCommand("create_component_instance", { componentKey, x, y });
            return { content: [{ type: "text", text: `Created component instance ${result.id}` }] };
          } catch (err) {
            return handleToolError(err, "component-creation-tools", "create_component_instance") as any;
          }
        }
  );

  // Batch component instances
  server.tool(
    "create_component_instances",
    "Create multiple component instances in Figma",
    {
      instances: z.array(
        z.object({
          componentKey: z.string(),
          x: z.number(),
          y: z.number()
        })
      ).describe("Component instance specs")
    },
    async ({ instances }): Promise<any> => {
      try {
        const results = await processBatch(
          instances,
          cfg => figmaClient.executeCommand("create_component_instance", cfg).then(res => res.id)
        );
        const successCount = results.filter(r => r.result !== undefined).length;
        return {
          content: [{ type: "text", text: `Created ${successCount}/${instances.length} component instances.` }],
          _meta: { results }
        };
      } catch (err) {
        return handleToolError(err, "component-creation-tools", "create_component_instances") as any;
      }
    }
  );

  // Create component from existing node
  server.tool(
    "create_component_from_node",
    "Convert an existing node into a component",
    { nodeId: z.string() },
    async ({ nodeId }): Promise<any> => {
      try {
        const id = ensureNodeIdIsString(nodeId);
        const result = await figmaClient.executeCommand("create_component_from_node", { nodeId: id });
        return { content: [{ type: "text", text: `Created component ${result.componentId}` }] };
      } catch (err) {
        return handleToolError(err, "component-creation-tools", "create_component_from_node") as any;
      }
    }
  );
}
