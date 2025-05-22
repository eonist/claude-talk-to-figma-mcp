import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FigmaClient } from "../../../clients/figma-client/index.js";
import { MCP_COMMANDS } from "../../../types/commands.js";

/**
 * Registers style info read command on the MCP server.
 *
 * This function adds a tool named "get_styles" to the MCP server,
 * enabling retrieval of all styles from the current Figma document.
 * It executes the corresponding Figma command and returns the styles info as JSON.
 *
 * @param {McpServer} server - The MCP server instance to register the tool on.
 * @param {FigmaClient} figmaClient - The Figma client used to execute commands against the Figma API.
 *
 * @returns {void} This function does not return a value but registers the tool asynchronously.
 *
 * @example
 * registerStyleTools(server, figmaClient);
 */
export function registerStyleTools(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.GET_DOC_STYLE,
    `Get all styles from the current Figma document.

Returns:
  - content: Array of objects. Each object contains a type: "text" and a text field with the styles info as JSON.
`,
    {},
    {
      title: "Get Doc Style",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        {}
      ]),
      edgeCaseWarnings: [
        "Returns an empty array if no styles exist.",
        "Result includes all color, text, and effect styles.",
        "Large documents may return a large JSON object."
      ],
      extraInfo: "Use this command to list all shared styles in the current Figma document."
    },
    async () => {
      try {
        // Use executeCommand directly to avoid issues if getStyles is not present on the type
        const result = await figmaClient.executeCommand(MCP_COMMANDS.GET_DOC_STYLE, {});
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
              text: `Error getting styles: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * Registers get_node_styles (single or batch) on the MCP server.
 */
export function registerNodeStylesTool(server: McpServer, figmaClient: FigmaClient) {
  server.tool(
    MCP_COMMANDS.GET_NODE_STYLE,
    `Get all style properties (fills, strokes, effects, text styles, style IDs, etc.) for one or more nodes.

Returns:
  - Array of { nodeId, styles } objects, one per node.
`,
    {
      nodeId: require("zod").z.string().optional(),
      nodeIds: require("zod").z.array(require("zod").z.string()).optional()
    },
    {
      title: "Get Node Style (Unified)",
      idempotentHint: true,
      destructiveHint: false,
      readOnlyHint: true,
      openWorldHint: false,
      usageExamples: JSON.stringify([
        { nodeId: "123:456" },
        { nodeIds: ["123:456", "789:101"] }
      ]),
      edgeCaseWarnings: [
        "Returns an error if any nodeId is invalid or not found.",
        "Result is an array of { nodeId, styles } objects (even for single)."
      ],
      extraInfo: "Use this command to inspect all style properties of one or more nodes."
    },
    async ({ nodeId, nodeIds }) => {
      let ids: string[] = [];
      if (Array.isArray(nodeIds) && nodeIds.length > 0) {
        ids = nodeIds;
      } else if (nodeId) {
        ids = [nodeId];
      } else {
        return { content: [{ type: "text", text: "You must provide either nodeId or nodeIds." }] };
      }
      const results = [];
      for (const id of ids) {
        try {
          const node = await figmaClient.executeCommand(MCP_COMMANDS.GET_NODE_INFO, { nodeId: id });
          if (!node) {
            results.push({ nodeId: id, error: "Node not found" });
            continue;
          }
          // Extract style properties
          const styles: any = {};
          // Paint styles
          if (node.fills) styles.fills = node.fills;
          if (node.strokes) styles.strokes = node.strokes;
          if (node.fillStyleId) styles.fillStyleId = node.fillStyleId;
          if (node.strokeStyleId) styles.strokeStyleId = node.strokeStyleId;
          // Effect styles
          if (node.effects) styles.effects = node.effects;
          if (node.effectStyleId) styles.effectStyleId = node.effectStyleId;
          // Text styles
          if (node.fontName) styles.fontName = node.fontName;
          if (node.fontSize) styles.fontSize = node.fontSize;
          if (node.fontWeight) styles.fontWeight = node.fontWeight;
          if (node.letterSpacing) styles.letterSpacing = node.letterSpacing;
          if (node.lineHeight) styles.lineHeight = node.lineHeight;
          if (node.paragraphSpacing) styles.paragraphSpacing = node.paragraphSpacing;
          if (node.textCase) styles.textCase = node.textCase;
          if (node.textDecoration) styles.textDecoration = node.textDecoration;
          if (node.textStyleId) styles.textStyleId = node.textStyleId;
          // Add more as needed

          results.push({ nodeId: id, styles });
        } catch (error) {
          results.push({ nodeId: id, error: error instanceof Error ? error.message : String(error) });
        }
      }
      return { content: [{ type: "text", text: JSON.stringify(results) }] };
    }
  );
}
