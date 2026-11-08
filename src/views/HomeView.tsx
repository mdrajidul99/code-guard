import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  Zap,
  Lock,
  Code2,
  ChevronDown,
  Check,
  FileCode,
  Layers,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { ActivePage, CodeFormat } from '../types/index.ts';

interface Props {
  onNavigate: (page: ActivePage) => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does CodeGaurd upload my source code to a remote server?',
      a: 'No. All minification, obfuscation, format checking, and restoration occur entirely locally inside your browser via web-native JavaScript execution. Your source code never leaves your device or travels across network wires.',
    },
    {
      q: 'Will secured JavaScript or encoded HTML break my site or Blogger theme?',
      a: 'No. CodeGaurd uses non-destructive self-executing encoded runners for HTML and JavaScript, and preserves XML declarations, namespaces, and widget tags for Blogger XML themes. Your code executes smoothly without syntax errors or broken layouts.',
    },
    {
      q: 'Can CodeGaurd make client-side code 100% unhackable?',
      a: 'Because web browsers must execute client-side code, motivated individuals with developer tools can inspect running memory. However, CodeGaurd provides deterrent-grade encoded protection, completely obscuring raw HTML markup, scripts, and logic from view-source and casual copying.',
    },
    {
      q: 'How does Blogger XML protection ensure zero theme errors?',
      a: 'Blogger XML requires strict adherence to Blogger tags (xmlns:b, <b:skin>, <b:section>, <b:widget>). CodeGaurd isolates CDATA sections and wraps custom JavaScript in Blogger-compliant //<![CDATA[ ... //]]> self-executing runners, ensuring the Blogger Theme Editor saves and publishes without XML parsing errors.',
    },
    {
      q: 'Can CodeGaurd restore and decode previously secured code?',
      a: 'Yes! CodeGaurd detects protected HTML and JavaScript runners, Blogger XML CDATA scripts, Base64 payloads, hexadecimal/unicode escapes, and reconstitutes the clean, beautifully formatted original code in one click.',
    },
  ];

  const formatCards = [
    {
      name: 'HTML (Website & App Code)',
      ext: '.html',
      icon: <FileCode className="w-5 h-5 text-cyan-400" />,
      desc: 'Encodes markup into self-executing, non-destructive runners that display flawlessly in browsers without overwriting host pages.',
      features: ['Self-executing encoded runner', 'Non-destructive DOM rendering', 'Complete view-source protection', 'Instant one-click restore'],
    },
    {
      name: 'Blogger XML (Themes & Widgets)',
      ext: '.xml',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      desc: 'Specialized engine built specifically for Blogger template architects. Preserves widget blocks, includables, and expressions while encoding custom scripts.',
      features: ['Zero theme editor save errors', 'Blogger-safe CDATA runner', 'Preserves all b:includable tags', 'Template structure integrity'],
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 py-8 lg:py-16">
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
          Protect, Encode, &amp; Restore Your Source Code
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          CodeGaurd provides browser-based code protection, self-executing encoding, and supported code restoration for HTML (Website &amp; App Code) and Blogger XML themes. 100% client-side with zero server transmission.
        </p>

        {/* Hero CTAs */}
        <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={() => onNavigate('secure')}
            className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2 shrink-0"
          >
            <span>Launch Secure Code Tool</span>
          </button>

          <button
            onClick={() => onNavigate('restore')}
            className="px-6 py-3.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Restore Code &amp; Beautify</span>
          </button>
        </div>
      </section>

      {/* Supported Formats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Supported Source Formats
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {formatCards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                  {card.icon}
                </div>
                <span className="font-mono text-xs text-slate-400">{card.ext}</span>
              </div>

              <div>
                <h3 className="font-semibold text-slate-100">{card.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
              </div>

              <ul className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                {card.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How CodeGaurd Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-base font-semibold text-slate-100">Input &amp; Format Selection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste your HTML, JS, CSS, or Blogger XML template into the workspace and select your format from the dropdown menu to apply specialized protection.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-base font-semibold text-slate-100">Granular Transformation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Customize obfuscation and minification flags. The browser-native engine executes syntax transforms, identifier mangling, and string array generation with zero network lag.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-base font-semibold text-slate-100">Export &amp; Production Deploy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Copy output with one click or export verified files (.html, .js, .css, .xml, .txt). Backups of your original uncompressed source can be downloaded at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm">
            Honest answers to common developer inquiries about client-side code security.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
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
