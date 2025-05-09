# Understanding the claude-talk-to-figma-mcp Plugin Structure

Before diving into the specific structure of the claude-talk-to-figma-mcp plugin, it's important to understand that this project is an adaptation of Sonny Lazuardi's cursor-talk-to-figma-mcp, modified to work with Claude Desktop instead of Cursor. The plugin enables seamless communication between Anthropic's Claude AI and Figma using the Model Context Protocol (MCP).

## Overall Architecture

The plugin follows a bidirectional communication architecture that can be visualized as:

```
+----------------+ +-------+ +---------------+ +---------------+
| VS Code Cline |<--->| MCP |<--->| WebSocket Srv |<--->| Figma Plugin |
| (AI Agent)    |     |     |     | (Port 3055)   |     | (UI Plugin)  |
+----------------+ +-------+ +---------------+ +---------------+
```

This architecture facilitates real-time communication between Claude AI and Figma through a WebSocket server[1].

## Repository Structure

Based on the available information, the repository has the following main directories:

### Plugin Files (`src/claude_mcp_plugin/`)

This directory contains the Figma plugin components, including:

- **manifest.json**: Defines the plugin's metadata, permissions, and entry points[1]
- **UI components**: While specific files are not detailed in the search results, typical Figma plugins include:
  - An HTML file for the plugin UI
  - CSS for styling
  - JavaScript for UI logic and Figma API interactions

### MCP Server (`src/talk_to_figma_mcp/`)

The MCP server implementation includes:

- **server.ts**: Main entry point that handles communication between Claude and the WebSocket server[1]
- **Tools modules**: Organized by functionality (document-tools.ts, creation-tools.ts, etc.)

### WebSocket Server (`src/socket.ts`)

A WebSocket server running on port 3055 that facilitates communication between the MCP server and the Figma plugin[1][7].

## Plugin Installation

To install the plugin in Figma:

1. Go to **Menu > Plugins > Development > New Plugin**
2. Select "Import plugin from manifest"
3. Navigate to and select `src/claude_mcp_plugin/manifest.json`[1]

## Plugin Functionality

The plugin supports numerous commands organized into categories:

1. **Read commands**: Retrieve document information, selection, node details, etc.
2. **Write commands**: Create, modify, or delete Figma elements
3. **Image commands**: Insert local and remote images
4. **Text & Font commands**: Manipulate text elements and typography
5. **Effect commands**: Apply visual effects to nodes
6. **Misc commands**: Group/ungroup nodes, export, join channel, etc.[1]

## Recent Updates

The plugin has seen regular updates, with recent versions (0.4.9 as of May 8, 2025) adding features like:

- Robust WebSocket reconnection logic
- Batch local-image insertion support
- Rectangle-to-frame conversion
- Separation of UI and protocol logic[1]

Previous updates (0.4.8, May 7, 2025) added gradient support, remote image insertion, and local image support[1].

## Communication Flow

1. A user prompts Claude with a command to interact with Figma
2. Claude passes the command to the MCP server
3. The MCP server sends the command to the WebSocket server
4. The WebSocket server forwards the command to the Figma plugin
5. The Figma plugin executes the command using the Figma API
6. Results flow back through the same channels to Claude[1][7]

This plugin represents a sophisticated integration between AI and design tools, allowing for powerful design automation and AI-assisted workflows through natural language commands.

To explore the detailed structure of specific files, you would need to examine the repository code directly, as the search results don't provide file-level details of the HTML, CSS, and JavaScript implementation.

