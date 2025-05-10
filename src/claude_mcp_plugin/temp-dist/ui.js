"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * UI panel script for the Claude MCP plugin.
 *
 * This script manages the user interface elements of the plugin,
 * including connection controls (connect/disconnect buttons and port input),
 * tab navigation, and progress display for ongoing commands.
 * It communicates asynchronously with the plugin backend via postMessage,
 * handling initialization of settings and real-time progress updates.
 *
 * Exposed functions:
 * - updateConnectionStatus(isConnected: boolean, message?: string): void
 * - updateProgressUI(data: ProgressData): void
 * - connect(port: number): void
 * - disconnect(): void
 * - onMessage(callback: (msg: any) => void): void
 * - onProgress(callback: (data: ProgressData) => void): void
 *
 * @module ui
 * @requires connect, disconnect, send, onMessage, onProgress, ProgressData
 * @example
 * // Connect to MCP server and handle progress updates
 * connect(3055);
 * onProgress(data => updateProgressUI(data));
 */
const client_1 = require("./client");
// UI Elements
const portInput = document.getElementById('port');
const connectButton = document.getElementById('btn-connect');
const disconnectButton = document.getElementById('btn-disconnect');
const connectionStatus = document.getElementById('connection-status');
const tabs = Array.from(document.querySelectorAll('.tab'));
const tabContents = Array.from(document.querySelectorAll('.tab-content'));
const autoReconnectToggle = document.getElementById('auto-reconnect-toggle');
// Progress UI
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressMessage = document.getElementById('progress-message');
const progressStatus = document.getElementById('progress-status');
const progressPercentage = document.getElementById('progress-percentage');
/**
 * Updates the UI connection status display.
 * @param {boolean} isConnected - Indicates whether the client is connected to the MCP server.
 * @param {string} [message] - Optional custom status message to display.
 * @returns {void}
 * @example
 * // Show connected status
 * updateConnectionStatus(true);
 * // Show error message
 * updateConnectionStatus(false, 'Failed to connect');
 *
 * This function updates the connection status text and styles,
 * and enables/disables the connect/disconnect buttons and port input accordingly.
 */
function updateConnectionStatus(isConnected, message) {
    connectionStatus.innerHTML = message
        ? message
        : isConnected
            ? 'Connected to Claude MCP server'
            : 'Not connected to Claude MCP server';
    connectionStatus.className = 'status ' + (isConnected ? 'connected' : 'disconnected');
    connectButton.disabled = isConnected;
    disconnectButton.disabled = !isConnected;
    portInput.disabled = isConnected;
}
/**
 * Updates the progress UI elements based on incoming progress data.
 * @param {ProgressData} data - Progress update object with commandId, progress, status, and optional message.
 * @returns {void}
 * @example
 * // Called when progress event fires
 * onProgress(data => updateProgressUI(data));
 *
 * This function updates the progress bar width, percentage text,
 * status message, and applies appropriate styling based on the progress status.
 * It also hides the progress container after completion with a delay.
 */
function updateProgressUI(data) {
    progressContainer.classList.remove('hidden');
    const pct = data.progress || 0;
    progressBar.style.width = `${pct}%`;
    progressPercentage.textContent = `${pct}%`;
    progressMessage.textContent = data.message || 'Operation in progress';
    if (data.status === 'completed') {
        progressStatus.textContent = 'Completed';
        progressStatus.className = 'operation-complete';
        setTimeout(() => progressContainer.classList.add('hidden'), 5000);
    }
    else if (data.status === 'error') {
        progressStatus.textContent = 'Error';
        progressStatus.className = 'operation-error';
    }
    else {
        progressStatus.textContent = data.status === 'started' ? 'Started' : 'In Progress';
        progressStatus.className = '';
    }
}
// Hook client events
(0, client_1.onMessage)((msg) => {
    if (msg.type === 'init-settings') {
        // Initialize the auto reconnect toggle based on saved settings
        autoReconnectToggle.checked = msg.settings.autoReconnect;
        (0, client_1.setAutoReconnect)(msg.settings.autoReconnect);
        return;
    }
    // Forward execution results or errors back to Figma plugin code
    parent.postMessage({ pluginMessage: msg }, '*');
});
(0, client_1.onProgress)(updateProgressUI);
// Tab switching
tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tabContents.forEach((c) => c.classList.remove('active'));
        tab.classList.add('active');
        const id = tab.id.split('-')[1];
        document.getElementById(`content-${id}`).classList.add('active');
    });
});
// Connect / Disconnect
autoReconnectToggle.addEventListener('change', () => { (0, client_1.setAutoReconnect)(autoReconnectToggle.checked); });
connectButton.addEventListener('click', () => {
    updateConnectionStatus(false, 'Connecting…');
    (0, client_1.connect)(parseInt(portInput.value, 10) || 3055);
});
disconnectButton.addEventListener('click', () => {
    updateConnectionStatus(false, 'Disconnecting…');
    (0, client_1.disconnect)();
});
// Local image upload handlers removed
