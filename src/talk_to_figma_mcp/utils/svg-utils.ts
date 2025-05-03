import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './logger.js';

/**
 * SVG file operations and utilities
 */
export class SvgUtils {
  /**
   * Reads an SVG file and returns its contents
   * 
   * @param {string} filePath - Path to the SVG file
   * @returns {Promise<string>} The SVG content as a string
   */
  static async readSvgFile(filePath: string): Promise<string> {
    try {
      // Ensure the path is resolved correctly
      const resolvedPath = path.resolve(filePath);
      logger.debug(`Reading SVG file from: ${resolvedPath}`);
      
      // Check if file exists
      try {
        await fs.access(resolvedPath);
      } catch (error) {
        throw new Error(`File does not exist at path: ${resolvedPath}`);
      }
      
      // Read the file
      const content = await fs.readFile(resolvedPath, 'utf8');
      
      // Validate it looks like SVG
      if (!content.includes('<svg') || !content.includes('</svg>')) {
        throw new Error('File does not appear to contain valid SVG content');
      }
      
      logger.debug(`Successfully read SVG file (${content.length} characters)`);
      return content;
    } catch (error) {
      logger.error(`SVG file reading error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to read SVG file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Validates if a string contains valid SVG content
   * 
   * @param {string} svgContent - The string to validate as SVG
   * @returns {boolean} True if the content appears to be valid SVG
   */
  static isValidSvgContent(svgContent: string): boolean {
    if (!svgContent || typeof svgContent !== 'string') {
      return false;
    }
    
    // Basic validation - should contain opening and closing SVG tags
    return svgContent.includes('<svg') && svgContent.includes('</svg>');
  }
  
  /**
   * Gets only the filename portion from a path
   * Useful for setting default names when importing SVGs
   * 
   * @param {string} filePath - Full path to the SVG file
   * @returns {string} Filename without extension
   */
  static getSvgFilename(filePath: string): string {
    const basename = path.basename(filePath);
    return path.parse(basename).name || "SVG Vector";
  }
}
