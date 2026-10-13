import React, { useState } from 'react';
import {
  CodeFormat,
  SecureOptions,
  ProcessingStats,
  ActivePage
} from '../types/index.ts';
import { detectFormat } from '../utils/detectFormat.ts';
import { SAMPLES } from '../utils/samples.ts';
import { minifyHtml } from '../utils/htmlEngine.ts';
import { minifyJs, obfuscateJs } from '../utils/jsEngine.ts';
import { minifyCss } from '../utils/cssEngine.ts';
import { processBloggerXml } from '../utils/bloggerEngine.ts';
import { CodeEditor } from '../components/CodeEditor.tsx';
import {
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play,
  X,
  Lock,
  EyeOff,
  ShieldAlert
} from 'lucide-react';

const DEFAULT_OPTIONS: SecureOptions = {
  // HTML - Ultra Protection Active by Default
  htmlMinifyWhitespace: true,
  htmlRemoveComments: true,
  htmlMinifyInlineCss: true,
  htmlMinifyInlineJs: true,
  htmlProtectContainer: true, // TRUE: Encrypts markup & blocks right-click/inspect/view-source!

  // JS - Anti-Tamper & Obfuscation Active by Default
  jsMinifyWhitespace: true,
  jsRemoveComments: true,
  jsMangleIdentifiers: true,
  jsEncodeStringsHex: true,
  jsStringArrayRotation: true,
  jsConvertNumbersToHex: true,
  jsAddTamperProtection: true, // TRUE: Injects anti-debugger trap & inspection blocks!

  // CSS
  cssMinifyWhitespace: true,
  cssRemoveComments: true,
  cssShortenHexColors: true,
  cssRemoveZeroUnits: true,

  // Blogger XML
  bloggerValidateXml: true,
  bloggerMinifyWhitespace: true,
  bloggerMinifyCdataCss: true,
  bloggerProtectTags: true,
};

interface SecureViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const SecureView: React.FC<SecureViewProps> = ({ onBack, onNavigate }) => {
  const [sourceCode, setSourceCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [format, setFormat] = useState<CodeFormat>('html');
  const [shieldMode, setShieldMode] = useState<'ultra' | 'minify'>('ultra');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);

  // Load sample code
  const handleLoadSample = (targetFormat?: CodeFormat) => {
    const fmt = targetFormat || format;
    setSourceCode(SAMPLES[fmt as keyof typeof SAMPLES] || SAMPLES.html);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setSourceCode('');
    setOutputCode('');
    setStats(null);
    setErrorMsg(null);
    setShowLivePreview(false);
  };

  const handleReset = () => {
    setOutputCode('');
    setStats(null);
    setErrorMsg(null);
    setShowLivePreview(false);
  };

