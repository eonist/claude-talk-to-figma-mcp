import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { InstanceIdSchema } from "./instance-id-schema.js";

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
  // Detach Instance (single)
  server.tool(
    "detach_instance",
    `Detaches a Figma component instance from its master.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the detached instance's ID.
`,
    { instanceId: InstanceIdSchema },
    {
      title: "Detach Instance",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { instanceId: "123:456" }
      ]),
      edgeCaseWarnings: [
        "instanceId must be a valid Figma instance ID.",
        "Detaching an instance is irreversible.",
        "Detached instances lose connection to their master component."
      ],
      extraInfo: "Use this command to detach a component instance from its master."
    },
    // For a common API, internally call the batch logic with a single-element array
    async ({ instanceId }) => {
      const id = ensureNodeIdIsString(instanceId);
      const resultArr = await figmaClient.executeCommand("detach_instances", { instanceIds: [id] });
      // Return the first result for single instance
      if (Array.isArray(resultArr) && resultArr.length > 0) {
        return { content: [{ type: "text", text: `Detached instance ${resultArr[0].id}` }] };
      }
      return { content: [{ type: "text", text: `No instance detached for ${id}` }] };
    }
  );

  // Detach Instances (batch)
  server.tool(
    "detach_instances",
    `Detaches multiple Figma component instances from their masters.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the detached instance's ID or error info.
`,
    {
      instanceIds: z.array(InstanceIdSchema).min(1, "At least one instanceId is required"),
      options: z
        .object({
          maintain_position: z.boolean().optional(),
          skip_errors: z.boolean().optional(),
        })
        .optional(),
    },
    {
      title: "Detach Instances (Batch)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: false,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { instanceIds: ["123:456", "789:101"], options: { maintain_position: true, skip_errors: true } }
      ]),
      edgeCaseWarnings: [
        "Each instanceId must be a valid Figma instance ID.",
        "Detaching an instance is irreversible.",
        "Detached instances lose connection to their master component.",
        "If skip_errors is false, the operation will stop on the first error."
      ],
      extraInfo: "Use this command to detach multiple component instances from their masters in a single call."
    },
    async ({ instanceIds, options }) => {
      const ids = instanceIds.map(ensureNodeIdIsString);
      // Call the batch detach command on the Figma client
      const resultArr = await figmaClient.executeCommand("detach_instances", { instanceIds: ids, options });
      // Return all results (could be array of {id, error?})
      return {
        content: Array.isArray(resultArr)
          ? resultArr.map(r =>
              r.error
                ? { type: "text", text: `Error detaching ${r.instanceId}: ${r.error}` }
                : { type: "text", text: `Detached instance ${r.id}` }
            )
          : [{ type: "text", text: "No instances detached." }]
      };
    }
  );
}
