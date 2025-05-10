"use strict";
(() => {
  // node_modules/reconnecting-websocket/dist/reconnecting-websocket-mjs.js
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  function __extends(d, b) {
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
  }
  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  }
  function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
    return ar;
  }
  var Event = (
    /** @class */
    /* @__PURE__ */ function() {
      function Event2(type, target) {
        this.target = target;
        this.type = type;
      }
      return Event2;
    }()
  );
  var ErrorEvent = (
    /** @class */
    function(_super) {
      __extends(ErrorEvent2, _super);
      function ErrorEvent2(error, target) {
        var _this = _super.call(this, "error", target) || this;
        _this.message = error.message;
        _this.error = error;
        return _this;
      }
      return ErrorEvent2;
    }(Event)
  );
  var CloseEvent = (
    /** @class */
    function(_super) {
      __extends(CloseEvent2, _super);
      function CloseEvent2(code, reason, target) {
        if (code === void 0) {
          code = 1e3;
        }
        if (reason === void 0) {
          reason = "";
        }
        var _this = _super.call(this, "close", target) || this;
        _this.wasClean = true;
        _this.code = code;
        _this.reason = reason;
        return _this;
      }
      return CloseEvent2;
    }(Event)
  );
  var getGlobalWebSocket = function() {
    if (typeof WebSocket !== "undefined") {
      return WebSocket;
    }
  };
  var isWebSocket = function(w) {
    return typeof w !== "undefined" && !!w && w.CLOSING === 2;
  };
  var DEFAULT = {
    maxReconnectionDelay: 1e4,
    minReconnectionDelay: 1e3 + Math.random() * 4e3,
    minUptime: 5e3,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 4e3,
    maxRetries: Infinity,
    maxEnqueuedMessages: Infinity,
    startClosed: false,
    debug: false
  };
  var ReconnectingWebSocket = (
    /** @class */
    function() {
      function ReconnectingWebSocket2(url, protocols, options) {
        var _this = this;
        if (options === void 0) {
          options = {};
        }
        this._listeners = {
          error: [],
          message: [],
          open: [],
          close: []
        };
        this._retryCount = -1;
        this._shouldReconnect = true;
        this._connectLock = false;
        this._binaryType = "blob";
        this._closeCalled = false;
        this._messageQueue = [];
        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        this.onopen = null;
        this._handleOpen = function(event) {
          _this._debug("open event");
          var _a = _this._options.minUptime, minUptime = _a === void 0 ? DEFAULT.minUptime : _a;
          clearTimeout(_this._connectTimeout);
          _this._uptimeTimeout = setTimeout(function() {
            return _this._acceptOpen();
          }, minUptime);
          _this._ws.binaryType = _this._binaryType;
          _this._messageQueue.forEach(function(message) {
            return _this._ws.send(message);
          });
          _this._messageQueue = [];
          if (_this.onopen) {
            _this.onopen(event);
          }
          _this._listeners.open.forEach(function(listener) {
            return _this._callEventListener(event, listener);
          });
        };
        this._handleMessage = function(event) {
          _this._debug("message event");
          if (_this.onmessage) {
            _this.onmessage(event);
          }
          _this._listeners.message.forEach(function(listener) {
            return _this._callEventListener(event, listener);
          });
        };
        this._handleError = function(event) {
          _this._debug("error event", event.message);
          _this._disconnect(void 0, event.message === "TIMEOUT" ? "timeout" : void 0);
          if (_this.onerror) {
            _this.onerror(event);
          }
          _this._debug("exec error listeners");
          _this._listeners.error.forEach(function(listener) {
            return _this._callEventListener(event, listener);
          });
          _this._connect();
        };
        this._handleClose = function(event) {
          _this._debug("close event");
          _this._clearTimeouts();
          if (_this._shouldReconnect) {
            _this._connect();
          }
          if (_this.onclose) {
            _this.onclose(event);
          }
          _this._listeners.close.forEach(function(listener) {
            return _this._callEventListener(event, listener);
          });
        };
        this._url = url;
        this._protocols = protocols;
        this._options = options;
        if (this._options.startClosed) {
          this._shouldReconnect = false;
        }
        this._connect();
      }
      Object.defineProperty(ReconnectingWebSocket2, "CONNECTING", {
        get: function() {
          return 0;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2, "OPEN", {
        get: function() {
          return 1;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2, "CLOSING", {
        get: function() {
          return 2;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2, "CLOSED", {
        get: function() {
          return 3;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "CONNECTING", {
        get: function() {
          return ReconnectingWebSocket2.CONNECTING;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "OPEN", {
        get: function() {
          return ReconnectingWebSocket2.OPEN;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "CLOSING", {
        get: function() {
          return ReconnectingWebSocket2.CLOSING;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "CLOSED", {
        get: function() {
          return ReconnectingWebSocket2.CLOSED;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "binaryType", {
        get: function() {
          return this._ws ? this._ws.binaryType : this._binaryType;
        },
        set: function(value) {
          this._binaryType = value;
          if (this._ws) {
            this._ws.binaryType = value;
          }
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "retryCount", {
        /**
         * Returns the number or connection retries
         */
        get: function() {
          return Math.max(this._retryCount, 0);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "bufferedAmount", {
        /**
         * The number of bytes of data that have been queued using calls to send() but not yet
         * transmitted to the network. This value resets to zero once all queued data has been sent.
         * This value does not reset to zero when the connection is closed; if you keep calling send(),
         * this will continue to climb. Read only
         */
        get: function() {
          var bytes = this._messageQueue.reduce(function(acc, message) {
            if (typeof message === "string") {
              acc += message.length;
            } else if (message instanceof Blob) {
              acc += message.size;
            } else {
              acc += message.byteLength;
            }
            return acc;
          }, 0);
          return bytes + (this._ws ? this._ws.bufferedAmount : 0);
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "extensions", {
        /**
         * The extensions selected by the server. This is currently only the empty string or a list of
         * extensions as negotiated by the connection
         */
        get: function() {
          return this._ws ? this._ws.extensions : "";
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "protocol", {
        /**
         * A string indicating the name of the sub-protocol the server selected;
         * this will be one of the strings specified in the protocols parameter when creating the
         * WebSocket object
         */
        get: function() {
          return this._ws ? this._ws.protocol : "";
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "readyState", {
        /**
         * The current state of the connection; this is one of the Ready state constants
         */
        get: function() {
          if (this._ws) {
            return this._ws.readyState;
          }
          return this._options.startClosed ? ReconnectingWebSocket2.CLOSED : ReconnectingWebSocket2.CONNECTING;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(ReconnectingWebSocket2.prototype, "url", {
        /**
         * The URL as resolved by the constructor
         */
        get: function() {
          return this._ws ? this._ws.url : "";
        },
        enumerable: true,
        configurable: true
      });
      ReconnectingWebSocket2.prototype.close = function(code, reason) {
        if (code === void 0) {
          code = 1e3;
        }
        this._closeCalled = true;
        this._shouldReconnect = false;
        this._clearTimeouts();
        if (!this._ws) {
          this._debug("close enqueued: no ws instance");
          return;
        }
        if (this._ws.readyState === this.CLOSED) {
          this._debug("close: already closed");
          return;
        }
        this._ws.close(code, reason);
      };
      ReconnectingWebSocket2.prototype.reconnect = function(code, reason) {
        this._shouldReconnect = true;
        this._closeCalled = false;
        this._retryCount = -1;
        if (!this._ws || this._ws.readyState === this.CLOSED) {
          this._connect();
        } else {
          this._disconnect(code, reason);
          this._connect();
        }
      };
      ReconnectingWebSocket2.prototype.send = function(data) {
        if (this._ws && this._ws.readyState === this.OPEN) {
          this._debug("send", data);
          this._ws.send(data);
        } else {
          var _a = this._options.maxEnqueuedMessages, maxEnqueuedMessages = _a === void 0 ? DEFAULT.maxEnqueuedMessages : _a;
          if (this._messageQueue.length < maxEnqueuedMessages) {
            this._debug("enqueue", data);
            this._messageQueue.push(data);
          }
        }
      };
      ReconnectingWebSocket2.prototype.addEventListener = function(type, listener) {
        if (this._listeners[type]) {
          this._listeners[type].push(listener);
        }
      };
      ReconnectingWebSocket2.prototype.dispatchEvent = function(event) {
        var e_1, _a;
        var listeners = this._listeners[event.type];
        if (listeners) {
          try {
            for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
              var listener = listeners_1_1.value;
              this._callEventListener(event, listener);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        }
        return true;
      };
      ReconnectingWebSocket2.prototype.removeEventListener = function(type, listener) {
        if (this._listeners[type]) {
          this._listeners[type] = this._listeners[type].filter(function(l) {
            return l !== listener;
          });
        }
      };
      ReconnectingWebSocket2.prototype._debug = function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (this._options.debug) {
          console.log.apply(console, __spread(["RWS>"], args));
        }
      };
      ReconnectingWebSocket2.prototype._getNextDelay = function() {
        var _a = this._options, _b = _a.reconnectionDelayGrowFactor, reconnectionDelayGrowFactor = _b === void 0 ? DEFAULT.reconnectionDelayGrowFactor : _b, _c = _a.minReconnectionDelay, minReconnectionDelay = _c === void 0 ? DEFAULT.minReconnectionDelay : _c, _d = _a.maxReconnectionDelay, maxReconnectionDelay = _d === void 0 ? DEFAULT.maxReconnectionDelay : _d;
        var delay = 0;
        if (this._retryCount > 0) {
          delay = minReconnectionDelay * Math.pow(reconnectionDelayGrowFactor, this._retryCount - 1);
          if (delay > maxReconnectionDelay) {
            delay = maxReconnectionDelay;
          }
        }
        this._debug("next delay", delay);
        return delay;
      };
      ReconnectingWebSocket2.prototype._wait = function() {
        var _this = this;
        return new Promise(function(resolve) {
          setTimeout(resolve, _this._getNextDelay());
        });
      };
      ReconnectingWebSocket2.prototype._getNextUrl = function(urlProvider) {
        if (typeof urlProvider === "string") {
          return Promise.resolve(urlProvider);
        }
        if (typeof urlProvider === "function") {
          var url = urlProvider();
          if (typeof url === "string") {
            return Promise.resolve(url);
          }
          if (!!url.then) {
            return url;
          }
        }
        throw Error("Invalid URL");
      };
      ReconnectingWebSocket2.prototype._connect = function() {
        var _this = this;
        if (this._connectLock || !this._shouldReconnect) {
          return;
        }
        this._connectLock = true;
        var _a = this._options, _b = _a.maxRetries, maxRetries = _b === void 0 ? DEFAULT.maxRetries : _b, _c = _a.connectionTimeout, connectionTimeout = _c === void 0 ? DEFAULT.connectionTimeout : _c, _d = _a.WebSocket, WebSocket2 = _d === void 0 ? getGlobalWebSocket() : _d;
        if (this._retryCount >= maxRetries) {
          this._debug("max retries reached", this._retryCount, ">=", maxRetries);
          return;
        }
        this._retryCount++;
        this._debug("connect", this._retryCount);
        this._removeListeners();
        if (!isWebSocket(WebSocket2)) {
          throw Error("No valid WebSocket class provided");
        }
        this._wait().then(function() {
          return _this._getNextUrl(_this._url);
        }).then(function(url) {
          if (_this._closeCalled) {
            return;
          }
          _this._debug("connect", { url, protocols: _this._protocols });
          _this._ws = _this._protocols ? new WebSocket2(url, _this._protocols) : new WebSocket2(url);
          _this._ws.binaryType = _this._binaryType;
          _this._connectLock = false;
          _this._addListeners();
          _this._connectTimeout = setTimeout(function() {
            return _this._handleTimeout();
          }, connectionTimeout);
        });
      };
      ReconnectingWebSocket2.prototype._handleTimeout = function() {
        this._debug("timeout event");
        this._handleError(new ErrorEvent(Error("TIMEOUT"), this));
      };
      ReconnectingWebSocket2.prototype._disconnect = function(code, reason) {
        if (code === void 0) {
          code = 1e3;
        }
        this._clearTimeouts();
        if (!this._ws) {
          return;
        }
        this._removeListeners();
        try {
          this._ws.close(code, reason);
          this._handleClose(new CloseEvent(code, reason, this));
        } catch (error) {
        }
      };
      ReconnectingWebSocket2.prototype._acceptOpen = function() {
        this._debug("accept open");
        this._retryCount = 0;
      };
      ReconnectingWebSocket2.prototype._callEventListener = function(event, listener) {
        if ("handleEvent" in listener) {
          listener.handleEvent(event);
        } else {
          listener(event);
        }
      };
      ReconnectingWebSocket2.prototype._removeListeners = function() {
        if (!this._ws) {
          return;
        }
        this._debug("removeListeners");
        this._ws.removeEventListener("open", this._handleOpen);
        this._ws.removeEventListener("close", this._handleClose);
        this._ws.removeEventListener("message", this._handleMessage);
        this._ws.removeEventListener("error", this._handleError);
      };
      ReconnectingWebSocket2.prototype._addListeners = function() {
        if (!this._ws) {
          return;
        }
        this._debug("addListeners");
        this._ws.addEventListener("open", this._handleOpen);
        this._ws.addEventListener("close", this._handleClose);
        this._ws.addEventListener("message", this._handleMessage);
        this._ws.addEventListener("error", this._handleError);
      };
      ReconnectingWebSocket2.prototype._clearTimeouts = function() {
        clearTimeout(this._connectTimeout);
        clearTimeout(this._uptimeTimeout);
      };
      return ReconnectingWebSocket2;
    }()
  );
  var reconnecting_websocket_mjs_default = ReconnectingWebSocket;

  // src/claude_mcp_plugin/src/client.ts
  var autoReconnectEnabled = true;
  function setAutoReconnect(flag) {
    autoReconnectEnabled = flag;
  }
  var socket = null;
  var channel;
  var connected = false;
  var serverPort = 3055;
  var pending = /* @__PURE__ */ new Map();
  var messageHandlers = [];
  var progressHandlers = [];
  function generateChannelName() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  function connect(port) {
    if (connected || socket) return;
    serverPort = port;
    socket = autoReconnectEnabled ? new reconnecting_websocket_mjs_default(`ws://localhost:${port}`, [], {
      maxReconnectionDelay: 1e4,
      minReconnectionDelay: 1500,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 4e3,
      maxRetries: Infinity
    }) : new globalThis.WebSocket(`ws://localhost:${port}`);
    const chan = generateChannelName();
    channel = chan;
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", channel: chan }));
    };
    socket.onmessage = (event) => {
      const raw = JSON.parse(event.data);
      if (raw.type === "progress_update" && raw.message?.data) {
        progressHandlers.forEach((h) => h(raw.message.data));
      }
      if (raw.message && raw.message.id && pending.has(raw.message.id)) {
        const { resolve, reject } = pending.get(raw.message.id);
        pending.delete(raw.message.id);
        raw.message.error ? reject(new Error(raw.message.error)) : resolve(raw.message.result);
        return;
      }
      if (raw.message) {
        messageHandlers.forEach((h) => h(raw.message));
      }
    };
    socket.onerror = () => {
      disconnect();
    };
    socket.onclose = () => {
      disconnect();
    };
    connected = true;
  }
  function disconnect() {
    if (socket) {
      socket.close();
      socket = null;
    }
    connected = false;
  }
  function onMessage(fn) {
    messageHandlers.push(fn);
  }
  function onProgress(fn) {
    progressHandlers.push(fn);
  }

  // src/claude_mcp_plugin/src/ui.ts
  var portInput = document.getElementById("port");
  var connectButton = document.getElementById("btn-connect");
  var disconnectButton = document.getElementById("btn-disconnect");
  var connectionStatus = document.getElementById("connection-status");
  var tabs = Array.from(document.querySelectorAll(".tab"));
  var tabContents = Array.from(document.querySelectorAll(".tab-content"));
  var autoReconnectToggle = document.getElementById("auto-reconnect-toggle");
  var progressContainer = document.getElementById("progress-container");
  var progressBar = document.getElementById("progress-bar");
  var progressMessage = document.getElementById("progress-message");
  var progressStatus = document.getElementById("progress-status");
  var progressPercentage = document.getElementById("progress-percentage");
  function updateConnectionStatus(isConnected, message) {
    connectionStatus.innerHTML = message ? message : isConnected ? "Connected to Claude MCP server" : "Not connected to Claude MCP server";
    connectionStatus.className = "status " + (isConnected ? "connected" : "disconnected");
    connectButton.disabled = isConnected;
    disconnectButton.disabled = !isConnected;
    portInput.disabled = isConnected;
  }
  function updateProgressUI(data) {
    progressContainer.classList.remove("hidden");
    const pct = data.progress || 0;
    progressBar.style.width = `${pct}%`;
    progressPercentage.textContent = `${pct}%`;
    progressMessage.textContent = data.message || "Operation in progress";
    if (data.status === "completed") {
      progressStatus.textContent = "Completed";
      progressStatus.className = "operation-complete";
      setTimeout(() => progressContainer.classList.add("hidden"), 5e3);
    } else if (data.status === "error") {
      progressStatus.textContent = "Error";
      progressStatus.className = "operation-error";
    } else {
      progressStatus.textContent = data.status === "started" ? "Started" : "In Progress";
      progressStatus.className = "";
    }
  }
  onMessage((msg) => {
    if (msg.type === "init-settings") {
      autoReconnectToggle.checked = msg.settings.autoReconnect;
      setAutoReconnect(msg.settings.autoReconnect);
      return;
    }
    parent.postMessage({ pluginMessage: msg }, "*");
  });
  onProgress(updateProgressUI);
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      const id = tab.id.split("-")[1];
      document.getElementById(`content-${id}`).classList.add("active");
    });
  });
  autoReconnectToggle.addEventListener("change", () => {
    setAutoReconnect(autoReconnectToggle.checked);
  });
  connectButton.addEventListener("click", () => {
    updateConnectionStatus(false, "Connecting\u2026");
    connect(parseInt(portInput.value, 10) || 3055);
  });
  disconnectButton.addEventListener("click", () => {
    updateConnectionStatus(false, "Disconnecting\u2026");
    disconnect();
  });
})();
/*! Bundled license information:

reconnecting-websocket/dist/reconnecting-websocket-mjs.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0
  
  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.
  
  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** *)
  (*!
   * Reconnecting WebSocket
   * by Pedro Ladaria <pedro.ladaria@gmail.com>
   * https://github.com/pladaria/reconnecting-websocket
   * License MIT
   *)
*/
