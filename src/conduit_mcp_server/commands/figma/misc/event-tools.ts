import { McpServer } from "../../../server.js";
import { FigmaClient } from "../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";
import { UnifiedEventSchema } from "./schema/event-schema.js";

export function registerEventCommands(server: McpServer, figmaClient: FigmaClient) {
  // In-memory subscription registry: { [subscriptionId]: { eventType, filter, client } }
  const subscriptions = {};

  // subscribe_event: subscribe or unsubscribe to an event type
  server.tool(
    MCP_COMMANDS.SUBSCRIBE_EVENT,
    `Subscribe or unsubscribe to a Figma event (e.g., selection_change, document_change).

Returns: { subscriptionId } for subscribe, { success: true } for unsubscribe`,
    UnifiedEventSchema.shape,
    async (params: any, context: any) => {
      if (params.subscribe) {
        const subscriptionId = "sub-" + Math.random().toString(36).slice(2, 10);
        (subscriptions as Record<string, any>)[subscriptionId] = {
          eventType: params.eventType,
          filter: params.filter,
          client: context.client // context.client is the WebSocket or session
        };
        const result = {
          success: true,
          results: [{ subscriptionId }]
        };
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } else {
        if (params.subscriptionId && (subscriptions as Record<string, any>)[params.subscriptionId]) {
          delete (subscriptions as Record<string, any>)[params.subscriptionId];
          const result = {
            success: true,
            results: [{ subscriptionId: params.subscriptionId, unsubscribed: true }]
          };
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        } else {
          const errorResult = {
            success: false,
            error: {
              message: "Invalid or missing subscriptionId",
              results: [],
              meta: {
                operation: "unsubscribe_event",
                params
              }
            }
          };
          return { content: [{ type: "text", text: JSON.stringify(errorResult) }] };
        }
      }
    }
  );

  // Internal: handle event messages from plugin and forward to subscribers
  (figmaClient as any).onEvent = function(eventType: any, payload: any) {
    Object.keys(subscriptions).forEach((subId) => {
      const sub = (subscriptions as Record<string, any>)[subId];
      if (sub.eventType === eventType) {
        // Optionally filter payload here
        sub.client.send(JSON.stringify({
          event: eventType,
          payload: payload,
          subscriptionId: subId
        }));
      }
    });
  };
}
