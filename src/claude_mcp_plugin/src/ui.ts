import { connect, disconnect, send, onMessage, onProgress, ProgressData } from './client';

// UI Elements
const portInput = document.getElementById('port') as HTMLInputElement;
const connectButton = document.getElementById('btn-connect') as HTMLButtonElement;
const disconnectButton = document.getElementById('btn-disconnect') as HTMLButtonElement;
const connectionStatus = document.getElementById('connection-status') as HTMLElement;
const tabs = Array.from(document.querySelectorAll('.tab')) as HTMLDivElement[];
const tabContents = Array.from(document.querySelectorAll('.tab-content')) as HTMLDivElement[];

// Progress UI
const progressContainer = document.getElementById('progress-container')!;
const progressBar = document.getElementById('progress-bar')!;
const progressMessage = document.getElementById('progress-message')!;
const progressStatus = document.getElementById('progress-status')!;
const progressPercentage = document.getElementById('progress-percentage')!;

function updateConnectionStatus(isConnected: boolean, message?: string) {
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

function updateProgressUI(data: ProgressData) {
  progressContainer.classList.remove('hidden');
  const pct = data.progress || 0;
  progressBar.style.width = `${pct}%`;
  progressPercentage.textContent = `${pct}%`;
  progressMessage.textContent = data.message || 'Operation in progress';
  if (data.status === 'completed') {
    progressStatus.textContent = 'Completed';
    progressStatus.className = 'operation-complete';
    setTimeout(() => progressContainer.classList.add('hidden'), 5000);
  } else if (data.status === 'error') {
    progressStatus.textContent = 'Error';
    progressStatus.className = 'operation-error';
  } else {
    progressStatus.textContent = data.status === 'started' ? 'Started' : 'In Progress';
    progressStatus.className = '';
  }
}

// Hook client events
onMessage((msg) => {
  // Forward execution results or errors back to Figma plugin code
  parent.postMessage({ pluginMessage: msg }, '*');
});
onProgress(updateProgressUI);

// Tab switching
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tabContents.forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    const id = tab.id.split('-')[1];
    document.getElementById(`content-${id}`)!.classList.add('active');
  });
});

// Connect / Disconnect
connectButton.addEventListener('click', () => {
  updateConnectionStatus(false, 'Connecting…');
  connect(parseInt(portInput.value, 10) || 3055);
});
disconnectButton.addEventListener('click', () => {
  updateConnectionStatus(false, 'Disconnecting…');
  disconnect();
});

 // Local image upload handlers removed
