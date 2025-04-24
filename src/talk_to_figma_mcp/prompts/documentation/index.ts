/**
 * Documentation-related prompts for Figma
 * 
 * These prompts provide guidance on documenting designs,
 * creating style guides, and maintaining design system documentation.
 */

import { FigmaMcpServer } from "../../core/server/mcp-server";
import { logger } from "../../utils/logger";

/**
 * Register documentation-related prompts in the MCP server
 * 
 * @param server Instance of the MCP server
 */
export function registerDocumentationPrompts(server: FigmaMcpServer): void {
  logger.info("Registering documentation prompts...");

  // Style Guide Prompt
  server.registerPrompt(
    "style_guide_strategy",
    "Best practices for creating style guides in Figma",
    (extra) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `When creating style guides in Figma, follow these best practices:

1. Core Elements:
   - Document color palettes with hex/RGB values
   - Show typography scales with font families, weights, and sizes
   - Include spacing scales and layout grids
   - Document icon styles and usage guidelines

2. Component Documentation:
   - Show all variants of each component
   - Include descriptions of when to use each component
   - Document component anatomy
   - Show examples of correct and incorrect usage

3. Organization:
   - Create separate pages for different aspects of the system
   - Use consistent layout for documentation
   - Include a table of contents
   - Add section dividers for easy navigation

4. Visual Examples:
   - Show components in context
   - Include annotations explaining design decisions
   - Demonstrate responsive behavior
   - Use realistic content in examples

5. Naming and Structure:
   - Use clear naming conventions
   - Organize similar elements together
   - Create a logical hierarchy
   - Use consistent formatting for documentation text

6. Maintenance:
   - Set update frequency for documentation
   - Track versioning of the style guide
   - Note who maintains each section
   - Include process for requesting new components

Would you like me to help you create a specific section of your style guide?`,
            },
          },
        ],
        description: "Best practices for creating style guides in Figma",
      };
    }
  );

  // Handoff Prompt
  server.registerPrompt(
    "developer_handoff_strategy",
    "Best practices for design-to-developer handoff in Figma",
    (extra) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `When preparing designs for developer handoff in Figma, follow these best practices:

1. Organization and Structure:
   - Group related elements logically
   - Use descriptive layer names
   - Create separate pages for different app sections
   - Ensure components are properly created and used consistently

2. Asset Preparation:
   - Mark exportable elements
   - Set appropriate export settings (format, size)
   - Organize icons and images consistently
   - Consider providing assets in multiple resolutions when needed

3. Responsive Considerations:
   - Document how elements should behave across breakpoints
   - Show examples at different screen sizes
   - Include auto layout parameters
   - Document constraints and resizing behavior

4. Interaction Specifications:
   - Document state changes
   - Specify animation timings and easing
   - Include hover/focus/pressed states
   - Provide details on transitions between screens

5. Design Tokens:
   - Document color variables
   - Provide text styles with all properties
   - Include spacing scales
   - Document effect styles (shadows, etc.)

6. Accessibility Information:
   - Include color contrast ratios
   - Document focus states
   - Note keyboard navigation considerations
   - Specify alt text for images

7. Documentation and Notes:
   - Add annotations for complex interactions
   - Include references to design patterns or guidelines
   - Document edge cases
   - Add comments for implementation details

8. Communication:
   - Schedule handoff meetings
   - Be available for questions
   - Provide context for design decisions
   - Collaborate on implementation challenges

Would you like me to assist with preparing any specific part of your design for handoff?`,
            },
          },
        ],
        description: "Best practices for design-to-developer handoff in Figma",
      };
    }
  );
}