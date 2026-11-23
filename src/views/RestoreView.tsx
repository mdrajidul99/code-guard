import React, { useState, useEffect } from 'react';
import {
  ActivePage,
  BackupEntry,
  CodeFormat,
  RestoreOptions,
  RestoreStats,
} from '../types/index.ts';
import { restoreCode } from '../utils/restoreEngine.ts';
import { getStoredBackups } from '../utils/backupStorage.ts';
import { downloadFile, getFormatFileInfo } from '../utils/download.ts';
import { CodeEditor } from '../components/CodeEditor.tsx';
import {
  RotateCcw,
  Sparkles,
  AlignLeft,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  History,
  Download,
  Play,
  X,
} from 'lucide-react';

type RestoreFormat = CodeFormat | 'javascript' | 'css';

const RESTORE_SAMPLES: Record<RestoreFormat, string> = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Restored App Demo</title>
</head>
<body>
  <div id="cg-app-mount"></div>
  <script>
    (function(){var s=document.createElement('style');s.textContent=".card{max-width:420px;margin:24px auto;padding:20px;border-radius:12px;background:#0f172a;color:#f8fafc;font-family:sans-serif;}.btn{padding:8px 16px;border:none;border-radius:8px;background:#06b6d4;color:#fff;cursor:pointer;}";document.head.appendChild(s);})();
  </script>
  <script>
    (function(){var m=document.getElementById('cg-app-mount');if(m){m.innerHTML="<div class=\\"card\\"><h2>CodeGuard Restore Demo</h2><p>বাংলা এবং English লেআউট সঠিকভাবে রিস্টোর হয়েছে।</p><button class=\\"btn\\" onclick=\\"document.getElementById('status').textContent='Active!'\\">Verify</button><p id=\\"status\\"></p></div>";}})();
  </script>
</body>
</html>`,

  blogger: `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b'>
<head>
  <b:skin><![CDATA[/*Secured by CodeGuard*/]]></b:skin>
  <script type='text/javascript'>
  //<![CDATA[
  (function(){var s=document.createElement('style');s.textContent="header{padding:16px;background:#0f172a;color:#fff;}footer{padding:12px;text-align:center;color:#64748b;}";document.head.appendChild(s);})();
  //]]>
  </script>
</head>
<body>
  <header class='site-header' id='cg-header-mount'></header>
  <b:section id='main'><b:widget id='Blog1' type='Blog'><b:includable id='main'><h1>Blog Posts</h1></b:includable></b:widget></b:section>
  <footer class='site-footer' id='cg-footer-mount'></footer>
  <script type='text/javascript'>
  //<![CDATA[
  (function(){var _m=[["cg-header-mount","<div class='brand'>My Blogger Theme</div>"],["cg-footer-mount","<p>All rights reserved.</p>"]];for(var i=0;i<_m.length;i++){var el=document.getElementById(_m[i][0]);if(el){el.innerHTML=_m[i][1];}}})();
  //]]>
  </script>
</body>
</html>`,

  javascript: `eval(function(p,a,c,k,e,d){e=function(c){return c.toString(36)};if(!''.replace(/^/,String)){while(c--){d[c.toString(a)]=k[c]||c.toString(a)}k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c])}}return p}('0 1(2){3"4, "+2+"!"}5.6(1("7"));',8,8,'function|greetUser|name|return|Hello|console|log|CodeGuard'.split('|'),0,{}))`,

  css: `:root{--bg:#0f172a;--fg:#f8fafc;}body{margin:0;padding:16px;background:var(--bg);color:var(--fg);}@media(min-width:768px){.card{padding:24px;}}`,
};

interface RestoreViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const RestoreView: React.FC<RestoreViewProps> = () => {
  const [sourceCode, setSourceCode] = useState<string>('');
  const [restoredCode, setRestoredCode] = useState<string>('');
  const [format, setFormat] = useState<RestoreFormat>('html');
  const [options] = useState<RestoreOptions>({
    beautifyOnly: false,
    indentSize: 2,
  });
  const [stats, setStats] = useState<RestoreStats | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [nonReversibleLocked, setNonReversibleLocked] = useState(false);
  const [xmlValidationError, setXmlValidationError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => {
    setBackups(getStoredBackups());
  }, []);

  const handleClear = () => {
    setSourceCode('');
    setRestoredCode('');
    setStats(null);
    setNotes([]);
    setNonReversibleLocked(false);
    setXmlValidationError(null);
    setErrorMsg(null);
    setShowLivePreview(false);
  };

  const handleLoadSample = (targetFormat?: RestoreFormat) => {
    const fmt = targetFormat || format;
    setSourceCode(RESTORE_SAMPLES[fmt] || RESTORE_SAMPLES.html);
    setErrorMsg(null);
  };

