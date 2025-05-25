/**
 * Core helpers for MCP/Figma Test Runner.
 * Exports: deepEqual, assertEchoedCommand, runStep
 */

/**
 * Deep equality check for objects and primitives.
 * @param {*} a - First value to compare.
 * @param {*} b - Second value to compare.
 * @returns {boolean} True if values are deeply equal.
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/**
 * Generate an assertion function to verify the command echoed.
 * @param {string} expectedCommand - The expected command name.
 * @param {object} expectedParams - The expected parameters object.
 * @param {string} paramKey - The key within params to check.
 * @returns {function} Assertion function which validates the response and returns { pass, reason }.
 */
function assertEchoedCommand(expectedCommand, expectedParams, paramKey) {
  return (response) => {
    if (!response) return { pass: false, reason: 'No response received' };
    if (response.command !== expectedCommand) {
      return { pass: false, reason: `Expected command "${expectedCommand}", got "${response.command}"` };
    }
    const actual = response.params && response.params[paramKey];
    if (expectedParams) {
      for (const key of Object.keys(expectedParams)) {
        if (typeof expectedParams[key] === "object" && expectedParams[key] !== null) {
          if (!deepEqual(actual[key], expectedParams[key])) {
            return { pass: false, reason: `Property "${key}" did not match expected object value` };
          }
        } else {
          if (actual[key] !== expectedParams[key]) {
            return { pass: false, reason: `Property "${key}" expected ${expectedParams[key]}, got ${actual[key]}` };
          }
        }
      }
    }
    return { pass: true };
  };
}

/**
 * Sends a command over WebSocket and awaits a matching response, then applies an assertion.
 * @param {object} options - Configuration for the test step.
 * @param {WebSocket} options.ws - WebSocket instance to send/receive messages.
 * @param {string} options.channel - Channel identifier.
 * @param {string} options.command - Command name to send.
 * @param {object} options.params - Parameters object for the command.
 * @param {function} options.assert - Assertion function returning { pass, reason } based on response.
 * @param {string} options.label - Label for this test step in results.
 * @returns {Promise<{label: string, pass: boolean, reason?: string, response: any}>}
 */
function runStep({ ws, channel, command, params, assert, label }) {
  return new Promise((resolve) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const message = {
      id,
      type: 'message',
      channel,
      message: {
        id,
        command,
        params
      }
    };
    let timeout;
    const onMessage = (data) => {
      try {
        const packet = JSON.parse(data.toString());
        // Only process messages with matching ID that have result or error (ignore echo messages)
        if (packet.message && packet.message.id === id && (packet.message.result || packet.message.error)) {
          ws.off('message', onMessage);
          clearTimeout(timeout);
          // Prefer result, then error
          let resp = packet.message.result ?? packet.message.error;
          const assertion = assert ? assert(resp) : { pass: true };
          resolve({
            label,
            pass: assertion.pass,
            reason: assertion.reason,
            response: resp
          });
        }
      } catch (err) {
        ws.off('message', onMessage);
        clearTimeout(timeout);
        resolve({
          label,
          pass: false,
          reason: 'Error parsing response: ' + err,
          response: null
        });
      }
    };
    ws.on('message', onMessage);
    ws.send(JSON.stringify(message));
    timeout = setTimeout(() => {
      ws.off('message', onMessage);
      resolve({
        label,
        pass: false,
        reason: 'Timeout waiting for response',
        response: null
      });
    }, 5000);
  });
}

export {
  deepEqual,
  assertEchoedCommand,
  runStep
};
