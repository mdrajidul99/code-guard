import React, { useRef } from 'react';
import { X, Globe } from 'lucide-react';
import { sanitizeDomainToken } from '../utils/jsHelpers.ts';

interface DomainTagInputProps {
  id?: string;
  tags: string[];
  draft: string;
  onChangeTags: (tags: string[]) => void;
  onChangeDraft: (draft: string) => void;
  autoIncludeBloggerPreview?: boolean;
  placeholder?: string;
}

export const DomainTagInput: React.FC<DomainTagInputProps> = ({
  id = 'cg-domain-lock',
  tags,
  draft,
  onChangeTags,
  onChangeDraft,
  autoIncludeBloggerPreview = false,
  placeholder = 'e.g. mrs-engineersbd.blogspot.com (Enter বা কমা চাপুন)',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const commitTokens = (rawText: string) => {
    const parts = rawText
      .split(/[\s,;]+/)
      .map(sanitizeDomainToken)
      .filter((t) => t.length > 0);

    if (parts.length === 0) {
      onChangeDraft('');
      return;
    }

    const next = [...tags];
    for (const part of parts) {
      if (!next.includes(part)) {
        next.push(part);
      }
    }
    onChangeTags(next);
    onChangeDraft('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If user typed comma or semicolon (or pasted multiple space/comma/newline separated domains), commit completed tokens immediately
    if (/[,;\s]/.test(val)) {
      const endsWithDelimiter = /[,;\s]$/.test(val);
      const rawPieces = val.split(/[\s,;]+/);
      const completed = endsWithDelimiter ? rawPieces : rawPieces.slice(0, -1);
      const remaining = endsWithDelimiter ? '' : rawPieces[rawPieces.length - 1] || '';

      const next = [...tags];
      for (const piece of completed) {
        const clean = sanitizeDomainToken(piece);
        if (clean && !next.includes(clean)) {
          next.push(clean);
        }
      }
      if (next.length !== tags.length) {
        onChangeTags(next);
      }
      onChangeDraft(remaining);
    } else {
      onChangeDraft(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      if (draft.trim()) {
        e.preventDefault();
        commitTokens(draft);
      } else if (e.key === 'Enter') {
        e.preventDefault();
      }
    } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
      e.preventDefault();
      onChangeTags(tags.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (draft.trim()) {
      commitTokens(draft);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && /[\s,;]|https?:\/\//i.test(pasted)) {
      e.preventDefault();
      commitTokens(`${draft} ${pasted}`);
    }
  };

  const removeTag = (domainToRemove: string) => {
    onChangeTags(tags.filter((d) => d !== domainToRemove));
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
        <span>Domain Lock (Allowed Domains)</span>
      </label>

      <div
        onClick={() => inputRef.current?.focus()}
        className="min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500 cursor-text transition-colors"
      >
        {tags.map((domain) => (
          <span
            key={domain}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 font-mono text-xs font-medium"
          >
            <span>{domain}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(domain);
              }}
              className="text-cyan-700 dark:text-cyan-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              aria-label={`Remove ${domain}`}
              title={`Remove ${domain}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={draft}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={tags.length === 0 ? placeholder : 'আরেকটি ডোমেইন লিখুন...'}
          className="flex-1 min-w-[180px] bg-transparent py-1 px-1 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        ডোমেইন লিখে <code className="font-mono">Enter</code>, কমা (<code className="font-mono">,</code>), বা বাইরে ক্লিক করলে চিপ/ট্যাগ হিসেবে যুক্ত হবে (<code className="font-mono">https://</code> ও <code className="font-mono">/</code> অটো-ক্লিন হয়)।
        {autoIncludeBloggerPreview && tags.length > 0 && !tags.includes('www.blogger.com') && (
          <span className="block text-cyan-700 dark:text-cyan-300 mt-0.5">
            + Blogger Preview সক্রিয় থাকায় ব্যাকগ্রাউন্ডে <code className="font-mono">www.blogger.com</code> অটোমেটিক অনুমোদিত থাকবে।
          </span>
        )}
      </p>
    </div>
  );
};
