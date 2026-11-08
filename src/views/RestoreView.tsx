import React, { useState } from 'react';
import {
  CodeFormat,
  RestoreOptions,
  RestoreStats,
  ActivePage
} from '../types/index.ts';
import { restoreCode } from '../utils/restoreEngine.ts';
import { CodeEditor } from '../components/CodeEditor.tsx';
import {
  RotateCcw,
  Sparkles,
  AlignLeft,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

const RESTORE_SAMPLES: Record<CodeFormat, string> = {
  html: `<!-- ======================================================== -->
<!-- Code Protected & Encoded by CodeGaurd Ultra Shield Engine -->
<!-- ======================================================== -->
<script type="text/javascript">
(function() {
  var _0xdata = "PGRpdiBjbGFzcz0idXNlci1jYXJkIj4KICA8aDI+U2VjdXJlIENsaWVudCBQb3J0YWw8L2gyPgogIDxwPldlbGNvbWUgdG8geW91ciBzZWN1cmVkIGRhc2hib2FyZC48L3A+CiAgPGJ1dHRvbiBjbGFzcz0iYnRuIiBvbmNsaWNrPSJhbGVydCgnQ29ubmVjdGVkIScpIj5Db25uZWN0PC9idXR0b24+CjwvZGl2Pg==";
  try {
    var _bin = window.atob(_0xdata);
    var _len = _bin.length;
    var _bytes = new Uint8Array(_len);
    for (var i = 0; i < _len; i++) {
      _bytes[i] = _bin.charCodeAt(i);
    }
    var _html = new TextDecoder('utf-8').decode(_bytes);
    document.write(_html);
  } catch(e) {
    document.write(decodeURIComponent(escape(window.atob(_0xdata))));
  }
})();
</script>`,

  blogger: `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b'>
<head>
  <b:skin><![CDATA[body{background:#fff;color:#222;}]]></b:skin>
  <script type='text/javascript'>
  //<![CDATA[
  (function(){
    var _0xb = "ZnVuY3Rpb24gcmVuZGVyQmxvZyhpZCkgewogIGNvbnNvbGUubG9nKCdSZW5kZXJpbmcgYmxvZyBwb3N0OiAnICsgaWQpOwp9CnJlbmRlckJsb2coJzk0ODExJyk7";
    try {
      var _b = window.atob(_0xb), _l = _b.length, _y = new Uint8Array(_l);
      for (var i = 0; i < _l; i++) { _y[i] = _b.charCodeAt(i); }
      var _c = new TextDecoder('utf-8').decode(_y);
      (1, eval)(_c);
    } catch(e) {
      (1, eval)(decodeURIComponent(escape(window.atob(_0xb))));
    }
  })();
  //]]>
  </script>
</head>
<body>
  <b:section id='main'><b:widget id='Blog1' type='Blog'><b:includable id='main'><h1>Blog</h1></b:includable></b:widget></b:section>
</body>
</html>`
};

interface RestoreViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const RestoreView: React.FC<RestoreViewProps> = ({ onBack, onNavigate }) => {
  const [sourceCode, setSourceCode] = useState<string>('');
  const [restoredCode, setRestoredCode] = useState<string>('');
  const [format, setFormat] = useState<CodeFormat>('html');
  const [options] = useState<RestoreOptions>({
    beautifyOnly: false,
    deescapeHex: true,
    deescapeUnicode: true,
    resolveStringArrays: true,
    indentSize: 2,
  });
  const [stats, setStats] = useState<RestoreStats | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClear = () => {
    setSourceCode('');
    setRestoredCode('');
    setStats(null);
    setNotes([]);
    setErrorMsg(null);
  };

  const handleLoadSample = (targetFormat?: CodeFormat) => {
    const fmt = targetFormat || format;
    setSourceCode(RESTORE_SAMPLES[fmt] || RESTORE_SAMPLES.html);
    setErrorMsg(null);
  };

  const handleExecuteRestore = (beautifyOnly = false) => {
    if (!sourceCode.trim()) {
      setErrorMsg(`Please paste your encoded ${format === 'html' ? 'HTML / Website' : 'Blogger XML'} code to restore.`);
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const effectiveOptions: Partial<RestoreOptions> = {
        ...options,
        beautifyOnly,
        deescapeHex: !beautifyOnly,
        deescapeUnicode: !beautifyOnly,
        resolveStringArrays: !beautifyOnly,
      };

      const result = restoreCode(sourceCode, format, effectiveOptions);
      setRestoredCode(result.code);
      setStats(result.stats);
      setNotes(result.notes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Restoration failed: ${msg}`);
      setRestoredCode('');
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlaceholderText = () => {
    if (format === 'html') {
      return 'Please paste encoded HTML, Website & App code here...';
    }
    return 'Please paste encoded Blogger XML theme or widget code here...';
  };

  const getGuidanceBadge = () => {
    if (format === 'html') {
      return 'Target: HTML (Website & App Code) — Please paste encoded HTML or web code here to restore.';
    }
    return 'Target: Blogger XML (Theme & Widget Code) — Please paste encoded Blogger XML code here to restore.';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Restore &amp; Decode Code
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Instantly decode protected containers, unpack Base64 and escape sequences, and restore clean formatting.
          </p>
        </div>

        {/* Global Format Selector: ONLY HTML and Blogger XML */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-semibold text-slate-300 shrink-0">Select Format:</label>
          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value as CodeFormat);
              setErrorMsg(null);
            }}
            className="bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm rounded-lg px-3.5 py-2 font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="html">HTML (Website &amp; App Code)</option>
            <option value="blogger">Blogger XML (Theme &amp; Widget Code)</option>
          </select>
        </div>
      </div>

      {/* Target Format Guidance Indicator */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs font-medium">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>{getGuidanceBadge()}</span>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-rose-100">Restoration Issue</h5>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 1. Source Code Import Box (Full Width) */}
      <div className="w-full flex flex-col space-y-3">
        <CodeEditor
          title={format === 'html' ? 'Encoded HTML / Web Code' : 'Encoded Blogger XML Code'}
          value={sourceCode}
          onChange={setSourceCode}
          placeholder={getPlaceholderText()}
          format={format}
          onClear={handleClear}
          onLoadSample={() => handleLoadSample()}
          showBackupDownload={true}
          originalSourceForBackup={sourceCode}
        />
      </div>

      {/* 2. Action Toolbar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Primary Full Restore Button */}
            <button
              onClick={() => handleExecuteRestore(false)}
              disabled={isProcessing || !sourceCode.trim()}
              className="px-7 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Restore Code (Decode)</span>
            </button>

            {/* Beautify Only Button */}
            <button
              onClick={() => handleExecuteRestore(true)}
              disabled={isProcessing || !sourceCode.trim()}
              className="px-5 py-3 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlignLeft className="w-4 h-4 text-cyan-400" />
              <span>Beautify Code Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Output Box & Stats Report */}
      {restoredCode && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {stats && (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-3 border-b border-slate-800/80">
                <div>
                  <div className="text-xs text-slate-400">Input Size</div>
                  <div className="text-lg font-mono font-bold text-slate-200 tabular-nums">
                    {(stats.originalSize / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Restored Output</div>
                  <div className="text-lg font-mono font-bold text-cyan-400 tabular-nums">
                    {(stats.restoredSize / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Items Decoded</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                    {stats.stringsDecoded} tokens
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Pipeline Duration</div>
                  <div className="text-lg font-mono font-bold text-slate-200 tabular-nums">
                    {stats.durationMs} ms
                  </div>
                </div>
              </div>

              {notes.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-xs font-semibold text-slate-300">Operations Applied:</div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                    {notes.map((note, idx) => (
                      <span key={idx} className="bg-slate-850 px-2.5 py-1 rounded border border-slate-700/60 text-slate-300">
                        ✓ {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w-full flex flex-col space-y-3">
            <CodeEditor
              title="Restored &amp; Formatted Code"
              value={restoredCode}
              readOnly={true}
              placeholder="Restored code will appear here after clicking 'Restore Code'..."
              format={format}
              showBackupDownload={false}
            />

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Format cleaned &amp; verified</span>
              </div>
              <button
                onClick={() => setRestoredCode('')}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Output</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