  const handleExecuteRestore = async (beautifyOnly = false) => {
    if (!sourceCode.trim()) {
      setErrorMsg('অনুগ্রহ করে ইনপুট বক্সে কোড পেস্ট করুন।');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const result = await restoreCode(sourceCode, format, {
        ...options,
        beautifyOnly,
      });
      setRestoredCode(result.code);
      setStats(result.stats);
      setNotes(result.notes);
      setNonReversibleLocked(result.nonReversibleLocked);
      setXmlValidationError(result.xmlValidationError);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Restoration failed: ${msg}`);
      setRestoredCode('');
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadRestored = () => {
    if (!restoredCode) return;
    const { extension, mimeType } = getFormatFileInfo(format);
    downloadFile(restoredCode, `codeguard_restored_${Date.now()}${extension}`, mimeType);
  };

  const getPlaceholderText = () => {
    switch (format) {
      case 'html':
        return 'Paste HTML or Web App code (encoded, minified, or messy) here...';
      case 'blogger':
        return 'Paste Blogger XML theme or widget code here...';
      case 'javascript':
        return 'Paste encoded, packed, or unformatted JavaScript code here...';
      case 'css':
        return 'Paste minified or unformatted CSS code here...';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-7">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Restore, Decode &amp; Beautify Code
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Decode encoded scripts and cleanly restore or format your HTML, CSS, JavaScript, and Blogger XML code.
          </p>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="cg-restore-format" className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            Select Format:
          </label>
          <select
            id="cg-restore-format"
            value={format}
            onChange={(e) => {
              setFormat(e.target.value as RestoreFormat);
              setErrorMsg(null);
              setXmlValidationError(null);
            }}
            className="bg-white dark:bg-slate-900 border border-cyan-600/40 dark:border-cyan-500/40 text-slate-900 dark:text-cyan-200 text-xs sm:text-sm rounded-lg px-3.5 py-2 font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="html">HTML (Website &amp; App)</option>
            <option value="blogger">Blogger XML</option>
            <option value="javascript">JavaScript (.js)</option>
            <option value="css">CSS Stylesheet (.css)</option>
          </select>
        </div>
      </div>

      {/* Quick Access to Stored Original Backups */}
      {backups.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>আপনার ব্রাউজারে সংরক্ষিত সর্বশেষ {backups.length}টি অরিজিনাল ব্যাকআপ:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {backups.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  const { extension, mimeType } = getFormatFileInfo(entry.format);
                  downloadFile(entry.code, `codeguard_original_backup_${entry.timestamp}${extension}`, mimeType);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-cyan-500/50 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span className="font-mono uppercase">{entry.format}</span>
                <span>·</span>
                <span className="font-mono tabular-nums">{(entry.size / 1024).toFixed(1)} KB</span>
                <span>·</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold">Restoration Issue</h5>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 1. Source Input Editor */}
      <div className="w-full flex flex-col space-y-3">
        <CodeEditor
          title={`Input ${format.toUpperCase()} Code`}
          value={sourceCode}
          onChange={setSourceCode}
          placeholder={getPlaceholderText()}
          format={format}
          onClear={handleClear}
          onLoadSample={() => handleLoadSample()}
          showBackupDownload={false}
        />
      </div>

      {/* 2. Action Toolbar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => handleExecuteRestore(false)}
              disabled={isProcessing || !sourceCode.trim()}
              className="px-7 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Restoring Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Restore &amp; Decode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleExecuteRestore(true)}
              disabled={isProcessing || !sourceCode.trim()}
              className="px-5 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlignLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Beautify Code Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Output & Report */}
      {restoredCode && (
        <div className="space-y-6">
          {/* Polite Non-Reversible Lock Notice (only if vault missed + 0 decode passes + 0 reconstructions + strong lock) */}
          {nonReversibleLocked && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                This code is protected with non-reversible locking and cannot be decoded on this device. Please use your saved Backup file or restore from the browser where it was originally secured.
              </span>
            </div>
          )}

          {/* Blogger XML Validation Banner */}
          {format === 'blogger' && (
            xmlValidationError ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">XML Validation Notice</div>
                  <p className="font-mono text-xs break-words">{xmlValidationError}</p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>XML Validation Passed — restored Blogger XML structure is valid and well-formed.</span>
              </div>
            )
          )}

          {stats && (
            <div className="rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Input Size</div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-200 tabular-nums">
                    {(stats.originalSize / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Formatted Output</div>
                  <div className="text-lg font-mono font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
                    {(stats.restoredSize / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Restored Items</div>
                  <div className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {stats.vaultRecovered ? 'Exact Vault' : `${stats.itemsDecoded} items`}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Duration</div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-200 tabular-nums">
                    {stats.durationMs} ms
                  </div>
                </div>
              </div>

              {notes.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Operations Applied:</div>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {notes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="w-full flex flex-col space-y-3">
            <CodeEditor
              title="Restored & Formatted Output"
              value={restoredCode}
              readOnly={true}
              placeholder="Formatted output will appear here..."
              format={format}
              showBackupDownload={false}
            />

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1 flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Formatted cleanly</span>
                </div>

                {(format === 'html' || format === 'blogger') && (
                  <button
                    type="button"
                    onClick={() => setShowLivePreview(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test &amp; Run Restored Output</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadRestored}
                  className="px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/80 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-700/80 text-cyan-800 dark:text-cyan-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ({getFormatFileInfo(format).extension})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setRestoredCode('')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Output</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Sandbox Preview Modal for Restored Output */}
      {showLivePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Test &amp; Run Restored Output
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close restored preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 min-h-[420px] p-2">
              <iframe
                title="Restored Output Preview"
                srcDoc={restoredCode}
                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                className="w-full h-full min-h-[420px] rounded-lg border border-slate-300 dark:border-slate-800 bg-white"
              />
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Code runs locally inside an isolated preview frame.</span>
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
