/* CodeGuard Classic Web Worker: loads pre-built browser bundle via importScripts cleanly */
var chance;
self.chance = undefined;
importScripts('./vendor/javascript-obfuscator.browser.js');

self.onmessage = function (event) {
  var data = event.data || {};
  var id = data.id;
  var code = data.code;
  var options = data.options;

  try {
    var obfuscator = self.JavaScriptObfuscator;
    if (!obfuscator || typeof obfuscator.obfuscate !== 'function') {
      throw new Error('JavaScriptObfuscator failed to initialize inside Web Worker.');
    }
    var result = obfuscator.obfuscate(code, options);
    self.postMessage({
      id: id,
      ok: true,
      code: result.getObfuscatedCode(),
    });
  } catch (err) {
    self.postMessage({
      id: id,
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
};
