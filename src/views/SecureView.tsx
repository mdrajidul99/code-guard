import React, { useState } from 'react';
import {
  CodeFormat,
  SecureOptions,
  ProcessingStats
} from '../types/index.ts';
import { detectFormat } from '../utils/detectFormat.ts';
import { SAMPLES } from '../utils/samples.ts';
import { minifyHtml } from '../utils/htmlEngine.ts';
import { minifyJs, obfuscateJs } from '../utils/jsEngine.ts';
import { minifyCss } from '../utils/cssEngine.ts';
import { processBloggerXml } from '../utils/bloggerEngine.ts';
import { CodeEditor } from '../components/CodeEditor.tsx';
import { HonestSecurityNotice } from '../components/HonestSecurityNotice.tsx';
import {
  ShieldCheck,
  Zap,
  Sliders,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  FileCode2,
  Clock,
  Sparkles
} from 'lucide-react';

const DEFAULT_OPTIONS: SecureOptions = {
  // HTML
  htmlMinifyWhitespace: true,
  htmlRemoveComments: true,
  htmlMinifyInlineCss: true,
  htmlMinifyInlineJs: true,
  htmlProtectContainer: false,

  // JS
  jsMinifyWhitespace: true,
  jsRemoveComments: true,
  jsMangleIdentifiers: true,
  jsEncodeStringsHex: true,
  jsStringArrayRotation: true,
  jsConvertNumbersToHex: true,
  jsAddTamperProtection: false,

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

export const SecureView: React.FC = () => {
  const [sourceCode, setSourceCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [format, setFormat] = useState<CodeFormat>('auto');
  const [detectedFormat, setDetectedFormat] = useState<CodeFormat | null>(null);
  const [options, setOptions] = useState<SecureOptions>(DEFAULT_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load sample code
  const handleLoadSample = (targetFormat?: CodeFormat) => {
    const fmt = targetFormat || (format === 'auto' ? 'html' : format);
    const key = fmt === 'auto' ? 'html' : fmt;
    setSourceCode(SAMPLES[key as keyof typeof SAMPLES] || SAMPLES.html);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setSourceCode('');
    setOutputCode('');
    setStats(null);
    setErrorMsg(null);
  };

  const handleReset = () => {
    setOutputCode('');
    setStats(null);
    setErrorMsg(null);
    setOptions(DEFAULT_OPTIONS);
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
      // 1. Resolve format
      const activeFormat = format === 'auto' ? detectFormat(sourceCode) : format;
      setDetectedFormat(activeFormat);

      let result = '';

      // 2. Format-aware processing pipeline
      switch (activeFormat) {
        case 'html':
          result = minifyHtml(sourceCode, options);
          break;

        case 'javascript':
          if (
            options.jsMangleIdentifiers ||
            options.jsEncodeStringsHex ||
            options.jsStringArrayRotation ||
            options.jsConvertNumbersToHex ||
            options.jsAddTamperProtection
          ) {
            result = obfuscateJs(sourceCode, options);
          } else {
            result = minifyJs(sourceCode, options);
          }
          break;

        case 'css':
          result = minifyCss(sourceCode, options);
          break;

        case 'blogger':
          result = processBloggerXml(sourceCode, options);
          break;

        default:
          result = minifyHtml(sourceCode, options);
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

  const activeEffectiveFormat = format === 'auto' ? (detectedFormat || 'html') : format;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Code Protection Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Secure Code Workspace
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Format-aware minification, identifier mangling, string obfuscation, and Blogger XML preservation executed locally in your browser.
          </p>
        </div>

        {/* Global Format Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-400 shrink-0">Source Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as CodeFormat)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
          >
            <option value="auto">Auto Detect Format</option>
            <option value="html">HTML (Web Document)</option>
            <option value="javascript">JavaScript (Script & Logic)</option>
            <option value="css">CSS (Stylesheet)</option>
            <option value="blogger">Blogger XML (Theme Template)</option>
          </select>
        </div>
      </div>

      {/* Honest Security Disclaimer */}
      <HonestSecurityNotice compact />

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

      {/* Stats KPI Strip (when processed) */}
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
            <div className="text-xs text-slate-400">Size Change</div>
            <div className={`text-lg font-mono font-bold tabular-nums ${stats.reductionPercentage >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stats.reductionPercentage >= 0 ? `-${stats.reductionPercentage}%` : `+${Math.abs(stats.reductionPercentage)}%`}
            </div>
            <div className="text-[11px] text-slate-500">
              {stats.reductionPercentage >= 0 ? 'Compressed' : 'Expanded (Obfuscated)'}
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

      {/* Editor Grid: Source (Left) & Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* Source Editor */}
        <div className="flex flex-col space-y-3">
          <CodeEditor
            title="Source Code Input"
            value={sourceCode}
            onChange={setSourceCode}
            placeholder={`Paste your ${format === 'auto' ? 'HTML, JS, CSS, or Blogger XML' : format.toUpperCase()} source here...`}
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

        {/* Processed Output Editor */}
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

          {outputCode && (
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for production deployment</span>
              </div>
              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Results</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Processing Controls and Granular Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={executeSecureCode}
              disabled={isProcessing || !sourceCode.trim()}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Transforming Source...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Code</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showAdvanced ? 'Hide Fine-Tuning' : 'Configure Settings'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Pipeline: <span className="text-cyan-300 font-mono uppercase">{activeEffectiveFormat}</span> Mode
          </div>
        </div>

        {/* Fine-Tuning Options Panel */}
        {showAdvanced && (
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-300 animate-in fade-in">
            {/* HTML Options */}
            <div className="space-y-2.5">
              <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>HTML Pipeline</span>
              </h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.htmlMinifyWhitespace}
                  onChange={(e) => setOptions({ ...options, htmlMinifyWhitespace: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Collapse Non-Pre Whitespace</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.htmlRemoveComments}
                  onChange={(e) => setOptions({ ...options, htmlRemoveComments: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Remove HTML Comments</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.htmlMinifyInlineCss}
                  onChange={(e) => setOptions({ ...options, htmlMinifyInlineCss: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Minify Inline &lt;style&gt;</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.htmlMinifyInlineJs}
                  onChange={(e) => setOptions({ ...options, htmlMinifyInlineJs: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Minify Inline &lt;script&gt;</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={options.htmlProtectContainer}
                  onChange={(e) => setOptions({ ...options, htmlProtectContainer: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-cyan-300 font-medium">Self-Extracting HTML Container</span>
              </label>
            </div>

            {/* JavaScript Options */}
            <div className="space-y-2.5">
              <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>JavaScript Obfuscation</span>
              </h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.jsMinifyWhitespace}
                  onChange={(e) => setOptions({ ...options, jsMinifyWhitespace: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Minify & Compress Syntax</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.jsRemoveComments}
                  onChange={(e) => setOptions({ ...options, jsRemoveComments: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Strip Comments</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.jsMangleIdentifiers}
                  onChange={(e) => setOptions({ ...options, jsMangleIdentifiers: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Identifier Mangling (_0x...)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.jsEncodeStringsHex}
                  onChange={(e) => setOptions({ ...options, jsEncodeStringsHex: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Hex Escape Strings (\\xHH)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.jsStringArrayRotation}
                  onChange={(e) => setOptions({ ...options, jsStringArrayRotation: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Scrambled String Table Lookup</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.jsConvertNumbersToHex}
                  onChange={(e) => setOptions({ ...options, jsConvertNumbersToHex: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Radix Hex Numbers (0xff)</span>
              </label>
            </div>

            {/* CSS Options */}
            <div className="space-y-2.5">
              <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>CSS Pipeline</span>
              </h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.cssMinifyWhitespace}
                  onChange={(e) => setOptions({ ...options, cssMinifyWhitespace: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Minify Selectors & Blocks</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.cssRemoveComments}
                  onChange={(e) => setOptions({ ...options, cssRemoveComments: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Strip CSS Comments</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.cssShortenHexColors}
                  onChange={(e) => setOptions({ ...options, cssShortenHexColors: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Shorten Hex Colors (#ffffff -&gt; #fff)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.cssRemoveZeroUnits}
                  onChange={(e) => setOptions({ ...options, cssRemoveZeroUnits: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Omit Zero Units (0px -&gt; 0)</span>
              </label>
            </div>

            {/* Blogger XML Options */}
            <div className="space-y-2.5">
              <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Blogger XML Pipeline</span>
              </h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.bloggerValidateXml}
                  onChange={(e) => setOptions({ ...options, bloggerValidateXml: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Strict XML Validation</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.bloggerMinifyWhitespace}
                  onChange={(e) => setOptions({ ...options, bloggerMinifyWhitespace: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Safe XML Whitespace Trim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.bloggerMinifyCdataCss}
                  onChange={(e) => setOptions({ ...options, bloggerMinifyCdataCss: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Minify CDATA &lt;b:skin&gt; Styles</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.bloggerProtectTags}
                  onChange={(e) => setOptions({ ...options, bloggerProtectTags: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Preserve Widgets &amp; Includables</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
