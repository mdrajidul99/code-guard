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
  CheckCircle2,
  Info,
  ShieldAlert,
  History,
  Download,
} from 'lucide-react';

type RestoreFormat = CodeFormat | 'javascript' | 'css';

const RESTORE_SAMPLES: Record<RestoreFormat, string> = {
  html: `<!-- CodeGuard Sample Reversible Wrapper -->
<script type="text/javascript">
(function() {
  var _0xdata = "PGRpdiBjbGFzcz0idXNlci1jYXJkIj4KICA8aDI+U2VjdXJlIENsaWVudCBQb3J0YWw8L2gyPgogIDxwPldlbGNvbWUgdG8geW91ciBzZWN1cmVkIGRhc2hib2FyZC48L3A+CiAgPGJ1dHRvbiBjbGFzcz0iYnRuIiBvbmNsaWNrPSJhbGVydCgnQ29ubmVjdGVkIScpIj5Db25uZWN0PC9idXR0b24+CjwvZGl2Pg==";
  document.write(atob(_0xdata));
})();
</script>`,

  blogger: `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b'>
<head>
  <b:skin><![CDATA[body{background:#fff;color:#222;}]]></b:skin>
  <script type='text/javascript'>
  //<![CDATA[
  eval(atob("ZnVuY3Rpb24gcmVuZGVyQmxvZyhpZCkgewogIGNvbnNvbGUubG9nKCdSZW5kZXJpbmcgYmxvZyBwb3N0OiAnICsgaWQpOwp9"));
  //]]>
  </script>
</head>
<body>
  <b:section id='main'><b:widget id='Blog1' type='Blog'><b:includable id='main'><h1>Blog</h1></b:includable></b:widget></b:section>
</body>
</html>`,

  javascript: `var msg = "\\x48\\x65\\x6c\\x6c\\x6f\\x20\\x43\\x6f\\x64\\x65\\x47\\x75\\x61\\x72\\x64";
var greeting = "\\u0057\\u0065\\u006c\\u0063\\u006f\\u006d\\u0065";
function greetUser(name){if(!name){return msg;}return greeting+" "+name;}`,

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
    deescapeHex: true,
    deescapeUnicode: true,
    decodeBase64AndUnescape: true,
    indentSize: 2,
  });
  const [stats, setStats] = useState<RestoreStats | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [isOneWayDetected, setIsOneWayDetected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backups, setBackups] = useState<BackupEntry[]>([]);

  useEffect(() => {
    setBackups(getStoredBackups());
  }, []);

  const handleClear = () => {
    setSourceCode('');
    setRestoredCode('');
    setStats(null);
    setNotes([]);
    setIsOneWayDetected(false);
    setErrorMsg(null);
  };

  const handleLoadSample = (targetFormat?: RestoreFormat) => {
    const fmt = targetFormat || format;
    setSourceCode(RESTORE_SAMPLES[fmt] || RESTORE_SAMPLES.html);
    setErrorMsg(null);
  };

  const handleExecuteRestore = (beautifyOnly = false) => {
    if (!sourceCode.trim()) {
      setErrorMsg('অনুগ্রহ করে ইনপুট বক্সে কোড পেস্ট করুন।');
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
        decodeBase64AndUnescape: !beautifyOnly,
      };

      const result = restoreCode(sourceCode, format, effectiveOptions);
      setRestoredCode(result.code);
      setStats(result.stats);
      setNotes(result.notes);
      setIsOneWayDetected(result.isOneWayObfuscated);
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
    switch (format) {
      case 'html':
        return 'Paste HTML code (encoded, minified, or messy) here...';
      case 'blogger':
        return 'Paste Blogger XML theme or widget code here...';
      case 'javascript':
        return 'Paste JavaScript code (Base64 / Hex \\xHH / Unicode \\uHHHH / minified JS) here...';
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
            Decode reversible Base64 / Hex (<code className="font-mono">\x..</code>) / Unicode (<code className="font-mono">\u....</code>) / <code className="font-mono">unescape</code> wrappers and cleanly format any HTML, CSS, XML, or JS using <code className="font-mono">js-beautify</code>.
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

      {/* Honest One-Way Obfuscation Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <div className="font-semibold">গুরুত্বপূর্ণ ও সৎ তথ্য (Restore Limitation):</div>
          <p className="text-amber-900 dark:text-amber-200/90 text-xs">
            <strong>RC4 + Control Flow Flattening + Self-Defending</strong> দিয়ে এনকোড করা আসল Obfuscated কোড সম্পূর্ণ One-Way (অপরিবর্তনীয়) — এটি ডিকোড করে আগের সোর্স কোডে ফেরানো সম্ভব নয়। তাই সোর্স কোড সুরক্ষিত রাখতে সবসময় Secure Code ট্যাবের <strong>Download Original Backup</strong> অথবা অটো-সেভড লোকাল ব্যাকআপ ব্যবহার করুন। তবে যেকোনো সাধারণ <strong>Base64 / Hex (\x..) / Unicode (\u....) / unescape</strong> ডিকোড এবং যেকোনো HTML, CSS, Blogger XML বা JS কোড <strong>Beautify Code Only</strong> বাটনের মাধ্যমে <code className="font-mono">js-beautify</code> দিয়ে সুন্দরভাবে সাজানো যাবে।
          </p>
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
              <Sparkles className="w-4 h-4" />
              <span>Restore &amp; Decode</span>
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
          {isOneWayDetected && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                এই কোডে Strong One-Way Obfuscation (RC4 / Control Flow Flattening / Self-Defending) শনাক্ত হয়েছে। তাই শুধুমাত্র <code className="font-mono">js-beautify</code> দিয়ে ইন্ডেন্টেশন ও ফরম্যাটিং করা হয়েছে; মূল ভেরিয়েবল নাম বা এনক্রিপ্টেড লজিক ডিকোড করা সম্ভব নয়।
              </span>
            </div>
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
                  <div className="text-xs text-slate-500 dark:text-slate-400">Items Decoded</div>
                  <div className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {stats.itemsDecoded} tokens
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

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Formatted cleanly via js-beautify</span>
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
    </div>
  );
};
