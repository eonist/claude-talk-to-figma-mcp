/**
 * Herramientas MCP relacionadas con la selección en Figma
 * 
 * Estas herramientas permiten obtener información sobre los elementos
 * seleccionados actualmente en el documento Figma.
 */

import { z } from "zod";
import { FigmaMcpServer } from "../../core/server/mcp-server";
import { RequestManager } from "../../core/handlers/request-manager";
import { ChannelManager } from "../../core/channels/channel-manager";
import { logger } from "../../utils/logger";

/**
 * Registra herramientas relacionadas con la selección en el servidor MCP
 * 
 * @param server Instancia del servidor MCP
 * @param requestManager Gestor de solicitudes Figma
 * @param channelManager Gestor de canales
 */
export function registerSelectionTools(
  server: FigmaMcpServer,
  requestManager: RequestManager,
  channelManager: ChannelManager
): void {
  logger.info("Registrando herramientas de selección...");

  // Herramienta: get_selection
  server.registerTool(
    "get_selection",
    "Get information about the current selection in Figma",
    {},
    async () => {
      try {
        const result = await requestManager.sendCommand("get_selection");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting selection: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: scan_text_nodes
  server.registerTool(
    "scan_text_nodes",
    "Scan all text nodes in the selected Figma node",
    {
      nodeId: z.string().describe("ID of the node to scan"),
    },
    async ({ nodeId }) => {
      try {
        const result = await requestManager.sendCommand("scan_text_nodes", { nodeId });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error scanning text nodes: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: group_nodes
  server.registerTool(
    "group_nodes",
    "Group nodes in Figma",
    {
      nodeIds: z.array(z.string()).describe("Array of IDs of the nodes to group"),
      name: z.string().optional().describe("Optional name for the group"),
    },
    async ({ nodeIds, name }) => {
      try {
        const result = await requestManager.sendCommand("group_nodes", { 
          nodeIds, 
          name 
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error grouping nodes: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: ungroup_nodes
  server.registerTool(
    "ungroup_nodes",
    "Ungroup nodes in Figma",
    {
      nodeId: z.string().describe("ID of the node (group or frame) to ungroup"),
    },
    async ({ nodeId }) => {
      try {
        const result = await requestManager.sendCommand("ungroup_nodes", { nodeId });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error ungrouping nodes: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}