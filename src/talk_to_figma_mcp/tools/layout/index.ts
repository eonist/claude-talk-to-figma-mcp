/**
 * Herramientas MCP relacionadas con el layout en Figma
 * 
 * Estas herramientas permiten configurar y manipular el auto-layout
 * y otras propiedades de distribución de elementos.
 */

import { z } from "zod";
import { FigmaMcpServer } from "../../core/server/mcp-server";
import { RequestManager } from "../../core/handlers/request-manager";
import { ChannelManager } from "../../core/channels/channel-manager";
import { logger } from "../../utils/logger";

/**
 * Registra herramientas relacionadas con el layout en el servidor MCP
 * 
 * @param server Instancia del servidor MCP
 * @param requestManager Gestor de solicitudes Figma
 * @param channelManager Gestor de canales
 */
export function registerLayoutTools(
  server: FigmaMcpServer,
  requestManager: RequestManager,
  channelManager: ChannelManager
): void {
  logger.info("Registrando herramientas de layout...");

  // Herramienta: set_auto_layout
  server.registerTool(
    "set_auto_layout",
    "Configure auto layout properties for a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to configure auto layout"),
      layoutMode: z.enum(["HORIZONTAL", "VERTICAL", "NONE"]).describe("Layout direction"),
      primaryAxisAlignItems: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).optional().describe("Alignment along primary axis"),
      counterAxisAlignItems: z.enum(["MIN", "CENTER", "MAX"]).optional().describe("Alignment along counter axis"),
      paddingTop: z.number().optional().describe("Top padding in pixels"),
      paddingRight: z.number().optional().describe("Right padding in pixels"),
      paddingBottom: z.number().optional().describe("Bottom padding in pixels"),
      paddingLeft: z.number().optional().describe("Left padding in pixels"),
      itemSpacing: z.number().optional().describe("Spacing between items in pixels"),
      layoutWrap: z.enum(["WRAP", "NO_WRAP"]).optional().describe("Whether items wrap to new lines"),
      strokesIncludedInLayout: z.boolean().optional().describe("Whether strokes are included in layout calculations"),
    },
    async ({ nodeId, layoutMode, primaryAxisAlignItems, counterAxisAlignItems, 
            paddingTop, paddingRight, paddingBottom, paddingLeft, 
            itemSpacing, layoutWrap, strokesIncludedInLayout }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_auto_layout", 
          { 
            nodeId,
            layoutMode,
            primaryAxisAlignItems,
            counterAxisAlignItems,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            itemSpacing,
            layoutWrap,
            strokesIncludedInLayout
          }
        );
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
              text: `Error setting auto layout: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_layout_sizing
  server.registerTool(
    "set_layout_sizing",
    "Set the layout sizing properties of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      horizontal: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Horizontal sizing behavior"),
      vertical: z.enum(["FIXED", "HUG", "FILL"]).optional().describe("Vertical sizing behavior")
    },
    async ({ nodeId, horizontal, vertical }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_layout_sizing", 
          { nodeId, horizontal, vertical }
        );
        
        return {
          content: [
            {
              type: "text",
              text: `Successfully updated layout sizing for node "${result.name}"`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting layout sizing: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}