Sources
[1] GitHub - eonist/claude-talk-to-figma-mcp: A Model Context Protocol (MCP) that allows any AI agent to interact directly with Figma https://github.com/eonist/claude-talk-to-figma-mcp
[2] arinspunk/claude-talk-to-figma-mcp - GitHub https://github.com/arinspunk/claude-talk-to-figma-mcp
[3] ProfSynapse/claudesidian-mcp - GitHub https://github.com/ProfSynapse/claudesidian-mcp
[4] How to convert a Figma design to code with Claude - PulseMCP https://www.pulsemcp.com/use-cases/figma-to-code/macoughl-claude-figma
[5] manifest.json is potentially sensitive · Issue #2876 · rails/webpacker https://github.com/rails/webpacker/issues/2876
[6] Figma - MCP Server https://www.magicslides.app/mcps/matthewdailey-figma
[7] sonnylazuardi/cursor-talk-to-figma-mcp - GitHub https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp
[8] Manifest file format - Chrome for Developers https://developer.chrome.com/docs/extensions/reference/manifest
[9] Claude MCP Server to work with figma - GitHub https://github.com/karthiks3000/figma-mcp-server
[10] manifest.json - Mozilla - MDN Web Docs https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json
[11] Cursor Talk To Figma MCP Plugin https://www.figma.com/community/plugin/1485687494525374295/cursor-talk-to-figma-mcp-plugin
[12] How do I reference a file in the manifest.json? : r/feedthebeast - Reddit https://www.reddit.com/r/feedthebeast/comments/pdjjya/how_do_i_reference_a_file_in_the_manifestjson/
[13] MatthewDailey/figma-mcp: ModelContextProtocol for ... - GitHub https://github.com/MatthewDailey/figma-mcp
[14] JSON Schema for manifest.json - UXP Plugin API https://forums.creativeclouddeveloper.com/t/json-schema-for-manifest-json/698
[15] Issues · sonnylazuardi/cursor-talk-to-figma-mcp - GitHub https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp/issues
[16] For Claude Desktop Users - Model Context Protocol https://modelcontextprotocol.io/quickstart/user
[17] Updating a Figma plugin with Claude Code - LinkedIn https://www.linkedin.com/learning/create-your-dream-apps-with-cursor-and-claude-ai/updating-a-figma-plugin-with-claude-code
[18] talk to figma mcp just got merged into the https://github.com ... https://www.threads.com/@sonnylazuardi/post/DJQm0fBvN1P/talk-to-figma-mcp-just-got-merged-into-the-httpsgithubcommodelcontextprotocolser
[19] The Easiest Way to Set Up MCP with Claude Desktop and Docker ... https://dev.to/suzuki0430/the-easiest-way-to-set-up-mcp-with-claude-desktop-and-docker-desktop-5o
[20] Updating a Figma Plugin with Claude Code https://designcode.io/cursor-updating-a-figma-plugin-with-claude-code/
[21] Figma Context MCP - Claude MCP Servers https://www.claudemcp.com/servers/figma-context-mcp
[22] How to Connect Claude AI to a Remote MCP Server - Apidog https://apidog.com/blog/claude-ai-remote-mcp-server/
[23] by ‹div›RIOTS — Import websites to Figma designs (web,html,css) https://www.figma.com/community/plugin/1159123024924461424/html-to-design-by-divriots-import-websites-to-figma-designs-web-html-css
[24] Multiline text feature https://it.edu.is-best.net/?question=git-1746489518952&update=1746403200026
[25] The Claude you'll never need to remind: MCP in action - QED42 https://www.qed42.com/insights/the-claude-youll-never-need-to-remind-mcp-in-action
[26] Talk to Figma MCP Server by Sonny Lazuardi - PulseMCP https://www.pulsemcp.com/servers/yhc984-talk-to-figma
[27] Absolutely Floored By MCP : r/ClaudeAI - Reddit https://www.reddit.com/r/ClaudeAI/comments/1ipjbf3/absolutely_floored_by_mcp/
[28] Webpack : errors with manifest.json - Stack Overflow https://stackoverflow.com/questions/64934897/webpack-errors-with-manifest-json
[29] sonnylazuardi/cursor-talk-to-figma-mcp - GitHub https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp
[30] claude-talk-to-figma-mcp on NPM https://libraries.io/npm/claude-talk-to-figma-mcp
[31] manifest.json not found · adonisjs · Discussion #4712 - GitHub https://github.com/orgs/adonisjs/discussions/4712
[32] MCP - Connect your AI tool to Figma https://html.to.design/docs/mcp-tab/
[33] Claude Code designing in Figma with MCP server and plug-in https://www.youtube.com/watch?v=1L1tSwJk30Y
[34] Missing manifest.json file in angular 12 - Stack Overflow https://stackoverflow.com/questions/70065567/missing-manifest-json-file-in-angular-12/76321014
[35] #figma #claude #mcp #ai #claude #ai #vibecoding | 😺Juan Maguid https://www.linkedin.com/posts/temperamento_figma-claude-mcp-activity-7320462080447262720-BZ1d
[36] Claude Code 30-min Tutorial: Coding a Figma to Code Plugin https://www.youtube.com/watch?v=DAR2CPfu7oQ
[37] GitHub - karthiks3000/figma-mcp-server: Claude MCP Server to work with figma https://github.com/karthiks3000/figma-mcp-server
[38] Integrate Figma with Claude & MCP - MCP Market https://mcpmarket.com/server/figma-2
[39] claude-chatgpt-mcp/index.ts at main · syedazharmbnr1/claude-chatgpt-mcp https://github.com/syedazharmbnr1/claude-chatgpt-mcp/blob/main/index.ts
[40] @hapins/figma-mcp https://www.npmjs.com/package/@hapins/figma-mcp
[41] claude-voice/manifest.json at main · softcery/claude-voice https://github.com/softcery/claude-voice/blob/main/manifest.json
[42] viktorbezdek/awesome-github-projects https://github.com/viktorbezdek/awesome-github-projects
[43] Claude Custom Prompts MCP Server - Create and use ... - GitHub https://github.com/minipuft/claude-prompts-mcp
[44] GitHub - tonycueva/claude-figma-mcp https://github.com/tonycueva/claude-figma-mcp
[45] Claude Code designing in Figma with MCP server and plug-in | Sonny Lazuardi https://www.linkedin.com/posts/sonnylazuardi_claude-code-designing-in-figma-with-mcp-server-activity-7308248516710027264-j_5K
[46] GitHub - smithery-ai/mcp-figma https://github.com/smithery-ai/mcp-figma
[47] Claude Talk To Figma Mcp AI Project Repository Download and Installation Guide https://www.aibase.com/repos/project/claude-talk-to-figma-mcp
[48] Sonny Lazuardi's Post - LinkedIn https://www.linkedin.com/posts/sonnylazuardi_just-wanted-to-share-my-latest-experiment-activity-7307821553654657024-yrh8
[49] Tutorials - Claude Code - Anthropic API https://docs.anthropic.com/en/docs/claude-code/tutorials
[50] MCP for PMs: How To Automate Figma → Jira (Epics, Stories) in 10 ... https://www.productcompass.pm/p/mcp-case-study-jira-figma
[51] Talk to Figma MCP – An MCP server integration that enables Cursor ... https://www.reddit.com/r/mcp/comments/1jfys3e/talk_to_figma_mcp_an_mcp_server_integration_that/
[52] mcp-figma/USAGE.md at main - GitHub https://github.com/smithery-ai/mcp-figma/blob/main/USAGE.md
[53] #mcp #aiagents #claude #opensource | Hitesh S. - LinkedIn https://www.linkedin.com/posts/ihiteshsharma_mcp-aiagents-claude-activity-7310192655215353857-jXfG
[54] TimHolden/figma-mcp-server: Model Context Protocol ... - GitHub https://github.com/TimHolden/figma-mcp-server
[55] Add insert_image support https://brainlybusiness.vercel.app/?question=git-1746556983803&update=1746489600033
[56] Figma MCP : AI for Figma - YouTube https://www.youtube.com/watch?v=3nYDUqlA13s
[57] Converting Figma designs with Cursor MCP - YouTube https://www.youtube.com/watch?v=X-aX1TuGP0s
[58] Sonny (@sonnylazuardi) / X https://x.com/sonnylazuardi?lang=en
[59] GLips/Figma-Context-MCP: MCP server to provide Figma ... - GitHub https://github.com/GLips/Figma-Context-MCP
[60] Figma MCP Server with full API functionality - GitHub https://github.com/thirdstrandstudio/mcp-figma
