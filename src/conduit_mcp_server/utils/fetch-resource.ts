/**
 * Utility to fetch text resources (SVG, etc.) from a URL.
 * Throws an error if the fetch fails or the response is not text.
 */

import fetch from "node-fetch";

/**
 * Fetches a text resource from a URL.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<string>} - The response text.
 * @throws {Error} - If the fetch fails or the response is not text.
 */
export async function fetchTextResource(url: string): Promise<string> {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    throw new Error("Invalid URL for fetchTextResource");
  }
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to fetch resource: ${url} (status ${res.status})`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text") && !contentType.includes("svg")) {
    throw new Error(`Resource at ${url} is not a text or SVG file (content-type: ${contentType})`);
  }
  return await res.text();
}
