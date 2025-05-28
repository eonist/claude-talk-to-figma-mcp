import { z } from "zod";

/**
 * Schema for unified event handling in the application.
 * Supports both one-time events and subscription-based events.
 * 
 * @example
 * ```
 * // One-time event
 * const event = { eventType: "node_selected", subscribe: false };
 * 
 * // Subscription event
 * const subscription = { 
 *   eventType: "selection_change", 
 *   subscribe: true, 
 *   subscriptionId: "sub_123" 
 * };
 * ```
 */
export const UnifiedEventSchema = z.object({
  /** The type of event to handle (e.g., "node_selected", "selection_change") */
  eventType: z.string(),
  
  /** Optional filter criteria to apply to the event */
  filter: z.any().optional(),
  
  /** Whether this is a subscription-based event that will fire multiple times */
  subscribe: z.boolean(),
  
  /** Unique identifier for the subscription (required when subscribe is true) */
  subscriptionId: z.string().optional()
});
