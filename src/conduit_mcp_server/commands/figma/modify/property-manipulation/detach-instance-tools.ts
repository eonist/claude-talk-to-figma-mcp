import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z, ensureNodeIdIsString } from "../utils.js";
import { InstanceIdSchema } from "./instance-id-schema.js";

/**
 * Registers property-manipulation-related modify commands:
 * - detach_instance
 */
export function registerDetachInstanceTools(server: McpServer, figmaClient: FigmaClient) {
  // Detach Instance
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
    async ({ instanceId }) => {
      const id = ensureNodeIdIsString(instanceId);
      const result = await figmaClient.executeCommand("detach_instance", { instanceId: id });
      return { content: [{ type: "text", text: `Detached instance ${result.id}` }] };
    }
  );
}
