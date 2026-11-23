import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  ChevronDown,
  Check,
  FileCode,
  ShieldCheck,
  Lock,
  Cpu,
} from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface Props {
  onNavigate: (page: ActivePage) => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does CodeGuard upload my source code to a remote server?',
      a: 'No. Every minification, CSS/HTML encapsulation, Web Worker JavaScript obfuscation, XML validation, and formatting step executes 100% locally inside your browser. Your source code never leaves your device.',
    },
    {
      q: 'What makes CodeGuard stronger than simple Base64 / document.write wrappers?',
      a: 'CodeGuard uses the real javascript-obfuscator engine inside a background Web Worker with RC4 string array encryption, Control Flow Flattening (0.75), split strings, number-to-expression transforms, Self-Defending, Domain Lock, and Anti-Inspect protection—never fake Base64 or document.write().',
    },
    {
      q: 'Will obfuscating break Firebase, window.* functions, onclick="..." handlers, or ES modules?',
      a: 'No. Safety flags (renameGlobals, renameProperties, transformObjectKeys, deadCodeInjection, debugProtection) stay strictly disabled, while ignoreImports and smart <script type="module"> import extraction keep external libraries, Firebase calls, and inline HTML handlers working cleanly.',
    },
    {
      q: 'How does Blogger XML protection avoid Theme Editor XML save errors?',
      a: 'CodeGuard preserves XML declarations, namespaces, <b:skin> variables/directives, <b:section>, <b:widget>, <b:includable>, <b:if>, <b:loop>, <data:.../>, and AdSense/Analytics tags verbatim, wraps every obfuscated script inside Blogger-compliant //<![CDATA[ ... //]]> blocks, and validates the output with DOMParser before display.',
    },
    {
      q: 'Can CodeGuard decode RC4-obfuscated code back to original source?',
      a: 'No—real RC4 + Control Flow Flattening + Self-Defending obfuscation is intentionally one-way. Keep your original source safe using the built-in "Download Original Backup" button or the automatic 5-slot local backup history. Restore Code can decode reversible Base64/Hex/Unicode wrappers and format any HTML, CSS, XML, or JS via js-beautify.',
    },
  ];

  const formatCards = [
    {
      name: 'HTML (Website & App Code)',
      ext: '.html',
      icon: <FileCode className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      desc: 'Preserves <meta>, <title>, <link>, CDN links, and <script type="module"> imports while hiding CSS & static HTML inside obfuscated JS runners.',
      features: [
        'RC4 + Control Flow Flattening in Web Worker',
        'Domain Lock & custom hostname guard (about:blank)',
        'Anti-Inspect & Anti-Copy (forms remain editable)',
        'Zero document.write() — 100% modern DOM injection',
      ],
    },
    {
      name: 'Blogger XML (Themes & Widgets)',
      ext: '.xml',
      icon: <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      desc: 'Engineered for Blogger templates. Protects custom scripts and static blocks while keeping all Blogger directives and AdSense untouched.',
      features: [
        'DOMParser XML validation before export',
        'Blogger-safe //<![CDATA[ ... //]]> script wrapping',
        'Preserves <b:includable>, <b:skin> <Variable>, <data:*>',
        'Optional www.blogger.com preview Domain Lock whitelist',
      ],
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 py-8 lg:py-16">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] text-balance">
          Real Client-Side Code Protection &amp; Obfuscation
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          CodeGuard secures HTML websites, web apps, and Blogger XML themes using real{' '}
          <code className="font-mono text-cyan-700 dark:text-cyan-300">javascript-obfuscator</code> inside a non-blocking Web Worker—with RC4 encryption, Control Flow Flattening, Domain Lock, and Anti-Inspect protection. 100% browser-based, zero server transmission.
        </p>

        {/* Hero CTAs */}
        <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('secure')}
            className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch Secure Code Tool</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('restore')}
            className="px-6 py-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Restore &amp; Beautify Code</span>
          </button>
        </div>
      </section>

      {/* Supported Formats Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Supported Code Pipelines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formatCards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 hover:border-cyan-500/40 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {card.icon}
                </div>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{card.ext}</span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{card.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <ul className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                {card.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How CodeGuard Works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            How CodeGuard Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Select Mode &amp; Security Rules
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose HTML or Blogger XML, set Allowed Domains for Domain Lock, select RC4/Base64 encoding, and configure CSS/HTML hiding &amp; Anti-Inspect flags.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-sm flex items-center gap-1">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Web Worker Obfuscation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Large 50KB–150KB templates process smoothly off the main thread with live progress updates while preserving ES module imports, Blogger tags, and backups.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Verify, Test &amp; Deploy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Run inside the smart Sandbox Preview (even when Domain Lock is configured), confirm DOMParser XML validity for Blogger, and export or copy immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Technical clarity about client-side obfuscation, Blogger XML safety, and source backups.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden transition-colors shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
