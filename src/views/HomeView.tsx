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
      q: 'Will obfuscated JavaScript or minified HTML break my site?',
      a: 'CodeGaurd preserves HTML DOM attributes, IDs, accessibility landmarks, and event listeners. For JavaScript, standard identifier mangling and string lookup tables keep syntax execution intact. However, we always recommend testing thoroughly in a staging environment and using the "Backup" button before deploying to production.',
    },
    {
      q: 'Can CodeGaurd make client-side code 100% unhackable?',
      a: 'No, and any service claiming to do so is dishonest. Because browsers must parse and execute HTML, CSS, and JavaScript, motivated individuals can always inspect memory, network requests, or DOM nodes using Developer Tools. CodeGaurd provides deterrent-grade protection making casual copying and quick inspection far more difficult.',
    },
    {
      q: 'How does Blogger XML protection differ from standard HTML minification?',
      a: 'Blogger XML contains proprietary namespaces (xmlns:b, xmlns:data, xmlns:expr), widget definitions, CDATA blocks, and <b:includable> tags. Blindly running standard HTML minifiers strips or corrupts these critical Blogger directives. CodeGaurd isolates CDATA sections and preserves all Blogger template syntax.',
    },
    {
      q: 'Can CodeGaurd reverse any obfuscated code?',
      a: 'CodeGaurd restores code formatting, re-indents structural trees, decodes hexadecimal and unicode character escapes, and reconstitutes string array lookup tables. It cannot guess originally removed comments or variable names that were irreversibly mangled.',
    },
  ];

  const formatCards = [
    {
      name: 'HTML Documents',
      ext: '.html',
      icon: <FileCode className="w-5 h-5 text-cyan-400" />,
      desc: 'Compresses DOM trees, strips non-essential comments, minifies inline CSS and scripts, and offers self-extracting container encapsulation.',
      features: ['Inline style compression', 'Inline script minification', 'Event handler & ID preservation', 'Protected container mode'],
    },
    {
      name: 'JavaScript Files',
      ext: '.js',
      icon: <Code2 className="w-5 h-5 text-cyan-400" />,
      desc: 'Industrial-grade identifier mangling, string lookup table rotation, hexadecimal character encoding, and syntax compression.',
      features: ['Identifier mangling (_0x...)', 'Scrambled string arrays', 'Hex string escaping', 'Zero eval() risk'],
    },
    {
      name: 'CSS Stylesheets',
      ext: '.css',
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      desc: 'High-density stylesheet minification with strict preservation of CSS variables, media queries, keyframes, and browser vendor prefixes.',
      features: ['Hex color shortening', 'Zero unit stripping', 'Custom property preservation', 'Keyframe & query safety'],
    },
    {
      name: 'Blogger XML Themes',
      ext: '.xml',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      desc: 'Specialized engine built specifically for Blogger template architects. Preserves widget blocks, includables, and expressions while minifying skin CDATA.',
      features: ['Strict XML validation', 'CDATA skin minification', 'Widget & namespace safe', 'Template structure integrity'],
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 py-8 lg:py-16">
      
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
          Protect, Minify, &amp; Restore Your Source Code
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          CodeGaurd provides browser-based code protection, minification, obfuscation, and supported code restoration for HTML, JavaScript, CSS, and Blogger XML themes. 100% client-side with zero server transmission.
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
