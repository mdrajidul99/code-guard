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
import { sanitizeDomainToken } from '../utils/jsHelpers.ts';
import { clearStoredBackups, getStoredBackups, saveOriginalBackup } from '../utils/backupStorage.ts';
import { saveToVault } from '../utils/vaultStorage.ts';
import { downloadFile, getFormatFileInfo } from '../utils/download.ts';
import { CodeEditor } from '../components/CodeEditor.tsx';
import { DomainTagInput } from '../components/DomainTagInput.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
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
  History,
  Download,
  Trash2,
  Cpu,
  Globe,
  Search,
  Shield,
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
  seoSafeMode: false,
  antiMirrorAndWebView: false,
  antiIframe: false,
};

const STAGE_EN_MAP: Record<string, string> = {
  'সুরক্ষা ইঞ্জিন চালু হচ্ছে...': 'Starting protection engine...',
  'ডোমেইন লক সুরক্ষা তৈরি হচ্ছে...': 'Applying Domain Lock shield...',
  'Anti-Iframe সুরক্ষা যুক্ত হচ্ছে...': 'Applying Anti-Iframe protection...',
  'Anti-Mirror ও WebView গার্ড যুক্ত হচ্ছে...': 'Applying Anti-Mirror & WebView guard...',
  'CSS এনকোড হচ্ছে...': 'Protecting CSS styles...',
  'CSS ও ডোমেইন লক প্রস্তুত হচ্ছে...': 'Preparing CSS & Domain Lock...',
  'হেড স্ক্রিপ্ট এনকোড হচ্ছে...': 'Protecting head scripts...',
  'HTML এনকোড হচ্ছে...': 'Protecting layout HTML...',
  'HTML এনকোড হচ্ছে (১টি সম্মিলিত স্ক্রিপ্ট)...': 'Protecting layout blocks...',
  'Scripts এনকোড হচ্ছে...': 'Securing scripts...',
  'Anti-Inspect ও Anti-Copy সুরক্ষা তৈরি হচ্ছে...': 'Applying Anti-Inspect & Anti-Copy...',
  'XML ভ্যালিডেশন চেক হচ্ছে...': 'Validating XML structure...',
  'সম্পন্ন হচ্ছে...': 'Finalizing output...',
};

