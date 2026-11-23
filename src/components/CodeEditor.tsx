import React, { useRef, useState } from 'react';
import { Copy, Check, Download, ClipboardPaste, Trash2, FileText, Code2, ShieldAlert } from 'lucide-react';
import { copyToClipboard, downloadFile, getFormatFileInfo } from '../utils/download.ts';
import { CodeFormat } from '../types/index.ts';

interface Props {
  title: string;
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  format?: CodeFormat | 'javascript' | 'css';
  onClear?: () => void;
  onLoadSample?: () => void;
  showBackupDownload?: boolean;
  originalSourceForBackup?: string;
}

export const CodeEditor: React.FC<Props> = ({
  title,
  value,
  onChange,
  readOnly = false,
  placeholder = 'Paste or type your code here...',
  format = 'html',
  onClear,
  onLoadSample,
  showBackupDownload = false,
  originalSourceForBackup = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = value ? value.split('\n').length : 1;
  const chars = value.length;

  const handleCopy = async () => {
    if (!value) return;
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && onChange) {
          onChange(text);
          setDownloadNotice('Pasted from clipboard');
          setTimeout(() => setDownloadNotice(null), 1800);
          return;
        }
      }
    } catch {
      // Fallback: focus textarea for manual Ctrl+V / long-press paste
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
      setDownloadNotice('Press Ctrl+V (or long-press Paste) inside editor');
      setTimeout(() => setDownloadNotice(null), 2500);
    }
  };

  const handleDownloadTxt = () => {
    if (!value) return;
    const ok = downloadFile(value, `codeguard_${format}_output.txt`, 'text/plain;charset=utf-8');
    if (ok) {
      setDownloadNotice('Downloaded TXT');
      setTimeout(() => setDownloadNotice(null), 2000);
    }
  };

  const handleDownloadNative = () => {
    if (!value) return;
    const { extension, mimeType } = getFormatFileInfo(format);
    const ok = downloadFile(value, `codeguard_secured${extension}`, mimeType);
    if (ok) {
      setDownloadNotice(`Downloaded ${extension.toUpperCase()}`);
      setTimeout(() => setDownloadNotice(null), 2000);
    }
  };

  const handleDownloadBackup = () => {
    const backupContent = originalSourceForBackup || value;
    if (!backupContent) return;
    const { extension, mimeType } = getFormatFileInfo(format);
    const ok = downloadFile(backupContent, `codeguard_original_backup_${Date.now()}${extension}`, mimeType);
    if (ok) {
      setDownloadNotice('Original Backup Saved');
      setTimeout(() => setDownloadNotice(null), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      if (onChange) onChange(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="w-full flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden focus-within:border-cyan-500/60 transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 font-medium text-slate-800 dark:text-slate-200 min-w-0 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="truncate">{title}</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0 text-slate-500 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">·</span>
            <span className="font-mono tabular-nums whitespace-nowrap">{lines} {lines === 1 ? 'line' : 'lines'}</span>
            <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">·</span>
            <span className="font-mono tabular-nums whitespace-nowrap">{(chars / 1024).toFixed(1)} KB</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {!readOnly && onLoadSample && (
            <button
              type="button"
              onClick={onLoadSample}
              className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              title="Load realistic sample code"
            >
              <FileText className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>Sample</span>
            </button>
          )}

          {!readOnly && (
            <button
              type="button"
              onClick={handlePaste}
              className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3 h-3" />
              <span>Paste</span>
            </button>
          )}

          {!readOnly && onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={!value}
              className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 bg-white dark:bg-slate-800/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors disabled:opacity-40 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              title="Clear editor contents"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            className={`px-2.5 py-1.5 rounded border transition-colors flex items-center gap-1 font-medium whitespace-nowrap shrink-0 cursor-pointer ${
              copied
                ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40'
            }`}
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {value && (
            <>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                title="Download as plain text (.txt)"
              >
                <Download className="w-3 h-3" />
                <span>TXT</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadNative}
                className="px-2.5 py-1.5 rounded border border-cyan-500/40 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 transition-colors flex items-center gap-1 font-medium whitespace-nowrap shrink-0 cursor-pointer"
                title={`Download as ${getFormatFileInfo(format).extension}`}
              >
                <Download className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span>{getFormatFileInfo(format).extension.toUpperCase().replace('.', '')}</span>
              </button>
            </>
          )}

          {showBackupDownload && (originalSourceForBackup || value) && (
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-2.5 py-1.5 rounded border border-amber-400/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 transition-colors flex items-center gap-1 font-medium whitespace-nowrap shrink-0 cursor-pointer"
              title="Download Original Backup"
            >
              <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Download Original Backup</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 flex flex-col w-full min-h-[360px] sm:min-h-[420px] bg-slate-50 dark:bg-slate-950/95 font-mono text-xs sm:text-sm overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full flex-1 block min-h-[360px] sm:min-h-[420px] p-4 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-y focus:outline-none font-mono text-xs sm:text-sm leading-relaxed selection:bg-cyan-500/30 selection:text-cyan-900 dark:selection:text-cyan-200 whitespace-pre-wrap break-words"
          style={{ tabSize: 2 }}
        />

        {downloadNotice && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-sans text-xs shadow-lg flex items-center gap-1.5 pointer-events-none">
            <Check className="w-3.5 h-3.5" />
            <span>{downloadNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
};
