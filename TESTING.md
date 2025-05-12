# Testing Guide for Claude Talk to Figma MCP

This document provides a detailed guide for testing the integration between Claude Desktop and Figma, as well as solutions to common problems.

## Prerequisites

Before starting the tests, make sure you have:

- Claude Desktop installed
- Figma account with plugin creation access
- Bun installed (v1.0.0 or higher)
- Permissions to install plugins in Figma

## Test Cases

### 1. Environment Setup

| Test case | Steps | Expected result |
| -------------- | ----- | ------------------ |
| Dependencies installation | Run `bun install` | All dependencies are installed without errors |
| Claude configuration | Run `bun run configure-claude` | Script executed correctly, successful configuration message |
| Verify configuration | Check `claude_desktop_config.json` file | Contains configuration for "ClaudeTalkToFigma" |

### 2. WebSocket Server Configuration

| Test case | Steps | Expected result |
| -------------- | ----- | ------------------ |
| Start WebSocket server | Run `bun socket` | Server starts on port 3055, shows confirmation message |
| Verify server status | Access `http://localhost:3055/status` | Returns JSON with "running" status and statistics |
| Test reconnection | Stop and restart the server | Client reconnects automatically |

### 3. Figma Plugin Setup

#### Install the Figma Plugin

1. Open Figma and go to **Menu > Plugins > Development > New Plugin**
2. Select "Link existing plugin"
3. Navigate to and select the folder `src/conduit_mcp_plugin` from this repository

#### Connect Plugin to WebSocket Server

1. The plugin will ask for a port number (default: 3055)
2. Enter the port number where your WebSocket server is running
3. Click "Connect"
4. You should see a "Connected to Claude MCP server" message

#### Integration Test

To test if the Figma plugin is correctly communicating with the Claude MCP server:

1. Start the WebSocket server
2. Open Figma and run the Claude MCP Plugin from your Development plugins
3. Connect to the WebSocket server 
4. Open Claude Desktop and select the "ClaudeTalkToFigma" MCP
5. Test a simple command in Claude like: "Can you show me information about my current Figma document?"

Claude should be able to communicate with Figma and return information about the document.

### 4. Claude-MCP-Figma Integration Tests

| Test case | Steps | Expected result |
| -------------- | ----- | ------------------ |
| Get document info | Ask Claude about the open document | Claude returns information about the document |
| Get selection | Select element in Figma and ask Claude | Claude returns details of the selected element |
| Create element | Ask Claude to create a rectangle | Rectangle created in Figma document |
| Modify element | Ask Claude to change color of an element | Element color changed correctly |
| Complex operation | Ask Claude to find text and modify it | Text correctly modified in multiple nodes |

## Common Problems and Solutions

### Connection Problems

| Problem | Possible cause | Solution |
| -------- | ------------- | -------- |
| "Cannot connect to WebSocket server" | Server is not running | Run `bun socket` in terminal |
| "Connection error: port in use" | Port 3055 is occupied | Free the port or change port configuration |
| "Cannot connect from plugin" | CORS restrictions | Verify that the plugin uses the correct domain |
| "Connection rejected" | Firewall blocking connection | Allow connections to port 3055 in firewall |

### Problems with Claude Desktop

| Problem | Possible cause | Solution |
| -------- | ------------- | -------- |
| "MCP does not appear in Claude Desktop" | Incorrect configuration | Verify configuration file and run `bun run configure-claude` |
| "Claude does not respond to Figma commands" | MCP not selected | Select "ClaudeTalkToFigma" in the MCPs menu |
| "Error executing MCP command" | Missing dependencies | Reinstall with `bun install` |
| "Claude cannot execute commands in Figma" | Channel not joined | Verify that `join_channel` was executed |

### Problems with Figma

| Problem | Possible cause | Solution |
| -------- | ------------- | -------- |
| "Plugin does not appear in Figma" | Incorrect import | Verify path and reimport the plugin |
| "Error executing commands in Figma" | Insufficient permissions | Verify permissions in manifest.json |
| "Cannot modify elements" | Document in read-only mode | Open document in edit mode |
| "Error creating elements" | Incorrect selection | Verify that the target page or frame is selected |

## Diagnostics and Debugging

### Diagnostic Tools

1. **WebSocket Server Logs**:
   - Detailed logs are shown in the terminal where you run `bun socket`
   - Look for ERROR or WARN messages to identify problems

2. **Status Endpoint**:
   - Access `http://localhost:3055/status` to verify statistics
   - Check active connections and accumulated errors

3. **Figma Console**:
   - Open the development console in Figma (F12 or Cmd+Option+I)
   - Review error messages related to the plugin

4. **Configuration Verification**:
   - Examine `claude_desktop_config.json` to confirm correct configuration

### Systematic Debugging Steps

1. **Verify Individual Components**:
   - Confirm that the WebSocket server is running
   - Verify that the Figma plugin can be opened
   - Check that Claude Desktop recognizes the MCP

2. **Test Communication in Parts**:
   - Test the plugin's connection to the WebSocket directly
   - Verify that Claude can execute basic MCP commands
   - Confirm that commands reach the Figma plugin

3. **Restart Components in Order**:
   - Restart the WebSocket server
   - Reload the plugin in Figma
   - Restart Claude Desktop

4. **Update Versions**:
   - Make sure you have the latest versions of all dependencies
   - Verify compatibility with the current version of Figma

## Comprehensive Testing Checklist

- [ ] Claude Desktop configuration completed
- [ ] WebSocket server started and running
- [ ] Figma plugin installed and connected
- [ ] Claude Desktop can get document information
- [ ] Claude Desktop can get current selection
- [ ] Claude Desktop can create new elements
- [ ] Claude Desktop can modify existing elements
- [ ] Claude Desktop can scan and modify text
- [ ] The system recovers correctly from disconnections
- [ ] Errors are handled and reported correctly