export const SecureView: React.FC<SecureViewProps> = () => {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [sourceCode, setSourceCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [format, setFormat] = useState<CodeFormat>('html');
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);
  const [domainTags, setDomainTags] = useState<string[]>([]);
  const [domainDraft, setDomainDraft] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [xmlValidationError, setXmlValidationError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [appliedShields, setAppliedShields] = useState<{
    seoSafeMode: boolean;
    antiMirrorAndWebView: boolean;
    antiIframe: boolean;
  } | null>(null);

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

  const formatProgressStage = (rawStage?: string) => {
    if (!rawStage) return isBn ? 'আপনার কোড সুরক্ষিত করা হচ্ছে...' : 'Securing your code...';
    if (isBn) return rawStage;
    return STAGE_EN_MAP[rawStage] || rawStage;
  };

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
    setAppliedShields(null);
    setErrorMsg(null);
    setXmlValidationError(null);
    setProgress(null);
    setShowLivePreview(false);
  };

  const handleReset = () => {
    setOutputCode('');
    setStats(null);
    setAppliedShields(null);
    setErrorMsg(null);
    setXmlValidationError(null);
    setProgress(null);
    setShowLivePreview(false);
  };

  const handleTagsChange = (nextTags: string[]) => {
    setDomainTags(nextTags);
    setSettings((prev) => ({ ...prev, domainLock: nextTags.join(', ') }));
  };

  const commitDraftAndGetSettings = (): SecuritySettings => {
    const draftTokens = domainDraft
      .split(/[\s,;]+/)
      .map(sanitizeDomainToken)
      .filter((t) => t.length > 0);

    const merged = [...domainTags];
    for (const token of draftTokens) {
      if (!merged.includes(token)) {
        merged.push(token);
      }
    }

    if (merged.length !== domainTags.length || domainDraft.trim()) {
      setDomainTags(merged);
      setDomainDraft('');
    }

    const domainString = merged.join(', ');
    const nextSettings: SecuritySettings = {
      ...settings,
      domainLock: domainString,
    };
    setSettings(nextSettings);
    return nextSettings;
  };

  const executeSecureCode = async () => {
    if (!sourceCode.trim()) {
      setErrorMsg(
        isBn
          ? `অনুগ্রহ করে প্রথমে আপনার ${format === 'html' ? 'HTML / Website & App' : 'Blogger XML'} কোড ইনপুট বক্সে পেস্ট করুন।`
          : `Please paste your ${format === 'html' ? 'HTML / Website & App' : 'Blogger XML'} code into the input box first.`
      );
      return;
    }

    const effectiveSettings = commitDraftAndGetSettings();

    setErrorMsg(null);
    setXmlValidationError(null);
    setIsProcessing(true);
    setProgress({ stage: 'সুরক্ষা ইঞ্জিন চালু হচ্ছে...', percent: 5 });

    const updatedBackups = saveOriginalBackup(sourceCode, format);
    setBackups(updatedBackups);

    const startTime = performance.now();

    try {
      if (format === 'html') {
        const res = await processHtmlDocument(sourceCode, effectiveSettings, {
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

        await saveToVault({
          originalCode: sourceCode,
          outputCode: res.output,
          format: 'html',
        });

        setOutputCode(res.output);
        setAppliedShields({
          seoSafeMode: effectiveSettings.seoSafeMode,
          antiMirrorAndWebView: effectiveSettings.antiMirrorAndWebView,
          antiIframe: effectiveSettings.antiIframe,
        });
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
        const res = await processBloggerXml(sourceCode, effectiveSettings, {
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

        await saveToVault({
          originalCode: sourceCode,
          outputCode: res.output,
          format: 'blogger',
        });

        setOutputCode(res.output);
        setXmlValidationError(res.xmlValidationError);
        setAppliedShields({
          seoSafeMode: effectiveSettings.seoSafeMode,
          antiMirrorAndWebView: effectiveSettings.antiMirrorAndWebView,
          antiIframe: effectiveSettings.antiIframe,
        });
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
      setAppliedShields(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenLivePreview = async () => {
    if (!outputCode) return;

    const effectiveSettings = commitDraftAndGetSettings();
    const hasDomainLock = Boolean(stats?.domainLockActive || effectiveSettings.domainLock.trim().length > 0);
    const hasMirrorGuard = effectiveSettings.antiMirrorAndWebView;
    const hasIframeGuard = effectiveSettings.antiIframe;
    const needsPreviewBypass = hasDomainLock || hasMirrorGuard || hasIframeGuard;

    if (!needsPreviewBypass) {
      setPreviewDoc(outputCode);
      setPreviewNotice(null);
      setShowLivePreview(true);
      return;
    }

    const bypassedLabels: string[] = [];
    if (hasDomainLock) bypassedLabels.push(`Domain Lock (${effectiveSettings.domainLock.trim()})`);
    if (hasMirrorGuard) bypassedLabels.push('Anti-Mirror & WebView Guard');
    if (hasIframeGuard) bypassedLabels.push('Anti-Iframe Protection');
    const summaryLabel = bypassedLabels.join(', ');

    setIsGeneratingPreview(true);
    try {
      const previewResult =
        format === 'html'
          ? await processHtmlDocument(sourceCode, effectiveSettings, { forPreview: true })
          : await processBloggerXml(sourceCode, effectiveSettings, { forPreview: true });

      setPreviewDoc(previewResult.output);
      setPreviewNotice(
        isBn
          ? `নিরাপদ প্রিভিউ মোড: আপনার আসল Copy/Download করা আউটপুটে ${summaryLabel} সম্পূর্ণ সক্রিয় আছে। শুধুমাত্র এই স্যান্ডবক্স iframe-এ টেস্ট করার জন্য সেগুলো সাময়িকভাবে বাইপাস করা হয়েছে।`
          : `Safe Preview Mode: ${summaryLabel} remain 100% active in your Copy/Download output. They are only temporarily bypassed here so you can test inside this sandbox iframe.`
      );
      setShowLivePreview(true);
    } catch {
      setPreviewDoc(outputCode);
      setPreviewNotice(
        isBn
          ? `${summaryLabel} সক্রিয় রয়েছে — স্যান্ডবক্স iframe পরিবেশের কারণে ফ্রেমটি ব্লক বা খালি দেখাতে পারে।`
          : `${summaryLabel} active — sandbox iframe restrictions may blank or block the preview frame.`
      );
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
      return isBn
        ? 'অনুগ্রহ করে এখানে শুধুমাত্র HTML, ওয়েবসাইট ও অ্যাপ কোড পেস্ট করুন...'
        : 'Please paste only HTML, Website & App code here...';
    }
    return isBn
      ? 'অনুগ্রহ করে এখানে শুধুমাত্র Blogger XML থিম বা উইজেট কোড পেস্ট করুন...'
      : 'Please paste only Blogger XML theme or widget code here...';
  };

  const getGuidanceBadge = () => {
    if (format === 'html') {
      return isBn
        ? 'HTML মোড: আপনার HTML বা ওয়েব অ্যাপ কোড সুরক্ষিত করার জন্য প্রস্তুত।'
        : 'HTML Mode: Ready to secure your HTML or Web App code.';
    }
    return isBn
      ? 'Blogger XML মোড: আপনার ব্লগার থিম নিরাপদে সুরক্ষিত করার জন্য প্রস্তুত।'
      : 'Blogger XML Mode: Ready to secure your Blogger theme safely.';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-7">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>{isBn ? 'কোড সিকিউর ওয়ার্কস্পেস' : 'Secure Code Workspace'}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            {isBn
              ? 'আপনার কোড পেস্ট করুন, সুরক্ষা অপশন বাছাই করুন এবং সরাসরি ব্রাউজারে তাৎক্ষণিক সুরক্ষিত করুন।'
              : 'Paste your code, configure protection options, and secure it instantly in your browser.'}
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
            <span>{isBn ? `ব্যাকআপ (${backups.length}/5)` : `Backups (${backups.length}/5)`}</span>
          </button>

          <label htmlFor="cg-format-select" className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            {isBn ? 'ফরম্যাট নির্বাচন:' : 'Select Format:'}
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
            <option value="html">
              {isBn ? 'HTML (ওয়েবসাইট ও অ্যাপ কোড)' : 'HTML (Website & App Code)'}
            </option>
            <option value="blogger">
              {isBn ? 'Blogger XML (থিম ও উইজেট কোড)' : 'Blogger XML (Theme & Widget Code)'}
            </option>
          </select>
        </div>
      </div>

      {/* Stored Original Backups Panel */}
      {showBackups && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
              <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>
                {isBn
                  ? 'অটো-সেভড অরিজিনাল ব্যাকআপ (সর্বশেষ ৫টি — শুধু আপনার ব্রাউজারে সংরক্ষিত)'
                  : 'Auto-Saved Original Backups (Last 5 — saved privately in your browser)'}
              </span>
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
                  <span>{isBn ? 'সব মুছুন' : 'Clear All'}</span>
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
              {isBn
                ? 'এখনো কোনো ব্যাকআপ সংরক্ষিত হয়নি। Secure Code বাটনে ক্লিক করলেই আপনার মূল কোড স্বয়ংক্রিয়ভাবে এখানে সেভ হবে।'
                : 'No backups saved yet. Your original source code will be auto-saved here whenever you click Secure Code.'}
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
                      {isBn ? 'এডিটরে লোড করুন' : 'Load into Editor'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadBackupEntry(entry)}
                      className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>{isBn ? 'ডাউনলোড' : 'Download'}</span>
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
            <h5 className="font-semibold text-rose-950 dark:text-rose-100">
              {isBn ? 'প্রসেসিং বাধাগ্রস্ত হয়েছে' : 'Processing Interrupted'}
            </h5>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 1. Source Code Input Editor */}
      <div className="w-full flex flex-col space-y-3">
        <CodeEditor
          title={
            format === 'html'
              ? isBn
                ? 'মূল HTML / ওয়েবসাইট ও অ্যাপ কোড'
                : 'Source HTML / Website & App Code'
              : isBn
                ? 'মূল Blogger XML থিম কোড'
                : 'Source Blogger XML Theme'
          }
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
              {isBn ? 'নিরাপত্তা কন্ট্রোল প্যানেল' : 'Security Control Panel'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isBn
              ? 'উন্নত লজিক শিল্ড ও লেআউট সুরক্ষা সক্রিয়'
              : 'Advanced Logic Shield & Layout Protection Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Protection Strength + Domain Lock */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isBn ? 'সুরক্ষার মাত্রা (Protection Strength)' : 'Protection Strength'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'rc4', label: isBn ? 'সর্বোচ্চ' : 'Maximum' },
                    { id: 'base64', label: isBn ? 'সাধারণ' : 'Standard' },
                    { id: 'none', label: isBn ? 'হালকা' : 'Light' },
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

            <DomainTagInput
              id="cg-domain-lock"
              tags={domainTags}
              draft={domainDraft}
              onChangeTags={handleTagsChange}
              onChangeDraft={setDomainDraft}
              autoIncludeBloggerPreview={format === 'blogger' && settings.allowBloggerPreview}
            />
          </div>

          {/* Right: Protection Toggles */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 transition-colors ${
                settings.seoSafeMode
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer hover:border-cyan-500/40'
              }`}
            >
              <input
                type="checkbox"
                checked={!settings.seoSafeMode && settings.hideCssAndHtmlInJs}
                disabled={settings.seoSafeMode}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, hideCssAndHtmlInJs: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded accent-cyan-600 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {isBn ? 'CSS ও স্ট্যাটিক HTML আড়াল করুন' : 'Hide CSS & Static HTML inside JS'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {settings.seoSafeMode
                    ? isBn
                      ? 'SEO-Safe Mode চালু থাকায় HTML/CSS প্লেইন রাখা হচ্ছে।'
                      : 'Disabled while SEO-Safe Mode keeps HTML/CSS public.'
                    : isBn
                      ? 'view-source করলে প্লেইন CSS/HTML ডিজাইন দেখা যাবে না।'
                      : 'Hides plain CSS & static layout markup from casual view-source.'}
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
                  {isBn ? 'Anti-Inspect ও Anti-Copy' : 'Anti-Inspect & Anti-Copy'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'Right-Click, F12, Ctrl+U/S/P ও কপি ব্লক (ইনপুট ফর্ম সচল থাকবে)।'
                    : 'Blocks Right-Click, F12, Ctrl+U/S/P & copying (forms remain editable).'}
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
                  {isBn ? 'টেম্পার সুরক্ষা (Tamper Protection)' : 'Tamper Protection'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'কোড ফরম্যাট বা রিভার্স করার চেষ্টা করলে রান বন্ধ হয়ে যাবে।'
                    : 'Stops execution if someone tampers with or reformats the secured scripts.'}
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
                  {isBn ? 'কনসোল আউটপুট নিষ্ক্রিয় করুন' : 'Disable Console Output'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'কনসোলে log/warn/error/debug আউটপুট নিষ্ক্রিয় করে দেয়।'
                    : 'Silences browser console log, warn, error, and debug messages.'}
                </p>
              </div>
            </label>

            <label className="sm:col-span-2 flex items-start gap-3 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/25 cursor-pointer hover:border-emerald-500/50 transition-colors">
              <input
                type="checkbox"
                checked={settings.seoSafeMode}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, seoSafeMode: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded accent-emerald-600 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-emerald-100">
                  {isBn
                    ? 'SEO-Safe Mode (HTML/CSS পাবলিক রেখে শুধু JS সুরক্ষিত রাখুন)'
                    : 'SEO-Safe Mode (Keep HTML/CSS public & secure JS only)'}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-emerald-300/80">
                  {isBn
                    ? 'Googlebot ও AdSense-এর জন্য <meta>, JSON-LD, <b:skin>, হেডার ও ফুটার প্লেইন রাখবে; শুধুমাত্র কার্যকরী <script> ও module JS এনকোড করবে।'
                    : 'Keeps <meta>, JSON-LD, <b:skin>, header & footer plain for Googlebot/AdSense while obfuscating executable <script> & module JS only.'}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 cursor-pointer hover:border-cyan-500/40 transition-colors">
              <input
                type="checkbox"
                checked={settings.antiMirrorAndWebView}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, antiMirrorAndWebView: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded accent-cyan-600 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {isBn
                    ? 'Anti-Mirror & Anti-WebView Guard (PrismCopy / HTTrack / অফলাইন ক্লোন প্রতিরোধ)'
                    : 'Anti-Mirror & Anti-WebView Guard (Block PrismCopy / HTTrack / Offline Clones)'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? '_inline/_external মিরর, file:/content: প্রোটোকল ও অফলাইন/স্পুফড WebView ব্লক করবে (অনলাইন Social ব্রাউজার সচল থাকবে)।'
                    : 'Blocks _inline/_external mirrors, file:/content: protocols & spoofed offline WebViews (online social in-app browsers preserved).'}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 cursor-pointer hover:border-cyan-500/40 transition-colors">
              <input
                type="checkbox"
                checked={settings.antiIframe}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, antiIframe: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded accent-cyan-600 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {isBn ? 'Anti-Iframe Protection' : 'Anti-Iframe Protection'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn
                    ? 'অননুমোদিত সাইটে <iframe> এম্বেড বন্ধ করবে (Domain Lock ও Blogger প্রিভিউ অনুমোদিত থাকবে)।'
                    : 'Blocks unauthorized <iframe> embedding while allowing Domain Lock & Blogger preview.'}
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
                    {isBn ? (
                      <>
                        Blogger Preview অনুমোদন করুন (<code className="font-mono">www.blogger.com</code>)
                      </>
                    ) : (
                      <>
                        Allow Blogger Preview (<code className="font-mono">www.blogger.com</code>)
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-cyan-300/80">
                    {isBn
                      ? 'Domain Lock চালু থাকলে ব্লগার ড্যাশবোর্ডের থিম/লেআউট প্রিভিউ যেন কাজ করে, সেজন্য স্বয়ংক্রিয়ভাবে www.blogger.com যুক্ত রাখবে।'
                      : 'Automatically includes www.blogger.com when Domain Lock is active so Blogger Dashboard layout/theme previews keep working.'}
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Action Row + Live Progress Bar */}
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
                  <span>{formatProgressStage(progress?.stage)}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBn ? 'কোড সিকিউর করুন (Encode)' : 'Secure Code (Encode)'}</span>
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
                <span>{isBn ? 'মূল ব্যাকআপ ডাউনলোড করুন' : 'Download Original Backup'}</span>
              </button>
            )}
          </div>

          {isProcessing && progress && (
            <div className="w-full sm:w-64 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-cyan-700 dark:text-cyan-300">
                <span>{formatProgressStage(progress.stage)}</span>
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
                  <div className="font-bold">
                    {isBn
                      ? 'XML ভ্যালিডেশন এরর (ব্লগারে পাবলিশ করার আগে ঠিক করুন)'
                      : 'XML Validation Error (Fix before publishing on Blogger)'}
                  </div>
                  <p className="font-mono text-xs break-words">{xmlValidationError}</p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {isBn
                    ? 'XML Validation Passed — কোনো অসামঞ্জস্যপূর্ণ ট্যাগ বা স্ট্রাকচার ত্রুটি নেই; ব্লগার থিমে নিরাপদে সেভ করা যাবে।'
                    : 'XML Validation Passed — no mismatched tags or structural errors; safe to save in Blogger Theme Editor.'}
                </span>
              </div>
            )
          )}

          {/* Protection Summary Strip */}
          <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-cyan-900 dark:text-cyan-300 font-semibold">
              <ShieldAlert className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{isBn ? 'সক্রিয় সুরক্ষাসমূহ:' : 'Active Protections:'}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap font-mono text-[11px] text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {isBn ? 'মাত্রা:' : 'Strength:'}{' '}
                {settings.stringArrayEncoding === 'rc4'
                  ? isBn ? 'সর্বোচ্চ' : 'Maximum'
                  : settings.stringArrayEncoding === 'base64'
                    ? isBn ? 'সাধারণ' : 'Standard'
                    : isBn ? 'হালকা' : 'Light'}
              </span>
              {stats?.cssHidden && (
                <span className="flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  {isBn ? 'CSS সুরক্ষিত' : 'CSS Protected'}
                </span>
              )}
              {stats?.htmlHidden && (
                <span className="flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  {isBn ? 'লেআউট সুরক্ষিত' : 'Layout Protected'}
                </span>
              )}
              {stats?.domainLockActive && (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <Lock className="w-3.5 h-3.5" />
                  {isBn ? 'ডোমেইন লকড' : 'Domain Locked'}
                </span>
              )}
              {appliedShields?.seoSafeMode && (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <Search className="w-3.5 h-3.5" />
                  {isBn ? 'SEO-Safe Mode' : 'SEO-Safe Mode'}
                </span>
              )}
              {appliedShields?.antiMirrorAndWebView && (
                <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                  <Globe className="w-3.5 h-3.5" />
                  {isBn ? 'Anti-Mirror & WebView' : 'Anti-Mirror & WebView'}
                </span>
              )}
              {appliedShields?.antiIframe && (
                <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                  <Shield className="w-3.5 h-3.5" />
                  {isBn ? 'Anti-Iframe' : 'Anti-Iframe'}
                </span>
              )}
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn ? 'মূল সাইজ' : 'Original Size'}
                </div>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {(stats.originalSize / 1024).toFixed(2)} KB
                </div>
                <div className="text-[11px] text-slate-500">{stats.originalSize} chars</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn ? 'সুরক্ষিত সাইজ' : 'Secured Size'}
                </div>
                <div className="text-lg font-mono font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
                  {(stats.processedSize / 1024).toFixed(2)} KB
                </div>
                <div className="text-[11px] text-slate-500">{stats.processedSize} chars</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn ? 'সুরক্ষিত ব্লক' : 'Protected Blocks'}
                </div>
                <div className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {stats.scriptsObfuscated}{' '}
                  {isBn ? 'টি ব্লক' : stats.scriptsObfuscated === 1 ? 'block' : 'blocks'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {format === 'blogger'
                    ? isBn ? 'XML থিম নিরাপদ' : 'XML Theme Safe'
                    : isBn ? 'লেআউট নিরাপদ' : 'Layout Safe'}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn ? 'প্রসেসিং সময়' : 'Processing Time'}
                </div>
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
              title={isBn ? 'সুরক্ষিত আউটপুট' : 'Secured Output'}
              value={outputCode}
              readOnly={true}
              placeholder={isBn ? 'সুরক্ষিত আউটপুট এখানে দেখাবে...' : 'Processed output will appear here...'}
              format={format}
              showBackupDownload={true}
              originalSourceForBackup={sourceCode}
            />

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ব্যবহারের জন্য প্রস্তুত' : 'Ready to Deploy'}</span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenLivePreview}
                  disabled={isGeneratingPreview}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {isGeneratingPreview
                      ? isBn ? 'প্রিভিউ প্রস্তুত হচ্ছে...' : 'Preparing Sandbox...'
                      : isBn ? 'আউটপুট চালিয়ে পরীক্ষা করুন' : 'Test & Run Output'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isBn ? 'ফলাফল রিসেট করুন' : 'Reset Results'}</span>
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
                  {isBn ? 'লাইভ এক্সিকিউশন টেস্ট (স্যান্ডবক্স)' : 'Live Execution Test (Sandbox)'}
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
              <span>
                {isBn
                  ? 'কোডটি একটি আলাদা নিরাপদ স্যান্ডবক্স ফ্রেমে স্থানীয়ভাবে রান হচ্ছে।'
                  : 'Code runs locally inside an isolated sandbox iframe.'}
              </span>
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                {isBn ? 'প্রিভিউ বন্ধ করুন' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
