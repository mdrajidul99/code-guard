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
  format?: CodeFormat;
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
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (onChange) onChange(text);
      }
    } catch {
      // Browser permissions fallback
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleDownloadTxt = () => {
    if (!value) return;
    const ok = downloadFile(value, `codegaurd_${format}_output.txt`, 'text/plain;charset=utf-8');
    if (ok) {
      setDownloadNotice('Downloaded TXT');
      setTimeout(() => setDownloadNotice(null), 2000);
    }
  };

  const handleDownloadNative = () => {
    if (!value) return;
    const { extension, mimeType } = getFormatFileInfo(format, false);
    const ok = downloadFile(value, `codegaurd_secured${extension}`, mimeType);
    if (ok) {
      setDownloadNotice(`Downloaded ${extension.toUpperCase()}`);
      setTimeout(() => setDownloadNotice(null), 2000);
    }
  };

  const handleDownloadBackup = () => {
    const backupContent = originalSourceForBackup || value;
    if (!backupContent) return;
    const { extension, mimeType } = getFormatFileInfo(format, true);
    const ok = downloadFile(backupContent, `original_backup_${Date.now()}${extension}`, mimeType);
    if (ok) {
      setDownloadNotice('Original Backup Saved');
      setTimeout(() => setDownloadNotice(null), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Tab key to indent with 2 spaces instead of losing focus
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
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm overflow-hidden focus-within:border-cyan-500/50 transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/70 text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-200">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{title}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono tabular-nums">{lines} {lines === 1 ? 'line' : 'lines'}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono tabular-nums">{(chars / 1024).toFixed(1)} KB</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {!readOnly && onLoadSample && (
            <button
              onClick={onLoadSample}
              className="px-2 py-1 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              title="Load realistic sample code for this format"
            >
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>Sample</span>
            </button>
          )}

          {!readOnly && (
            <button
              onClick={handlePaste}
              className="px-2 py-1 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3 h-3" />
              <span>Paste</span>
            </button>
          )}

          {!readOnly && onClear && (
            <button
              onClick={onClear}
              disabled={!value}
              className="px-2 py-1 rounded border border-slate-800 hover:border-rose-900 bg-slate-800/40 hover:bg-rose-950/30 text-slate-400 hover:text-rose-300 transition-colors disabled:opacity-40 flex items-center gap-1"
              title="Clear editor contents"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!value}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 font-medium ${
              copied
                ? 'border-emerald-600 bg-emerald-950/50 text-emerald-300'
                : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white disabled:opacity-40'
            }`}
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download Buttons */}
          {value && (
            <>
              <button
                onClick={handleDownloadTxt}
                className="px-2 py-1 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                title="Download as plain text file (.txt)"
              >
                <Download className="w-3 h-3" />
                <span>TXT</span>
              </button>

              <button
                onClick={handleDownloadNative}
                className="px-2 py-1 rounded border border-cyan-800 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-200 hover:text-white transition-colors flex items-center gap-1 font-medium"
                title={`Download formatted file (${getFormatFileInfo(format).extension})`}
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>{getFormatFileInfo(format).extension.toUpperCase().replace('.', '')}</span>
              </button>
            </>
          )}

          {/* Backup Download Button */}
          {showBackupDownload && (originalSourceForBackup || value) && (
            <button
              onClick={handleDownloadBackup}
              className="px-2 py-1 rounded border border-amber-800/60 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 hover:text-amber-100 transition-colors flex items-center gap-1 font-medium"
              title="Download backup copy of original code before modifications"
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Backup</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 min-h-[340px] sm:min-h-[420px] flex bg-slate-950/90 font-mono text-xs sm:text-sm">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full h-full p-4 bg-transparent text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-xs sm:text-sm leading-relaxed selection:bg-cyan-500/30 selection:text-cyan-200"
          style={{ tabSize: 2 }}
        />

        {downloadNotice && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-sans text-xs shadow-lg animate-in fade-in duration-200 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{downloadNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
};
