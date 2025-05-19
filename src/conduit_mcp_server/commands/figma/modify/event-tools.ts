import { McpServer } from "../../../../server.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "zod";
import { MCP_COMMANDS } from "../../../types/commands.js";

const UnifiedEventSchema = z.object({
  eventType: z.string(),
  filter: z.any().optional(),
  subscribe: z.boolean(),
  subscriptionId: z.string().optional()
});

export function registerEventCommands(server: McpServer, figmaClient: FigmaClient) {
  // In-memory subscription registry: { [subscriptionId]: { eventType, filter, client } }
  const subscriptions = {};

  // subscribe_event: subscribe or unsubscribe to an event type
  server.tool(
    MCP_COMMANDS.SUBSCRIBE_EVENT,
    `Subscribe or unsubscribe to a Figma event (e.g., selection_change, document_change).

Parameters:
- eventType (string): Event type to subscribe to (e.g., "selection_change", "document_change")
- filter (object, optional): Optional filter for event payloads
- subscribe (boolean): true to subscribe, false to unsubscribe
- subscriptionId (string, required for unsubscribe): The subscription ID to remove

Returns: { subscriptionId } for subscribe, { success: true } for unsubscribe`,
    UnifiedEventSchema,
    async (params, context) => {
      if (params.subscribe) {
        const subscriptionId = "sub-" + Math.random().toString(36).slice(2, 10);
        subscriptions[subscriptionId] = {
          eventType: params.eventType,
          filter: params.filter,
          client: context.client // context.client is the WebSocket or session
        };
        return { subscriptionId };
      } else {
        if (params.subscriptionId && subscriptions[params.subscriptionId]) {
          delete subscriptions[params.subscriptionId];
          return { success: true };
        } else {
          return { success: false, error: "Invalid or missing subscriptionId" };
        }
      }
    }
  );

  // Internal: handle event messages from plugin and forward to subscribers
  figmaClient.onEvent = function(eventType, payload) {
    Object.keys(subscriptions).forEach((subId) => {
      const sub = subscriptions[subId];
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
