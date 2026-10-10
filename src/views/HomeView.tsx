import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
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
import { HonestSecurityNotice } from '../components/HonestSecurityNotice.tsx';

interface Props {
  onNavigate: (page: ActivePage) => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [logoLoadError, setLogoLoadError] = useState(false);

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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Client-Side Code Defense Utility</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">MRS Engineers BD</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
              Protect, Minify, &amp; Restore Your Source Code
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              CodeGaurd provides browser-based code protection, minification, obfuscation, and supported code restoration for HTML, JavaScript, CSS, and Blogger XML themes. 100% client-side with zero server transmission.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('secure')}
                className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2 shrink-0"
              >
                <span>Launch Secure Code Tool</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('restore')}
                className="px-6 py-3.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors flex items-center gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Restore Code &amp; Beautify</span>
              </button>
            </div>

            {/* Quick Micro-stats */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div>
                <span className="text-slate-200 font-semibold">4</span> Supported Formats
              </div>
              <span className="text-slate-700">·</span>
              <div>
                <span className="text-slate-200 font-semibold">100%</span> Local Processing
              </div>
              <span className="text-slate-700">·</span>
              <div>
                <span className="text-slate-200 font-semibold">Zero</span> Data Storage
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-800/50 flex items-center justify-center">
                    {!logoLoadError ? (
                      <img
                        src="https://pxdrop.online/raw/db4t4h281qec73f6ose0"
                        alt="Logo"
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 object-contain"
                        onError={() => setLogoLoadError(true)}
                      />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                  <span className="font-semibold text-slate-200">Transformation Preview</span>
                </div>
                <span className="text-cyan-400 font-mono text-[11px]">ACTIVE ENGINE</span>
              </div>

              {/* Code comparison preview box */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Raw Input</div>
                  <div className="text-slate-400 truncate">function authenticateUser(token, secret) &#123;</div>
                  <div className="text-slate-400 truncate pl-3">console.log(&quot;Verifying access...&quot;);</div>
                  <div className="text-slate-400 truncate">&#125;</div>
                </div>

                <div className="flex items-center justify-center text-cyan-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/50 space-y-1">
                  <div className="text-[10px] text-cyan-400 uppercase font-sans font-semibold">Secured &amp; Obfuscated Output</div>
                  <div className="text-cyan-200/90 break-all text-[11px] leading-relaxed">
                    const _0x4e1a=[&quot;\x56\x65\x72\x69\x66\x79\x69\x6e\x67&quot;];function _0x1a00(_0x1a01)&#123;console.log(_0x4e1a[0]);&#125;
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>Deterrent-grade defense</span>
                <button
                  onClick={() => onNavigate('secure')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Test in workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Honest Security Notice Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HonestSecurityNotice />
      </section>

      {/* Supported Formats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Dedicated Pipelines</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Supported Source Formats
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            Never treat every language like plain text. CodeGaurd operates with dedicated format parsers designed to preserve critical syntax while achieving optimal compression.
          </p>
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
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Workflow</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How CodeGaurd Works
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            A three-step local processing workflow designed for maximum speed, security, and developer control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-base font-semibold text-slate-100">Input &amp; Auto-Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste your HTML, JS, CSS, or Blogger XML template into the workspace. The intelligent format detector inspects namespaces, doctypes, and grammar to pick the correct pipeline.
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
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">FAQ</div>
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

      {/* Developer Information Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Engineered by MRS Engineers BD</div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ready to secure your frontend application?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Get started immediately with the interactive workspace. No user registration, no telemetry, and zero fees.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('secure')}
              className="px-5 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Open Secure Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Contact Team
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
