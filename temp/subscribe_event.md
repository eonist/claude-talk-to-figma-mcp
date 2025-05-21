### subscribe_event
Subscribe to or unsubscribe from a Figma event (e.g., selection_change, document_change).

**Parameters:**
- eventType (string): Event type to subscribe to (e.g., "selection_change", "document_change").
- filter (object, optional): Optional filter for event payloads.
- subscribe (boolean): true to subscribe, false to unsubscribe.
- subscriptionId (string, optional): The subscription ID to remove (required for unsubscribe).

**Returns:**
- content: For subscribe: { subscriptionId }, for unsubscribe: { success: true }.

**Example:**
```json
{ "eventType": "selection_change", "subscribe": true }
```
```json
{ "eventType": "selection_change", "subscribe": false, "subscriptionId": "sub123" }
```
