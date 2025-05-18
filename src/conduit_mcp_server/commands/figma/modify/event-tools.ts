import { McpServer } from "../../../../server.js";
import { FigmaClient } from "../../../../clients/figma-client.js";
import { z } from "zod";

// Event subscription schema
const SubscribeEventSchema = z.object({
  eventType: z.string(),
  filter: z.any().optional()
});
const UnsubscribeEventSchema = z.object({
  subscriptionId: z.string()
});

export function registerEventCommands(server: McpServer, figmaClient: FigmaClient) {
  // In-memory subscription registry: { [subscriptionId]: { eventType, filter, client } }
  const subscriptions = {};

  // subscribe_event: subscribe to an event type
  server.tool(
    "subscribe_event",
    `Subscribe to a Figma event (e.g., selection_change, document_change).

Parameters:
- eventType (string): Event type to subscribe to (e.g., "selection_change", "document_change")
- filter (object, optional): Optional filter for event payloads

Returns: { subscriptionId }`,
    SubscribeEventSchema,
    async (params, context) => {
      const subscriptionId = "sub-" + Math.random().toString(36).slice(2, 10);
      subscriptions[subscriptionId] = {
        eventType: params.eventType,
        filter: params.filter,
        client: context.client // context.client is the WebSocket or session
      };
      return { subscriptionId };
    }
  );

  // unsubscribe_event: unsubscribe from an event
  server.tool(
    "unsubscribe_event",
    `Unsubscribe from a previously subscribed event.

Parameters:
- subscriptionId (string): The subscription ID to remove

Returns: { success: true }`,
    UnsubscribeEventSchema,
    async (params) => {
      delete subscriptions[params.subscriptionId];
      return { success: true };
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
