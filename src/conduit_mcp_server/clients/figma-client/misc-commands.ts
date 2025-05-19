/**
 * Miscellaneous Figma commands for FigmaClient.
 */
import { MCP_COMMANDS } from "../types/commands.js";

export const miscCommands = {
  /**
   * Duplicate a Figma page and all its children as a new page.
   * @param {string} pageId - The ID of the page to duplicate.
   * @param {string} [newPageName] - Optional name for the new page.
   * @returns {Promise<{ newPageId: string, newPageName: string, clonedIds: string[] }>}
   */
  async duplicatePage(this: any, pageId: string, newPageName?: string) {
    if (!pageId) throw new Error("Missing pageId parameter");
    return await this.executeCommand(MCP_COMMANDS.DUPLICATE_PAGE, { pageId, newPageName });
  }
};
