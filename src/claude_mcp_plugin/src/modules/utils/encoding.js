/**
 * Custom base64 encoding function for binary data.
 * 
 * Provides a manual implementation of base64 encoding for Uint8Array data.
 * This is useful for image data and other binary content that needs to be 
 * serialized for transmission, particularly for Figma plugin communication.
 *
 * @param {Uint8Array} bytes - The binary data to encode.
 * @returns {string} A base64 encoded string representation of the data.
 * @example
 * // Convert Uint8Array to base64 string
 * const data = new Uint8Array([72, 101, 108, 108, 111]);
 * const b64 = customBase64Encode(data);
 * console.log(b64); // "SGVsbG8="
 */
export function customBase64Encode(bytes) {
  // Base64 character set lookup table
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64 = "";

  // Calculate padding requirements
  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;  // Calculate how many bytes don't fit in complete 3-byte groups
  const mainLength = byteLength - byteRemainder;  // Length that fits in complete 3-byte groups

  let a, b, c, d;
  let chunk;

  // Process all complete 3-byte chunks
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine three bytes into a 24-bit number
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Extract four 6-bit segments from the 24-bit chunk using bitmasks
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18 - First 6 bits
    b = (chunk & 258048) >> 12;   // 258048 = (2^6 - 1) << 12 - Second 6 bits
    c = (chunk & 4032) >> 6;      // 4032 = (2^6 - 1) << 6 - Third 6 bits
    d = chunk & 63;               // 63 = 2^6 - 1 - Last 6 bits

    // Map each 6-bit value to the corresponding base64 character
    base64 += chars[a] + chars[b] + chars[c] + chars[d];
  }

  // Handle remaining bytes that don't form a complete 3-byte group
  if (byteRemainder === 1) {
    // For 1 remaining byte, pad with two '=' characters
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;      // 252 = (2^6 - 1) << 2
    b = (chunk & 3) << 4;        // 3 = 2^2 - 1, shift left for padding
    base64 += chars[a] + chars[b] + "==";
  } else if (byteRemainder === 2) {
    // For 2 remaining bytes, pad with one '=' character
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;   // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4;     // 1008 = (2^6 - 1) << 4
    c = (chunk & 15) << 2;       // 15 = 2^4 - 1, shift left for padding
    base64 += chars[a] + chars[b] + chars[c] + "=";
  }

  return base64;
}
