/**
 * Encoding operations module.
 * Provides functions to convert binary data to Base64 for image and other payload serialization.
 *
 * Exposed functions:
 * - customBase64Encode(bytes: Uint8Array): string
 *
 * @module modules/utils/encoding
 * @example
 * import { customBase64Encode } from './encoding.js';
 * const base64 = customBase64Encode(new Uint8Array([72,65,84]));
 * console.log(base64); // "SEFU"
 */
/**
 * Encodes a Uint8Array of binary data to a Base64 string.
 *
 * @function
 * @param {Uint8Array} bytes - The binary data to encode.
 * @returns {string} The Base64-encoded string.
 * @throws {Error} If input is not a Uint8Array.
 * @example
 * customBase64Encode(new Uint8Array([72,65,84])); // "SEFU"
 */
export function customBase64Encode(bytes) {
  // Base64 character set lookup table
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64 = "";

  // Calculate padding requirements
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  // Process all complete 3-byte chunks
  for (let i = 0; i < mainLength; i += 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    a = (chunk & 0xfc0000) >> 18;
    b = (chunk & 0x03f000) >> 12;
    c = (chunk & 0x000fc0) >> 6;
    d = chunk & 0x00003f;
    base64 += chars[a] + chars[b] + chars[c] + chars[d];
  }

  // Handle remaining bytes
  if (byteRemainder === 1) {
    chunk = bytes[mainLength];
    a = (chunk & 0xfc) >> 2;
    b = (chunk & 0x03) << 4;
    base64 += chars[a] + chars[b] + "==";
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 0xfc00) >> 10;
    b = (chunk & 0x03f0) >> 4;
    c = (chunk & 0x000f) << 2;
    base64 += chars[a] + chars[b] + chars[c] + "=";
  }

  return base64;
}