  const executeSecureCode = () => {
    if (!sourceCode.trim()) {
      setErrorMsg('Please paste or write source code before initiating security processing.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    const startTime = performance.now();

    try {
      const activeFormat = format;

      const effectiveOptions: SecureOptions = {
        ...DEFAULT_OPTIONS,
        htmlProtectContainer: shieldMode === 'ultra',
        jsAddTamperProtection: shieldMode === 'ultra',
        jsMangleIdentifiers: shieldMode === 'ultra',
        jsEncodeStringsHex: shieldMode === 'ultra',
        jsStringArrayRotation: shieldMode === 'ultra',
        jsConvertNumbersToHex: shieldMode === 'ultra',
      };

      let result = '';

      // 2. Format-aware processing pipeline
      switch (activeFormat) {
        case 'html':
          result = minifyHtml(sourceCode, effectiveOptions);
          break;

        case 'javascript':
          if (shieldMode === 'ultra') {
            result = obfuscateJs(sourceCode, effectiveOptions);
          } else {
            result = minifyJs(sourceCode, effectiveOptions);
          }
          break;

        case 'css':
          result = minifyCss(sourceCode, effectiveOptions);
          break;

        case 'blogger':
          result = processBloggerXml(sourceCode, effectiveOptions);
          break;

        default:
          result = minifyHtml(sourceCode, effectiveOptions);
      }

      const durationMs = Math.round(performance.now() - startTime);
      const originalBytes = sourceCode.length;
      const processedBytes = result.length;
      const reduction = originalBytes > 0
        ? Math.round(((originalBytes - processedBytes) / originalBytes) * 100)
        : 0;

      setOutputCode(result);
      setStats({
        originalSize: originalBytes,
        processedSize: processedBytes,
        reductionPercentage: reduction,
        durationMs,
        detectedFormat: activeFormat,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setOutputCode('');
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeEffectiveFormat = format;

  // Prepare HTML payload for live preview testing
  const getPreviewDoc = () => {
    if (!outputCode) return '';
    if (activeEffectiveFormat === 'html') {
      return outputCode;
    }
    if (activeEffectiveFormat === 'javascript') {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>JS Preview Test</title><style>body{background:#0f172a;color:#f8fafc;font-family:sans-serif;padding:24px;}#log{background:#020617;padding:16px;border-radius:8px;font-family:monospace;margin-top:16px;border:1px solid #1e293b;}</style></head><body><h3>JavaScript Live Execution Test</h3><p>Protected script is executing below:</p><div id="log">Running script...</div><script>var l=document.getElementById("log");var _orig=l.innerText;<\/script><script>${outputCode}<\/script></body></html>`;
    }
    if (activeEffectiveFormat === 'css') {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${outputCode}</style></head><body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;padding:24px;"><h2>CSS Stylesheet Test</h2><p>Styles applied successfully.</p></body></html>`;
    }
    return outputCode;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
            <span>Secure Code Workspace</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            High-strength code protection engine with encrypted runtime containers, identifier mangling, anti-inspection shields, and anti-debugging defense.
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
            <option value="html">HTML (Web Document)</option>
            <option value="javascript">JavaScript (Script &amp; Logic)</option>
            <option value="css">CSS (Stylesheet)</option>
            <option value="blogger">Blogger XML (Theme Template)</option>
          </select>
        </div>
      </div>

      {/* Error Feedback Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-rose-100">Processing Interrupted</h5>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 1. Source Code Import Box (Always visible at the top) */}
      <div className="flex flex-col space-y-3">
        <CodeEditor
          title="Source Code Input"
          value={sourceCode}
          onChange={setSourceCode}
          placeholder={`Paste your ${format.toUpperCase()} source here...`}
          format={activeEffectiveFormat}
          onClear={handleClear}
          onLoadSample={() => handleLoadSample()}
          showBackupDownload={true}
          originalSourceForBackup={sourceCode}
        />

        {format === 'blogger' && (
          <div className="text-[11px] text-amber-400/90 bg-amber-950/30 border border-amber-900/40 p-2.5 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Important: Always save a backup of your Blogger XML template before pasting into Blogger theme editor.</span>
          </div>
        )}
      </div>

      {/* 2. Processing Controls (Below Input Box) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={executeSecureCode}
              disabled={isProcessing || !sourceCode.trim()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Securing Source Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Code</span>
                </>
              )}
            </button>

            {/* Shield Level Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                type="button"
                onClick={() => setShieldMode('ultra')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  shieldMode === 'ultra'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ultra Shield Protection (Anti-Theft)
              </button>
              <button
                type="button"
                onClick={() => setShieldMode('minify')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  shieldMode === 'minify'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Minify Only
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Pipeline: <span className="text-cyan-300 font-mono uppercase">{activeEffectiveFormat}</span> Mode
          </div>
        </div>
      </div>

      {/* 3. Output Box & Stats (Appears BELOW buttons when code is processed) */}
      {outputCode && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Active Protection Verification Badges */}
          {shieldMode === 'ultra' && (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-medium">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Security Engine Verification:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-800/80 text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Anti-View-Source (Encrypted)
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-800/80 text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Anti-Right-Click (Locked)
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-800/80 text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Anti-DevTools / F12 (Blocked)
                </span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-800/80 text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Executable
                </span>
              </div>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Original Size</div>
                <div className="text-lg font-mono font-bold text-slate-100 tabular-nums">
                  {(stats.originalSize / 1024).toFixed(2)} KB
                </div>
                <div className="text-[11px] text-slate-500">{stats.originalSize} chars</div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Secured Size</div>
                <div className="text-lg font-mono font-bold text-cyan-400 tabular-nums">
                  {(stats.processedSize / 1024).toFixed(2)} KB
                </div>
                <div className="text-[11px] text-slate-500">{stats.processedSize} chars</div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Security Layer</div>
                <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                  {shieldMode === 'ultra' ? 'High Shield' : 'Minified'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {shieldMode === 'ultra' ? 'Multi-Layer Protected' : 'Whitespace Compressed'}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Execution Speed</div>
                <div className="text-lg font-mono font-bold text-slate-100 tabular-nums">
                  {stats.durationMs} ms
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{stats.timestamp}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <CodeEditor
              title="Secured Output"
              value={outputCode}
              readOnly={true}
              placeholder="Processed output will appear here after clicking 'Secure Code'..."
              format={activeEffectiveFormat}
              showBackupDownload={true}
              originalSourceForBackup={sourceCode}
            />

            <div className="flex items-center justify-between text-xs text-slate-400 px-1 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Production Ready</span>
                </div>

                {/* Test & Run Output in Live Sandbox */}
                <button
                  type="button"
                  onClick={() => setShowLivePreview(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test &amp; Run Output</span>
                </button>
              </div>

              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Results</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Sandbox Test Modal */}
      {showLivePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-current" />
                <h3 className="font-semibold text-white text-sm">
                  Live Execution Test (Sandbox)
                </h3>
                <span className="text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  Try Right-Click or F12 inside preview to verify protection
                </span>
              </div>
              <button
                onClick={() => setShowLivePreview(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-950 min-h-[400px] p-2">
              <iframe
                title="Sandbox Preview"
                srcDoc={getPreviewDoc()}
                sandbox="allow-scripts allow-modals"
                className="w-full h-full min-h-[400px] rounded-lg border border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Code runs locally in an isolated browser sandbox.</span>
              <button
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
