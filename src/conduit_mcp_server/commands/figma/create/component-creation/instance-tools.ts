import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "../utils.js";
import { processBatch } from "../../../../utils/batch-processor.js";
import { handleToolError } from "../../../../utils/error-handling.js";

/**
 * Registers component instance creation commands:
 * - create_component_instance
 * - create_component_instances
 */
export function registerInstanceTools(server: McpServer, figmaClient: FigmaClient) {
  // Create Component Instance
  server.tool(
    "create_component_instance",
    `Create an instance of a component in Figma.

Parameters:
  - componentKey (string, required): The key of the component to instantiate.
  - x (number, required): X coordinate for the instance.
  - y (number, required): Y coordinate for the instance.

Returns:
  - content: Array containing a text message with the created component instance's node ID.
    Example: { "content": [{ "type": "text", "text": "Created component instance 123:456" }] }
`,
    {
      componentKey: z.string().min(1).max(100),
      x: z.number().min(-10000).max(10000),
      y: z.number().min(-10000).max(10000),
    },
    async ({ componentKey, x, y }) => {
      try {
        const result = await figmaClient.executeCommand("create_component_instance", { componentKey, x, y });
        return { content: [{ type: "text", text: `Created component instance ${result.id}` }] };
      } catch (err) {
        return handleToolError(err, "component-creation-tools", "create_component_instance") as any;
      }
    }
  );

  // Create Component Instances (Batch)
  server.tool(
    "create_component_instances",
    `Create multiple component instances in Figma.

Parameters:
  - instances (array, required): An array of instance configuration objects. Each object should include:
      - componentKey (string, required): The key of the component to instantiate.
      - x (number, required): X coordinate for the instance.
      - y (number, required): Y coordinate for the instance.

Returns:
  - content: Array containing a text message with the number of component instances created.
    Example: { "content": [{ "type": "text", "text": "Created 3/3 component instances." }] }
`,
    {
      instances: z.array(
        z.object({
          componentKey: z.string().min(1).max(100),
          x: z.number().min(-10000).max(10000),
          y: z.number().min(-10000).max(10000),
        })
      ).min(1).max(50),
    },
    async ({ instances }) => {
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
}
