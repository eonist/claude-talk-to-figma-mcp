/**
 * Workflow-related prompts for Figma
 * 
 * These prompts provide guidance on design workflows,
 * collaboration processes, and efficiency techniques.
 */

import { FigmaMcpServer } from "../../core/server/mcp-server";
import { logger } from "../../utils/logger";

/**
 * Register workflow-related prompts in the MCP server
 * 
 * @param server Instance of the MCP server
 */
export function registerWorkflowPrompts(server: FigmaMcpServer): void {
  logger.info("Registering workflow prompts...");

  // Collaboration Workflow Prompt
  server.registerPrompt(
    "collaboration_workflow",
    "Best practices for team collaboration in Figma",
    (extra) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `When collaborating with teams in Figma, follow these best practices:

1. File Organization:
   - Use clear file naming conventions
   - Create a logical page structure
   - Use sections to organize content within pages
   - Consider separating work-in-progress from finalized designs

2. Component Management:
   - Create team libraries for shared components
   - Document component usage guidelines
   - Establish update protocols for shared components
   - Use consistent naming conventions

3. Communication:
   - Use comments for specific feedback
   - Create dedicated pages for exploration and alternatives
   - Document key decisions directly in the file
   - Use presentation view for reviews

4. Version Control:
   - Use branching for significant changes
   - Create regular version snapshots
   - Document version history changes
   - Maintain an archive of major iterations

5. Access Management:
   - Set appropriate permission levels
   - Use view-only links for stakeholders when appropriate
   - Control edit access to production libraries
   - Consider creating templates for common workflows

6. Review Process:
   - Establish clear review cycles
   - Create a dedicated space for feedback
   - Document resolved comments
   - Use presentation features for stakeholder reviews

7. Handoff Coordination:
   - Maintain consistent handoff documentation
   - Establish clear completion criteria
   - Schedule regular sync meetings with development
   - Create implementation notes within the file

Would you like me to help establish a specific aspect of your team's Figma workflow?`,
            },
          },
        ],
        description: "Best practices for team collaboration in Figma",
      };
    }
  );

  // Design System Workflow Prompt
  server.registerPrompt(
    "design_system_workflow",
    "Strategies for maintaining design systems in Figma",
    (extra) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `When managing a design system in Figma, follow these workflow strategies:

1. System Architecture:
   - Separate libraries by purpose (core, components, templates)
   - Establish clear relationships between libraries
   - Create a versioning strategy for each library
   - Document system architecture for the team

2. Component Management:
   - Establish component creation guidelines
   - Create a component proposal process
   - Document component properties and variants
   - Define testing procedures for new components

3. Governance:
   - Define roles and responsibilities
   - Create clear approval processes
   - Establish update schedules and cadence
   - Document deprecation procedures

4. Documentation:
   - Maintain up-to-date usage guidelines
   - Create component documentation templates
   - Document design principles and decisions
   - Keep a changelog of system updates

5. Quality Assurance:
   - Regular audits of design system usage
   - Automated checks for inconsistencies when possible
   - User testing for component usability
   - Performance monitoring of the design system

6. Collaboration:
   - Regular sync meetings with system stakeholders
   - Clear communication channels for system updates
   - Feedback collection mechanisms
   - Training resources for new team members

7. Evolution and Maintenance:
   - Plan for system growth and scaling
   - Establish processes for handling breaking changes
   - Create migration guides when necessary
   - Regularly review and refine the system

Would you like me to help with a specific aspect of your design system workflow?`,
            },
          },
        ],
        description: "Strategies for maintaining design systems in Figma",
      };
    }
  );

  // Efficiency Workflow Prompt
  server.registerPrompt(
    "efficiency_workflow",
    "Techniques for efficient design workflows in Figma",
    (extra) => {
      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `To maximize efficiency in your Figma workflow, consider these techniques:

1. Keyboard Shortcuts:
   - Learn essential keyboard shortcuts
   - Create custom shortcuts for frequent actions
   - Use Quick Actions (Cmd/Ctrl + /) for command search
   - Master selection shortcuts for faster editing

2. Component Strategy:
   - Create components for all repeated elements
   - Use variants for related component states
   - Leverage component properties for customization
   - Set up component auto-layout for flexibility

3. Styles and Libraries:
   - Create color styles for all colors in use
   - Establish text styles for typography system
   - Use effect styles for shadows and other effects
   - Build and maintain organized team libraries

4. Auto Layout:
   - Use auto layout for all UI components
   - Create responsive frames with constraints
   - Leverage padding and spacing properties
   - Build nested auto layouts for complex components

5. Templates and Presets:
   - Create templates for common design tasks
   - Save common configurations as starting points
   - Use preset frames for standard screen sizes
   - Build layout grids for consistent spacing

6. Organization Techniques:
   - Use a consistent naming system
   - Group related layers together
   - Use sections to organize pages
   - Hide unused layers instead of deleting them

7. Plugins and Tools:
   - Integrate useful plugins for repetitive tasks
   - Use variables for dynamic design elements
   - Leverage interactive components for prototyping
   - Explore AI tools for content generation

Would you like specific suggestions for improving efficiency in a particular area of your workflow?`,
            },
          },
        ],
        description: "Techniques for efficient design workflows in Figma",
      };
    }
  );
}