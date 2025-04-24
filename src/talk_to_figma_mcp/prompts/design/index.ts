/**
 * Design-related prompts for Figma
 * 
 * These prompts provide guidance on design best practices,
 * strategies, and approaches for working with Figma.
 */

import { FigmaMcpServer } from "../../core/server/mcp-server";
import { logger } from "../../utils/logger";

/**
 * Register design-related prompts in the MCP server
 * 
 * @param server Instance of the MCP server
 */
export function registerDesignPrompts(server: FigmaMcpServer): void {
  logger.info("Registering design prompts...");

  // Design Strategy Prompt
  server.registerPrompt(
    "design_strategy",
    "Best practices for working with Figma designs",
    (extra) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `When working with Figma designs, follow these best practices:

1. Start with Document Structure:
   - First use get_document_info() to understand the current document
   - Plan your layout hierarchy before creating elements
   - Create a main container frame for each screen/section

2. Naming Conventions:
   - Use descriptive, semantic names for all elements
   - Follow a consistent naming pattern (e.g., "Login Screen", "Logo Container", "Email Input")
   - Group related elements with meaningful names

3. Working with Components:
   - Use components for reusable elements
   - Create component variants for different states/options
   - Understand both local and remote components

4. Layout Considerations:
   - Use auto layout for responsive designs
   - Consider different screen sizes and orientations
   - Use constraints appropriately to control how elements resize

5. Text and Typography:
   - Load fonts before manipulating text
   - Use text styles for consistency
   - Consider readability and accessibility guidelines

6. Visual Hierarchy:
   - Use size, color, and position to establish importance
   - Create clear relationships between elements
   - Ensure sufficient contrast for readability

7. Color Management:
   - Use color styles consistently
   - Consider color psychology and brand guidelines
   - Ensure sufficient contrast ratios for accessibility

8. Effects and Visual Polish:
   - Use shadows to create depth sparingly
   - Apply consistent corner radii
   - Use subtle effects to enhance usability, not distract

9. Accessibility:
   - Choose accessible color combinations
   - Use appropriate text sizes for readability
   - Consider how the design will work for users with disabilities

10. Performance:
    - Optimize component usage
    - Be mindful of complex vector shapes
    - Use appropriate image formats and sizes

When you need my help with Figma, tell me about the specific design task or problem, and we'll work through it methodically using these principles.`,
            },
          },
        ],
        description: "Best practices for working with Figma designs",
      };
    }
  );

  // Layout Strategy Prompt
  server.registerPrompt(
    "layout_strategy",
    "Strategies for creating effective layouts in Figma",
    (extra) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `When creating layouts in Figma, consider these strategies:

1. Use Auto Layout:
   - Implement horizontal or vertical auto layout with the set_auto_layout tool
   - Set appropriate spacing between elements
   - Configure padding for proper spacing around content
   - Use alignment options to create consistent layouts

2. Frame Structure:
   - Create parent frames for major sections
   - Nest related elements within appropriate containers
   - Use consistent sizing and spacing for related elements

3. Grid Systems:
   - Implement column grids for consistency
   - Consider using a baseline grid for text alignment
   - Maintain consistent margins and gutters

4. Responsive Considerations:
   - Use constraints to control how elements resize
   - Create variants for different screen sizes
   - Test layouts at multiple dimensions

5. Spacing:
   - Apply consistent spacing using a scale (e.g., 4px, 8px, 16px, 32px)
   - Use more spacing for separating sections, less for related elements
   - Ensure text has appropriate room to breathe

Let me know which aspect of layout you'd like to focus on, and I can provide more specific guidance.`,
            },
          },
        ],
        description: "Strategies for creating effective layouts in Figma",
      };
    }
  );
}