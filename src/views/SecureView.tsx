import React, { useState, useEffect } from 'react';
import {
  ActivePage,
  BackupEntry,
  CodeFormat,
  ProcessingProgress,
  ProcessingStats,
  SecuritySettings,
  StringArrayEncodingType,
} from '../types/index.ts';
import { SAMPLES } from '../utils/samples.ts';
import { processHtmlDocument } from '../utils/htmlEngine.ts';
import { processBloggerXml } from '../utils/bloggerEngine.ts';
import { parseDomainList } from '../utils/jsHelpers.ts';
import { clearStoredBackups, getStoredBackups, saveOriginalBackup } from '../utils/backupStorage.ts';
import { downloadFile, getFormatFileInfo } from '../utils/download.ts';
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
  ShieldAlert,
  Info,
  Globe,
  History,
  Download,
  Trash2,
  Cpu,
} from 'lucide-react';

interface SecureViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  stringArrayEncoding: 'rc4',
  selfDefending: true,
  disableConsoleOutput: true,
  domainLock: '',
  allowBloggerPreview: true,
  hideCssAndHtmlInJs: true,
  antiInspectAndCopy: true,
};

export const SecureView: React.FC<SecureViewProps> = () => {
  const [sourceCode, setSourceCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [format, setFormat] = useState<CodeFormat>('html');
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [xmlValidationError, setXmlValidationError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProcessingStats | null>(null);

  // Backups
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [showBackups, setShowBackups] = useState(false);

  // Live Preview Modal
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<string>('');
  const [previewNotice, setPreviewNotice] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false);

  useEffect(() => {
    setBackups(getStoredBackups());
  }, []);

  const handleLoadSample = (targetFormat?: CodeFormat) => {
    const fmt = targetFormat || format;
    setSourceCode(SAMPLES[fmt] || SAMPLES.html);
    setErrorMsg(null);
    setXmlValidationError(null);
  };

  const handleClear = () => {
    setSourceCode('');
    setOutputCode('');
    setStats(null);
    setErrorMsg(null);
    setXmlValidationError(null);
    setProgress(null);
    setShowLivePreview(false);
  };

  const handleReset = () => {
    setOutputCode('');
    setStats(null);
    setErrorMsg(null);
    setXmlValidationError(null);
    setProgress(null);
    setShowLivePreview(false);
  };

  const executeSecureCode = async () => {
    if (!sourceCode.trim()) {
      setErrorMsg(
        `অনুগ্রহ করে প্রথমে আপনার ${format === 'html' ? 'HTML / Website & App' : 'Blogger XML'} কোড ইনপুট বক্সে পেস্ট করুন।`
      );
      return;
    }

    setErrorMsg(null);
    setXmlValidationError(null);
    setIsProcessing(true);
    setProgress({ stage: 'Web Worker চালু হচ্ছে...', percent: 5 });

    // Auto-save original code backup (last 5 entries in localStorage)
    const updatedBackups = saveOriginalBackup(sourceCode, format);
    setBackups(updatedBackups);

    const startTime = performance.now();

    try {
      if (format === 'html') {
        const res = await processHtmlDocument(sourceCode, settings, {
          forPreview: false,
          onProgress: (p) => setProgress(p),
        });

        const durationMs = Math.round(performance.now() - startTime);
        const originalBytes = sourceCode.length;
        const processedBytes = res.output.length;
        const reduction =
          originalBytes > 0
            ? Math.round(((originalBytes - processedBytes) / originalBytes) * 100)
            : 0;

        setOutputCode(res.output);
        setStats({
          originalSize: originalBytes,
          processedSize: processedBytes,
          reductionPercentage: reduction,
          durationMs,
          format: 'html',
          timestamp: new Date().toLocaleTimeString(),
          scriptsObfuscated: res.scriptsObfuscated,
          cssHidden: res.cssHidden,
          htmlHidden: res.htmlHidden,
          domainLockActive: res.domainLockActive,
        });
      } else {
        const res = await processBloggerXml(sourceCode, settings, {
          forPreview: false,
          onProgress: (p) => setProgress(p),
        });

        const durationMs = Math.round(performance.now() - startTime);
        const originalBytes = sourceCode.length;
        const processedBytes = res.output.length;
        const reduction =
          originalBytes > 0
            ? Math.round(((originalBytes - processedBytes) / originalBytes) * 100)
            : 0;

        setOutputCode(res.output);
        setXmlValidationError(res.xmlValidationError);
        setStats({
          originalSize: originalBytes,
          processedSize: processedBytes,
          reductionPercentage: reduction,
          durationMs,
          format: 'blogger',
          timestamp: new Date().toLocaleTimeString(),
          scriptsObfuscated: res.scriptsObfuscated,
          cssHidden: res.cssHidden,
          htmlHidden: res.htmlHidden,
          domainLockActive: res.domainLockActive,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setOutputCode('');
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Smart "Test & Run Output":
   * If Domain Lock is active, generates an isolated preview build WITHOUT domain lock
   * so it runs smoothly inside the iframe sandbox without triggering about:blank,
   * while keeping the actual Copy / Download output 100% domain-locked.
   */
  const handleOpenLivePreview = async () => {
    if (!outputCode) return;

    const hasDomainLock = settings.domainLock.trim().length > 0;
    if (!hasDomainLock) {
      setPreviewDoc(outputCode);
      setPreviewNotice(null);
      setShowLivePreview(true);
      return;
    }

    setIsGeneratingPreview(true);
    try {
      const previewResult =
        format === 'html'
          ? await processHtmlDocument(sourceCode, settings, { forPreview: true })
          : await processBloggerXml(sourceCode, settings, { forPreview: true });

      setPreviewDoc(previewResult.output);
      setPreviewNotice(
        `নিরাপদ প্রিভিউ মোড: আপনার আসল Copy/Download করা আউটপুটে Domain Lock (${settings.domainLock.trim()}) সম্পূর্ণ সক্রিয় আছে। শুধুমাত্র এই স্যান্ডবক্সে টেস্ট করার জন্য ডোমেইন লক সাময়িকভাবে বাইপাস করা হয়েছে।`
      );
      setShowLivePreview(true);
    } catch {
      setPreviewDoc(outputCode);
      setPreviewNotice('Domain Lock active — external domain mismatch may blank the frame.');
      setShowLivePreview(true);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleRestoreFromBackup = (entry: BackupEntry) => {
    setFormat(entry.format);
    setSourceCode(entry.code);
    setErrorMsg(null);
    setXmlValidationError(null);
    setShowBackups(false);
  };

  const handleDownloadBackupEntry = (entry: BackupEntry) => {
    const { extension, mimeType } = getFormatFileInfo(entry.format);
    downloadFile(entry.code, `codeguard_backup_${entry.timestamp}${extension}`, mimeType);
  };

  const getPlaceholderText = () => {
    if (format === 'html') {
      return 'Please paste only HTML, Website & App code here...';
    }
    return 'Please paste only Blogger XML theme or widget code here...';
  };

  const getGuidanceBadge = () => {
    if (format === 'html') {
      return 'Mode 1: HTML (Website & App Code) — <meta>, <title>, <link>, CDN ও <script type="module"> অক্ষত রেখে CSS/HTML/JS আসল Obfuscation করা হবে।';
    }
    return 'Mode 2: Blogger XML (Theme & Widget Code) — <b:skin>, <b:section>, <b:widget>, <b:includable>, <data:.../> ও AdSense অক্ষত রেখে //<![CDATA[ সহ এনকোড এবং DOMParser XML ভ্যালিডেশন করা হবে।';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-7">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>Secure Code Workspace</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            100% Client-Side Web Worker Obfuscation Engine powered by real <code className="text-cyan-700 dark:text-cyan-300 font-mono">javascript-obfuscator</code>. Zero server upload.
          </p>
        </div>

        {/* Format Selector + Backup Drawer Trigger */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowBackups((prev) => !prev)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Backups ({backups.length}/5)</span>
          </button>

          <label htmlFor="cg-format-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            Select Format:
          </label>
          <select
            id="cg-format-select"
            value={format}
            onChange={(e) => {
              setFormat(e.target.value as CodeFormat);
              setErrorMsg(null);
              setXmlValidationError(null);
            }}
            className="bg-white dark:bg-slate-900 border border-cyan-600/40 dark:border-cyan-500/40 text-slate-900 dark:text-cyan-200 text-xs sm:text-sm rounded-lg px-3.5 py-2 font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
          >
            <option value="html">HTML (Website &amp; App Code)</option>
            <option value="blogger">Blogger XML (Theme &amp; Widget Code)</option>
          </select>
        </div>
      </div>

      {/* Stored Original Backups Panel (Last 5 auto-saved in localStorage) */}
      {showBackups && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
              <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>অটো-সেভড অরিজিনাল ব্যাকআপ (সর্বশেষ ৫টি — শুধু আপনার ব্রাউজারে সংরক্ষিত)</span>
            </div>
            <div className="flex items-center gap-2">
              {backups.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearStoredBackups();
                    setBackups([]);
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowBackups(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                aria-label="Close backups panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {backups.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
              এখনো কোনো ব্যাকআপ সংরক্ষিত হয়নি। Secure Code বাটনে ক্লিক করলেই আপনার মূল কোড স্বয়ংক্রিয়ভাবে এখানে সেভ হবে।
            </p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {backups.map((entry) => (
                <div key={entry.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                      <span className="font-mono uppercase text-[11px] text-cyan-700 dark:text-cyan-400">
                        {entry.format}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono tabular-nums">{(entry.size / 1024).toFixed(1)} KB</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {entry.preview}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestoreFromBackup(entry)}
                      className="px-2.5 py-1 rounded border border-cyan-600/40 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 font-medium cursor-pointer"
                    >
                      Load into Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadBackupEntry(entry)}
                      className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Target Format Guidance */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-900 dark:text-cyan-300 text-xs font-medium">
        <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <span>{getGuidanceBadge()}</span>
      </div>

      {/* Error Feedback Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-rose-950 dark:text-rose-100">Processing Interrupted</h5>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 1. Source Code Input Editor (Full Width) */}
      <div className="w-full flex flex-col space-y-3">
        <CodeEditor
          title={format === 'html' ? 'Source HTML / Website & App Code' : 'Source Blogger XML Theme'}
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

      {/* 2. Security Control Panel */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/85 p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Security Control Panel
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Control Flow Flattening (0.75), String Splitting &amp; Hex Identifiers Active
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: String Array Encoding + Domain Lock */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                String Array Encoding
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'rc4', label: 'RC4 (Strongest)' },
                    { id: 'base64', label: 'Base64' },
                    { id: 'none', label: 'None' },
                  ] as Array<{ id: StringArrayEncodingType; label: string }>
                ).map((opt) => {
                  const active = settings.stringArrayEncoding === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, stringArrayEncoding: opt.id }))
                      }
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-900 dark:text-cyan-200'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cg-domain-lock"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Domain Lock (Allowed Domains — কমা বা স্পেস দিয়ে লিখুন)</span>
              </label>
              <input
                id="cg-domain-lock"
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={settings.domainLock}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, domainLock: e.target.value }))
                }
                placeholder="e.g. mrs-engineersbd.blogspot.com, www.blogger.com, mdrajidul99.github.io"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
              {(() => {
                const parsedDomains = parseDomainList(
                  settings.domainLock,
                  format,
                  settings.allowBloggerPreview
                );
                if (parsedDomains.length > 0) {
                  return (
                    <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-mono leading-relaxed break-all">
                      Active Lock ({parsedDomains.length}): {parsedDomains.join(', ')}
                    </div>
                  );
                }
                return null;
              })()}
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                কমা (<code className="font-mono">,</code>) বা স্পেস দিয়ে একাধিক ডোমেইন লিখুন (Enter চাপার প্রয়োজন নেই)। অন্য ডোমেইন বা localhost-এ কোড চালালে পেজ খালি (<code className="font-mono">about:blank</code>) হয়ে যাবে।
              </p>
            </div>
          </div>

          {/* Right: Protection Toggles */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 cursor-pointer hover:border-cyan-500/40 transition-colors">
              <input
                type="checkbox"
                checked={settings.hideCssAndHtmlInJs}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, hideCssAndHtmlInJs: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded accent-cyan-600 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Hide CSS &amp; Static HTML inside JS
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  view-source করলে প্লেইন CSS/HTML ডিজাইন দেখা যাবে না।
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 cursor-pointer hover:border-cyan-500/40 transition-colors">
              <input
                type="checkbox"
                checked={settings.antiInspectAndCopy}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, antiInspectAndCopy: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded accent-cyan-600 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Anti-Inspect &amp; Anti-Copy
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Right-Click, F12, Ctrl+U/S/P ও কপি ব্লক (ইনপুট ফর্ম সচল থাকবে)।
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 cursor-pointer hover:border-cyan-500/40 transition-colors">
              <input
                type="checkbox"
                checked={settings.selfDefending}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, selfDefending: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded accent-cyan-600 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Self-Defending
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  কোড ফরম্যাট বা রিভার্স করার চেষ্টা করলে রান বন্ধ হয়ে যাবে।
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 cursor-pointer hover:border-cyan-500/40 transition-colors">
              <input
                type="checkbox"
                checked={settings.disableConsoleOutput}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, disableConsoleOutput: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded accent-cyan-600 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Disable Console Output
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  কনসোলে log/warn/error/debug আউটপুট নিষ্ক্রিয় করে দেয়।
                </p>
              </div>
            </label>

            {format === 'blogger' && (
              <label className="sm:col-span-2 flex items-start gap-3 p-3 rounded-lg border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/70 dark:bg-cyan-950/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowBloggerPreview}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, allowBloggerPreview: e.target.checked }))
                  }
                  className="mt-0.5 w-4 h-4 rounded accent-cyan-600 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-900 dark:text-cyan-100">
                    Allow Blogger Preview (<code className="font-mono">www.blogger.com</code>)
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-cyan-300/80">
                    Domain Lock চালু থাকলে ব্লগার ড্যাশবোর্ডের থিম/লেআউট প্রিভিউ যেন কাজ করে, সেজন্য স্বয়ংক্রিয়ভাবে www.blogger.com যুক্ত রাখবে।
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Action Row + Live Worker Progress Bar */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={executeSecureCode}
              disabled={isProcessing || !sourceCode.trim()}
              className="px-7 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{progress?.stage || 'Securing inside Web Worker...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Code (Encode)</span>
                </>
              )}
            </button>

            {sourceCode.trim() && (
              <button
                type="button"
                onClick={() => {
                  const { extension, mimeType } = getFormatFileInfo(format);
                  downloadFile(sourceCode, `codeguard_original_backup_${Date.now()}${extension}`, mimeType);
                }}
                className="px-4 py-3 rounded-lg border border-amber-400/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Original Backup</span>
              </button>
            )}
          </div>

          {isProcessing && progress && (
            <div className="w-full sm:w-64 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-cyan-700 dark:text-cyan-300">
                <span>{progress.stage}</span>
                <span className="font-mono tabular-nums">{progress.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Output Section */}
      {outputCode && (
        <div className="space-y-6">
          {/* XML Validation Result Banner for Blogger */}
          {format === 'blogger' && (
            xmlValidationError ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">XML Validation Error (ব্লগারে পাবলিশ করার আগে ঠিক করুন)</div>
                  <p className="font-mono text-xs break-words">{xmlValidationError}</p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>DOMParser XML Validation Passed — কোনো অসামঞ্জস্যপূর্ণ ট্যাগ বা CDATA ত্রুটি নেই; ব্লগার থিমে নিরাপদে সেভ করা যাবে।</span>
              </div>
            )
          )}

          {/* Protection Summary Strip */}
          <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-cyan-900 dark:text-cyan-300 font-semibold">
              <ShieldAlert className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Active Protections:</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Encoding: {settings.stringArrayEncoding.toUpperCase()}
              </span>
              {stats?.cssHidden && (
                <span className="flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  CSS Hidden in JS
                </span>
              )}
              {stats?.htmlHidden && (
                <span className="flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Static HTML Hidden
                </span>
              )}
              {stats?.domainLockActive && (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <Lock className="w-3.5 h-3.5" />
                  Domain Locked
                </span>
              )}
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Original Size</div>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {(stats.originalSize / 1024).toFixed(2)} KB
                </div>
                <div className="text-[11px] text-slate-500">{stats.originalSize} chars</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Secured Size</div>
                <div className="text-lg font-mono font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
                  {(stats.processedSize / 1024).toFixed(2)} KB
                </div>
                <div className="text-[11px] text-slate-500">{stats.processedSize} chars</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Obfuscated Blocks</div>
                <div className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {stats.scriptsObfuscated} {stats.scriptsObfuscated === 1 ? 'script' : 'scripts'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {format === 'blogger' ? 'XML Theme Safe' : 'Non-Destructive DOM'}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Worker Time</div>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {stats.durationMs} ms
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                  <span>{stats.timestamp}</span>
                </div>
              </div>
            </div>
          )}

          <div className="w-full flex flex-col space-y-3">
            <CodeEditor
              title="Secured Output"
              value={outputCode}
              readOnly={true}
              placeholder="Processed output will appear here..."
              format={format}
              showBackupDownload={true}
              originalSourceForBackup={sourceCode}
            />

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready to Deploy</span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenLivePreview}
                  disabled={isGeneratingPreview}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isGeneratingPreview ? 'Preparing Sandbox...' : 'Test & Run Output'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Live Execution Test (Sandbox)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close live preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewNotice && (
              <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-900/70 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{previewNotice}</span>
              </div>
            )}

            <div className="flex-1 bg-slate-100 dark:bg-slate-950 min-h-[420px] p-2">
              <iframe
                title="Sandbox Preview"
                srcDoc={previewDoc}
                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                className="w-full h-full min-h-[420px] rounded-lg border border-slate-300 dark:border-slate-800 bg-white"
              />
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Code runs locally inside an isolated sandbox iframe.</span>
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
