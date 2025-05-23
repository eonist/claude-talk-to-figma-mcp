import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { ensureNodeIdIsString } from "../../../utils/node-utils.js";
import { InstanceIdSchema } from "./schema/instance-id-schema.js";
import { MCP_COMMANDS } from "../../../types/commands.js";
/**
 * Registers detach instance command on the MCP server.
 *
 * This function adds a tool named "detach_instance" to the MCP server,
 * enabling detaching a Figma component instance from its master component.
 * It validates input, executes the corresponding Figma command, and returns the result.
 *
 * @param {McpServer} server - The MCP server instance to register the tool on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tool asynchronously.
 *
 * @example
 * registerDetachInstanceTools(server, figmaClient);
 */
export function registerDetachInstanceTools(server: McpServer, figmaClient: FigmaClient) {
  // Unified detach_instances tool (single or batch)
  server.tool(
    MCP_COMMANDS.DETACH_INSTANCES,
    `Detaches one or more Figma component instances from their masters.
Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the detached instance's ID or error info.

`,
    {
      instanceId: InstanceIdSchema.optional(),
      instanceIds: z.array(InstanceIdSchema).optional(),
      options: z
        .object({
          maintain_position: z.boolean().optional(),
          skip_errors: z.boolean().optional(),
        })
        .optional(),
    },
    {
      title: "Detach Instances (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { instanceId: "123:456" },
        { instanceIds: ["123:456", "789:101"], options: { maintain_position: true, skip_errors: true } }
      ]),
      edgeCaseWarnings: [
        "Each instanceId must be a valid Figma instance ID.",
        "Detaching an instance is irreversible.",
        "Detached instances lose connection to their master component.",
        "If skip_errors is false, the operation will stop on the first error.",
        "You must provide either 'instanceId' or 'instanceIds'."
      ],
      extraInfo: "Use this command to detach one or more component instances from their masters in a single call."
    },
    async ({ instanceId, instanceIds, options }) => {
      let ids = [];
      if (Array.isArray(instanceIds) && instanceIds.length > 0) {
        ids = instanceIds.map(ensureNodeIdIsString);
      } else if (instanceId) {
        ids = [ensureNodeIdIsString(instanceId)];
      } else {
        const response = {
          success: false,
          error: {
            message: "You must provide 'instanceId' or 'instanceIds'.",
            results: [],
            meta: {
              operation: "detach_instances",
              params: { instanceId, instanceIds, options }
            }
          }
        };
        return { content: [{ type: "text", text: JSON.stringify(response) }] };
      }
      // Call the batch detach command on the Figma client
      const resultArr = await figmaClient.executeCommand(MCP_COMMANDS.DETACH_INSTANCES, { instanceIds: ids, options });
      const results = [];
      if (Array.isArray(resultArr)) {
        for (const r of resultArr) {
          if (r.error) {
            results.push({
              instanceId: r.instanceId,
              success: false,
              error: r.error,
              meta: {
                operation: "detach_instances",
                params: { instanceId: r.instanceId, options }
              }
            });
          } else {
            results.push({
              instanceId: r.instanceId || r.id,
              id: r.id,
              success: true
            });
          }
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
            message: "All detach_instances operations failed",
            results,
            meta: {
              operation: "detach_instances",
              params: { instanceId, instanceIds, options }
            }
          }
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(response) }] };
    }
  );
}
