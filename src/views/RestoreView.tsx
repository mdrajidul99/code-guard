import React, { useState } from 'react';
import {
  CodeFormat,
  RestoreOptions,
  RestoreStats,
  ActivePage
} from '../types/index.ts';
import { detectFormat } from '../utils/detectFormat.ts';
import { restoreCode } from '../utils/restoreEngine.ts';
import { CodeEditor } from '../components/CodeEditor.tsx';
import {
  RotateCcw,
  Sparkles,
  AlignLeft,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Layers
} from 'lucide-react';

const SAMPLE_OBFUSCATED = `const _0x4e1a=["\\x43\\x6c\\x69\\x65\\x6e\\x74\\x20\\x53\\x65\\x73\\x73\\x69\\x6f\\x6e\\x20\\x41\\x63\\x74\\x69\\x76\\x65","\\x63\\x6f\\x6e\\x66\\x69\\x67\\x75\\x72\\x65\\x64\\x4e\\x6f\\x64\\x65\\x73"];function _0x8f2c(_0xidx){return _0x4e1a[_0xidx];};function _0x1a00(_0x1a01,_0x1a02){const _0x1a03=_0x8f2c(0);if(_0x1a01>0x10){console.log(_0x1a03,_0x8f2c(1),_0x1a02);}return true;}_0x1a00(0x20,"NodeCluster_US_EAST");`;

interface RestoreViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const RestoreView: React.FC<RestoreViewProps> = ({ onBack, onNavigate }) => {
  const [sourceCode, setSourceCode] = useState<string>('');
  const [restoredCode, setRestoredCode] = useState<string>('');
  const [format, setFormat] = useState<CodeFormat>('javascript');
  const [options, setOptions] = useState<RestoreOptions>({
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

  const handleLoadSample = () => {
    setSourceCode(SAMPLE_OBFUSCATED);
    setFormat('javascript');
    setErrorMsg(null);
  };

  const handleExecuteRestore = (beautifyOnly = false) => {
    if (!sourceCode.trim()) {
      setErrorMsg('Please paste code into the editor to restore or beautify.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const activeFormat = format;
      const effectiveOptions: Partial<RestoreOptions> = {
        ...options,
        beautifyOnly,
        // If beautify only, disable hex/array restoration
        deescapeHex: beautifyOnly ? false : options.deescapeHex,
        deescapeUnicode: beautifyOnly ? false : options.deescapeUnicode,
        resolveStringArrays: beautifyOnly ? false : options.resolveStringArrays,
      };

      const result = restoreCode(sourceCode, activeFormat, effectiveOptions);
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

  const detectedLanguage: CodeFormat = format;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Restore &amp; Beautify Code
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Re-indent minified markup, reconstruct string lookup tables, decode hexadecimal and unicode escape sequences, and restore supported transformations.
          </p>
        </div>

        {/* Global Format Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-400 shrink-0">Select Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as CodeFormat)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="html">HTML Document</option>
            <option value="css">CSS Stylesheet</option>
            <option value="blogger">Blogger XML Template</option>
          </select>
        </div>
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

      {/* 1. Source Code Import Box (Always visible at the top) */}
      <div className="flex flex-col space-y-3">
        <CodeEditor
          title="Minified / Obfuscated Code"
          value={sourceCode}
          onChange={setSourceCode}
          placeholder="Paste minified, formatted, or escaped code here..."
          format={detectedLanguage}
          onClear={handleClear}
          onLoadSample={handleLoadSample}
          showBackupDownload={true}
          originalSourceForBackup={sourceCode}
        />
      </div>

      {/* 2. Action Toolbar (Below Input Box) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Primary Full Restore Button */}
            <button
              onClick={() => handleExecuteRestore(false)}
              disabled={isProcessing || !sourceCode.trim()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Restore Code</span>
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

          <div className="text-xs text-slate-400">
            Target: <span className="text-cyan-300 font-mono uppercase">{detectedLanguage}</span> Mode
          </div>
        </div>
      </div>

      {/* 3. Output Box & Stats Report (Appears BELOW buttons when code is restored) */}
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
                  <div className="text-xs text-slate-400">Strings Unpacked</div>
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

          <div className="flex flex-col space-y-3">
            <CodeEditor
              title="Restored &amp; Formatted Code"
              value={restoredCode}
              readOnly={true}
              placeholder="Restored code will appear here after clicking 'Restore Code' or 'Beautify Code'..."
              format={detectedLanguage}
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
