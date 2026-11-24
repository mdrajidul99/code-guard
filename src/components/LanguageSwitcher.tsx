import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface LanguageSwitcherProps {
  compact?: boolean;
  fullWidth?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  compact = false,
  fullWidth = false,
}) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={`inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-0.5 ${
        fullWidth ? 'w-full justify-between' : 'shrink-0'
      }`}
    >
      {!compact && (
        <span className="flex items-center gap-1.5 px-2 text-[11px] font-medium text-slate-600 dark:text-slate-400 select-none">
          <Languages className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>{lang === 'bn' ? 'ভাষা' : 'Language'}</span>
        </span>
      )}
      <div className={`flex items-center gap-0.5 ${fullWidth ? 'flex-1 justify-end' : ''}`}>
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            lang === 'en'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLang('bn')}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            lang === 'bn'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          বাংলা
        </button>
      </div>
    </div>
  );
};
