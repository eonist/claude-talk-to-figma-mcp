/**
 * Interaction-related prompts for Figma
 * 
 * These prompts provide guidance on interaction design,
 * prototyping, and user flows in Figma.
 */

import { FigmaMcpServer } from "../../core/server/mcp-server";
import { logger } from "../../utils/logger";

/**
 * Register interaction-related prompts in the MCP server
 * 
 * @param server Instance of the MCP server
 */
export function registerInteractionPrompts(server: FigmaMcpServer): void {
  logger.info("Registering interaction prompts...");

  // User Flow Prompt
  server.registerPrompt(
    "user_flow_strategy",
    "Best practices for creating user flows in Figma",
    (extra) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `When creating user flows in Figma, follow these best practices:

1. Start with Clear Objectives:
   - Define what user task or journey you're mapping
   - Identify the starting point and end goal
   - Consider different user personas and their paths

2. Structural Approach:
   - Create dedicated frames for each screen state
   - Use arrows or connection lines to show progression
   - Group related screens in larger parent frames

3. Navigation Patterns:
   - Illustrate how users move between screens
   - Show different entry and exit points
   - Indicate gestures or actions that trigger transitions

4. Decision Points:
   - Map out branches for different user choices
   - Show what happens after success or failure states
   - Include edge cases and error handling flows

5. Feedback Loops:
   - Show how the system provides feedback to users
   - Include loading states and transitions
   - Map out confirmation steps for important actions

6. Organization Tips:
   - Use consistent spacing between screens
   - Label each step in the flow
   - Use color coding to indicate different types of screens or states

Would you like me to help you map out a specific user flow for your project?`,
            },
          },
        ],
        description: "Best practices for creating user flows in Figma",
      };
    }
  );

  // Prototype Prompt
  server.registerPrompt(
    "prototype_strategy",
    "Guidance for creating interactive prototypes in Figma",
    (extra) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `When creating interactive prototypes in Figma, consider these guidelines:

1. Plan Your Interactions:
   - Determine the key interactions needed
   - Map connections between frames/screens
   - Decide on transition types for different actions

2. Create Reusable Components:
   - Build interactive components for common elements
   - Use variants for different component states
   - Create consistent hover/pressed states

3. State Management:
   - Create separate frames for each state (default, hover, active, etc.)
   - Consider empty states and loading indicators
   - Plan error states and recovery flows

4. Micro-interactions:
   - Add subtle animations to enhance usability
   - Use smart animate for smooth transitions
   - Keep transitions consistent for similar actions

5. Testing Considerations:
   - Create a prototype starting point
   - Test flows on different devices
   - Get feedback and iterate

6. Organization:
   - Name all prototype connections
   - Group related screens together
   - Add annotations to explain complex interactions

Would you like to focus on any particular aspect of prototyping for your project?`,
            },
          },
        ],
        description: "Guidance for creating interactive prototypes in Figma",
      };
    }
  );
}