/**
 * Herramientas MCP relacionadas con efectos en Figma
 * 
 * Estas herramientas permiten aplicar y configurar efectos visuales
 * como sombras, desenfoques y estilos de efectos.
 */

import { z } from "zod";
import { FigmaMcpServer } from "../../core/server/mcp-server";
import { RequestManager } from "../../core/handlers/request-manager";
import { ChannelManager } from "../../core/channels/channel-manager";
import { logger } from "../../utils/logger";

/**
 * Registra herramientas relacionadas con efectos en el servidor MCP
 * 
 * @param server Instancia del servidor MCP
 * @param requestManager Gestor de solicitudes Figma
 * @param channelManager Gestor de canales
 */
export function registerEffectTools(
  server: FigmaMcpServer,
  requestManager: RequestManager,
  channelManager: ChannelManager
): void {
  logger.info("Registrando herramientas de efectos...");

  // Herramienta: set_effects
  server.registerTool(
    "set_effects",
    "Set the visual effects of a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      effects: z.array(z.object({
        type: z.enum(["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"]).describe("Effect type"),
        visible: z.boolean().optional().describe("Whether the effect is visible"),
        radius: z.number().optional().describe("Effect radius"),
        color: z.object({
          r: z.number().min(0).max(1).describe("Red (0-1)"),
          g: z.number().min(0).max(1).describe("Green (0-1)"),
          b: z.number().min(0).max(1).describe("Blue (0-1)"),
          a: z.number().min(0).max(1).describe("Alpha (0-1)"),
        }).optional().describe("Effect color (for shadows)"),
        blendMode: z.string().optional().describe("Blend mode"),
        offset: z.object({
          x: z.number().describe("X offset"),
          y: z.number().describe("Y offset"),
        }).optional().describe("Offset (for shadows)"),
        spread: z.number().optional().describe("Shadow spread (for shadows)"),
      })).describe("Array of effects to apply"),
    },
    async ({ nodeId, effects }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_effects", 
          { nodeId, effects }
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
              text: `Error setting effects: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  // Herramienta: set_effect_style_id
  server.registerTool(
    "set_effect_style_id",
    "Apply an effect style to a node in Figma",
    {
      nodeId: z.string().describe("The ID of the node to modify"),
      effectStyleId: z.string().describe("The ID of the effect style to apply"),
    },
    async ({ nodeId, effectStyleId }) => {
      try {
        const result = await requestManager.sendCommand(
          "set_effect_style_id", 
          { nodeId, effectStyleId }
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
              text: `Error applying effect style: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}