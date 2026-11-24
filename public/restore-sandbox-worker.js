/* CodeGuard Network-Free Sandbox Virtual DOM Reconstructor Worker */
/* Disable all network & external script primitives inside the sandbox worker */
try { self.fetch = function () { return Promise.reject(new Error('Network disabled in sandbox')); }; } catch (e) {}
try { self.XMLHttpRequest = function () { throw new Error('Network disabled in sandbox'); }; } catch (e) {}
try { self.WebSocket = function () { throw new Error('Network disabled in sandbox'); }; } catch (e) {}
try { self.EventSource = function () { throw new Error('Network disabled in sandbox'); }; } catch (e) {}
try { self.importScripts = function () { throw new Error('importScripts disabled in sandbox'); }; } catch (e) {}
try {
  if (self.navigator && typeof self.navigator.sendBeacon === 'function') {
    self.navigator.sendBeacon = function () { return false; };
  }
} catch (e) {}

self.onmessage = function (event) {
  var data = event.data || {};
  var id = data.id;
  var scripts = Array.isArray(data.scripts) ? data.scripts : [];
  var mountIds = Array.isArray(data.mountIds) ? data.mountIds : [];

  var capturedStyles = [];
  var capturedMounts = {};
  var capturedWrites = [];
  var domLoadedCallbacks = [];

  function createVirtualElement(tagName, explicitId) {
    var _innerHtml = '';
    var _textContent = '';
    var el = {
      nodeType: 1,
      tagName: String(tagName || 'DIV').toUpperCase(),
      id: explicitId || '',
      dataset: {},
      style: {},
      attributes: {},
      children: [],
      setAttribute: function (k, v) { el.attributes[k] = String(v); if (k === 'id') el.id = String(v); },
      getAttribute: function (k) { return el.attributes[k] || null; },
      appendChild: function (child) {
        if (!child) return child;
        el.children.push(child);
        if (child.tagName === 'STYLE') {
          var cssText = child.textContent || child.innerHTML || '';
          if (cssText && cssText.trim()) {
            capturedStyles.push(cssText);
          }
        }
        return child;
      },
      insertBefore: function (child) {
        return el.appendChild(child);
      },
      remove: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      querySelector: function () { return null; },
      querySelectorAll: function () { return []; },
      closest: function () { return null; }
    };

    Object.defineProperty(el, 'innerHTML', {
      get: function () { return _innerHtml; },
      set: function (val) {
        _innerHtml = String(val == null ? '' : val);
        if (el.id) {
          capturedMounts[el.id] = _innerHtml;
        }
        if (el.tagName === 'STYLE' && _innerHtml.trim()) {
          capturedStyles.push(_innerHtml);
        }
      }
    });

    Object.defineProperty(el, 'textContent', {
      get: function () { return _textContent; },
      set: function (val) {
        _textContent = String(val == null ? '' : val);
        if (el.tagName === 'STYLE' && _textContent.trim()) {
          capturedStyles.push(_textContent);
        }
      }
    });

    return el;
  }

  var virtualHead = createVirtualElement('HEAD', '');
  var virtualBody = createVirtualElement('BODY', '');
  var virtualDocEl = createVirtualElement('HTML', '');
  virtualDocEl.appendChild(virtualHead);
  virtualDocEl.appendChild(virtualBody);

  var mountRegistry = {};
  for (var m = 0; m < mountIds.length; m++) {
    var mid = mountIds[m];
    mountRegistry[mid] = createVirtualElement('DIV', mid);
  }

  var virtualDocument = {
    readyState: 'loading',
    head: virtualHead,
    body: virtualBody,
    documentElement: virtualDocEl,
    createElement: function (tag) {
      return createVirtualElement(tag, '');
    },
    createTextNode: function (txt) {
      return { nodeType: 3, textContent: String(txt || '') };
    },
    getElementById: function (targetId) {
      if (!targetId) return null;
      if (!mountRegistry[targetId]) {
        mountRegistry[targetId] = createVirtualElement('DIV', targetId);
      }
      return mountRegistry[targetId];
    },
    querySelector: function (sel) {
      if (typeof sel === 'string' && sel.charAt(0) === '#') {
        return virtualDocument.getElementById(sel.slice(1));
      }
      if (sel === 'head') return virtualHead;
      if (sel === 'body') return virtualBody;
      return null;
    },
    querySelectorAll: function () { return []; },
    write: function () {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != null) capturedWrites.push(String(arguments[i]));
      }
    },
    writeln: function () {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != null) capturedWrites.push(String(arguments[i]) + '\n');
      }
    },
    addEventListener: function (ev, cb) {
      if (ev === 'DOMContentLoaded' && typeof cb === 'function') {
        domLoadedCallbacks.push(cb);
      }
    },
    removeEventListener: function () {}
  };

  var virtualLocation = {
    hostname: 'localhost',
    host: 'localhost',
    origin: 'http://localhost',
    protocol: 'http:',
    href: 'http://localhost/',
    pathname: '/',
    search: '',
    hash: '',
    replace: function () {},
    assign: function () {},
    reload: function () {}
  };

  var virtualWindow = {
    document: virtualDocument,
    location: virtualLocation,
    addEventListener: function (ev, cb) {
      if ((ev === 'DOMContentLoaded' || ev === 'load') && typeof cb === 'function') {
        domLoadedCallbacks.push(cb);
      }
    },
    removeEventListener: function () {},
    setTimeout: function (fn) {
      if (typeof fn === 'function') {
        try { fn(); } catch (e) {}
      }
      return 0;
    },
    clearTimeout: function () {},
    setInterval: function () { return 0; },
    clearInterval: function () {},
    atob: self.atob.bind(self),
    btoa: self.btoa.bind(self),
    TextDecoder: typeof TextDecoder !== 'undefined' ? TextDecoder : self.TextDecoder,
    TextEncoder: typeof TextEncoder !== 'undefined' ? TextEncoder : self.TextEncoder,
    Uint8Array: Uint8Array,
    decodeURIComponent: decodeURIComponent,
    encodeURIComponent: encodeURIComponent,
    unescape: unescape,
    escape: escape,
    console: { log: function () {}, warn: function () {}, error: function () {}, info: function () {}, debug: function () {} }
  };
  virtualWindow.window = virtualWindow;
  virtualWindow.self = virtualWindow;
  virtualWindow.top = virtualWindow;
  virtualWindow.parent = virtualWindow;

  var executedScriptIndexes = [];

  for (var idx = 0; idx < scripts.length; idx++) {
    var code = scripts[idx];
    if (!code || !String(code).trim()) continue;

    var prevStyles = capturedStyles.length;
    var prevWrites = capturedWrites.length;
    var prevMountKeys = JSON.stringify(capturedMounts);

    try {
      var runner = new Function(
        'window', 'self', 'document', 'location', 'console',
        'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
        '"use strict";\n' + code
      );
      runner.call(
        virtualWindow,
        virtualWindow,
        virtualWindow,
        virtualDocument,
        virtualLocation,
        virtualWindow.console,
        virtualWindow.setTimeout,
        virtualWindow.setInterval,
        virtualWindow.clearTimeout,
        virtualWindow.clearInterval
      );

      if (domLoadedCallbacks.length > 0) {
        virtualDocument.readyState = 'complete';
        var cbs = domLoadedCallbacks.splice(0, domLoadedCallbacks.length);
        for (var c = 0; c < cbs.length; c++) {
          try { cbs[c](); } catch (e) {}
        }
      }
    } catch (err) {
      // Non-fatal in sandbox: script might depend on live browser APIs
    }

    var producedSomething =
      capturedStyles.length > prevStyles ||
      capturedWrites.length > prevWrites ||
      JSON.stringify(capturedMounts) !== prevMountKeys;

    if (producedSomething) {
      executedScriptIndexes.push(idx);
    }
  }

  // Deduplicate styles and ignore pure anti-inspect body user-select:none style
  var filteredStyles = [];
  for (var s = 0; s < capturedStyles.length; s++) {
    var css = String(capturedStyles[s] || '').trim();
    if (!css) continue;
    if (/user-select\s*:\s*none/i.test(css) && css.length < 320) continue;
    if (filteredStyles.indexOf(css) === -1) {
      filteredStyles.push(css);
    }
  }

  self.postMessage({
    id: id,
    ok: true,
    styles: filteredStyles,
    mounts: capturedMounts,
    writes: capturedWrites,
    injectorScriptIndexes: executedScriptIndexes
  });
};
