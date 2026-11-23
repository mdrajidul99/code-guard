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
      a: 'No. Every formatting, layout protection, XML validation, and restoration step runs 100% locally inside your browser. Your source code never leaves your device.',
    },
    {
      q: 'How does CodeGuard protect websites and themes?',
      a: 'CodeGuard applies multi-layered code protection, hides static styles and layout markup from casual viewing, and includes optional Domain Lock and Anti-Inspect shields—while keeping interactive features working smoothly.',
    },
    {
      q: 'Will securing code break interactive scripts, external libraries, or click handlers?',
      a: 'No. Critical external CDN links, inline event handlers, and modern app imports are carefully preserved so websites, forms, and interactive apps continue running reliably.',
    },
    {
      q: 'How does Blogger XML protection avoid Theme Editor save errors?',
      a: 'CodeGuard preserves Blogger template structure, theme variables, widgets, loop directives, dynamic data tags, and AdSense/Analytics blocks safely, then validates the XML structure before you copy or download.',
    },
    {
      q: 'How does Restore & Beautify work with secured or encoded code?',
      a: 'CodeGuard can automatically recover exact secured code created in the same browser via its private local vault, decode common encoded wrappers, reconstruct hidden styles and layout blocks, and format HTML, CSS, JavaScript, and Blogger XML cleanly.',
    },
  ];

  const formatCards = [
    {
      name: 'HTML Website & App',
      ext: '.html',
      icon: <FileCode className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      desc: 'Secures design, layout, and scripts of websites and web apps while keeping every feature working smoothly.',
      features: [
        'Preserves meta tags, fonts, SEO links, and CDN scripts',
        'Domain Lock guard blocks unauthorized hosting domains',
        'Anti-Inspect & Anti-Copy while keeping forms editable',
        'Includes built-in Live Preview sandbox testing',
      ],
    },
    {
      name: 'Blogger XML',
      ext: '.xml',
      icon: <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      desc: 'Protects Blogger theme styles, layout, and custom scripts cleanly without breaking XML or SEO tags.',
      features: [
        'Automatic XML structure validation before export',
        'Preserves Blogger sections, widgets, variables, and dynamic tags',
        'Keeps AdSense & Google Analytics scripts untouched',
        'Optional Blogger Dashboard preview domain whitelist',
      ],
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 py-8 lg:py-16">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] text-balance">
          Client-Side Code Protection &amp; Restoration
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Protect or restore your website HTML, web apps, and Blogger XML themes safely in one click. Everything runs privately inside your browser.
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
              Select Mode &amp; Protection Rules
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose HTML or Blogger XML, set Allowed Domains for Domain Lock, select protection strength, and enable layout hiding or Anti-Inspect guards.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Fast Browser Processing
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Large website files and full Blogger themes process smoothly right inside your browser while saving a local backup copy automatically.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Verify, Preview &amp; Deploy
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Test your secured or restored code in the built-in Live Preview frame, confirm XML safety for Blogger, and copy or download immediately.
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
            Quick answers about privacy, Blogger theme safety, backups, and code restoration.
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
