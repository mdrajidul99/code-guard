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
  Globe,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { ActivePage } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { LanguageSwitcher } from '../components/LanguageSwitcher.tsx';

interface Props {
  onNavigate: (page: ActivePage) => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const faqs = isBn
    ? [
        {
          q: 'CodeGuard কি আমার সোর্স কোড কোনো রিমোট সার্ভারে আপলোড করে?',
          a: 'না। প্রতিটি ফরম্যাটিং, লেআউট সুরক্ষা, XML যাচাই এবং রিস্টোর প্রক্রিয়া শতভাগ আপনার নিজের ব্রাউজারের ভেতরেই সম্পন্ন হয়। আপনার কোড কখনোই ডিভাইসের বাইরে যায় না।',
        },
        {
          q: 'CodeGuard কীভাবে ওয়েবসাইট ও ব্লগার থিমকে সুরক্ষিত রাখে?',
          a: 'CodeGuard কোডের লজিক ও ডিজাইনকে বহুস্তরীয় সুরক্ষায় আবৃত করে, সাধারণ ভিউ-সোর্সে স্টাইল ও লেআউট মার্কআপ আড়াল রাখে এবং অনুমোদিত ডোমেইন ছাড়া চালানো ও কপি/ইন্সপেক্ট করা থেকে রক্ষা করে—সব ফিচার সচল রেখেই।',
        },
        {
          q: 'কোড সুরক্ষিত করলে কি ওয়েবসাইটের বাটন, ফর্ম বা এক্সটার্নাল স্ক্রিপ্ট নষ্ট হবে?',
          a: 'না। প্রয়োজনীয় CDN লিংক, ইনলাইন ইভেন্ট হ্যান্ডলার এবং আধুনিক অ্যাপের মডিউল ইমপোর্টগুলো সঠিকভাবে অক্ষত রাখা হয় যেন ওয়েবসাইট ও ওয়েব অ্যাপ নির্বিঘ্নে কাজ করে।',
        },
        {
          q: 'Blogger XML সুরক্ষিত করলে থিম এডিটরে সেভ করতে কি কোনো এরর আসবে?',
          a: 'না। CodeGuard ব্লগারের থিম স্ট্রাকচার, ভ্যারিয়েবল, সেকশন, উইজেট, পোস্ট লুপ, ডাইনামিক ট্যাগ ও AdSense/Analytics কোড অক্ষত রাখে এবং আউটপুট দেওয়ার আগে XML গঠন যাচাই করে দেয়।',
        },
        {
          q: 'সুরক্ষিত করা কোড কীভাবে রিস্টোর বা সাজানো যাবে?',
          a: 'একই ব্রাউজারে সিকিউর করা কোড CodeGuard-এর লোকাল ভল্ট থেকে হুবহু পুনরুদ্ধার করা যায়। এছাড়া এনকোডেড HTML ও Blogger XML কোড ডিকোড করে পরিচ্ছন্ন ফরম্যাটে সাজিয়ে লাইভ প্রিভিউ দেখা এবং ডাউনলোড করা যায়।',
        },
      ]
    : [
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
          a: 'CodeGuard can automatically recover exact secured code created in the same browser via its private local vault, decode common encoded wrappers, reconstruct hidden styles and layout blocks, and format HTML and Blogger XML cleanly.',
        },
      ];

  const formatCards = isBn
    ? [
        {
          name: 'HTML ওয়েবসাইট ও অ্যাপ',
          ext: '.html',
          icon: <FileCode className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
          desc: 'ওয়েবসাইট ও ওয়েব অ্যাপের ডিজাইন, লেআউট এবং স্ক্রিপ্ট সুরক্ষিত করে—প্রতিটি ফিচার সচল রেখেই।',
          features: [
            'মেটা ট্যাগ, ফন্ট, SEO লিংক ও CDN স্ক্রিপ্ট অক্ষত রাখে',
            'অননুমোদিত ডোমেইনে রান আটকাতে Domain Lock সুবিধা',
            'ফর্ম টাইপিং সচল রেখে Anti-Inspect ও Anti-Copy সুরক্ষা',
            'আউটপুট যাচাইয়ের জন্য লাইভ প্রিভিউ স্যান্ডবক্স সুবিধা',
          ],
        },
        {
          name: 'Blogger XML থিম',
          ext: '.xml',
          icon: <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
          desc: 'XML বা SEO ট্যাগ না ভেঙে ব্লগার থিমের স্টাইল, লেআউট এবং কাস্টম স্ক্রিপ্ট নিরাপদে সুরক্ষিত করে।',
          features: [
            'এক্সপোর্টের আগে স্বয়ংক্রিয় XML স্ট্রাকচার ভ্যালিডেশন',
            'ব্লগারের সেকশন, উইজেট, ভ্যারিয়েবল ও ডাইনামিক ট্যাগ অক্ষত থাকে',
            'AdSense ও Google Analytics স্ক্রিপ্ট সম্পূর্ণ নিরাপদ রাখে',
            'ব্লগার ড্যাশবোর্ড থিম প্রিভিউয়ের জন্য ঐচ্ছিক ডোমেইন অনুমোদন',
          ],
        },
      ]
    : [
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
    <div className="space-y-16 lg:space-y-24 pb-12 lg:pb-16 pt-4 lg:pt-6">
      {/* Top-Right Home Corner Language Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 !mt-6 lg:!mt-10">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] text-balance">
          {isBn
            ? 'ব্রাউজার-ভিত্তিক কোড সুরক্ষা ও পুনরুদ্ধার প্ল্যাটফর্ম'
            : 'Client-Side Code Protection & Restoration'}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          {isBn
            ? 'এক ক্লিকে আপনার ওয়েবসাইট HTML, ওয়েব অ্যাপ এবং Blogger XML থিম নিরাপদে সুরক্ষিত বা রিস্টোর করুন। সব কাজ সম্পূর্ণভাবে আপনার ব্রাউজারের ভেতরেই সম্পন্ন হয়।'
            : 'Protect or restore your website HTML, web apps, and Blogger XML themes safely in one click. Everything runs privately inside your browser.'}
        </p>

        {/* Hero CTAs */}
        <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('secure')}
            className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isBn ? 'কোড সিকিউর টুল চালু করুন' : 'Launch Secure Code Tool'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('restore')}
            className="px-6 py-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{isBn ? 'কোড রিস্টোর ও বিউটিফাই' : 'Restore & Beautify Code'}</span>
          </button>
        </div>
      </section>

      {/* Supported Formats Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'সমর্থিত কোড ফরম্যাট' : 'Supported Code Pipelines'}
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
            {isBn ? 'CodeGuard যেভাবে কাজ করে' : 'How CodeGuard Works'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {isBn ? 'মোড ও সুরক্ষা নিয়ম নির্বাচন' : 'Select Mode & Protection Rules'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isBn
                ? 'HTML বা Blogger XML বাছাই করুন, প্রয়োজন হলে Domain Lock-এ ডোমেইন দিন, সুরক্ষার মাত্রা এবং লেআউট ও Anti-Inspect অপশন সেট করুন।'
                : 'Choose HTML or Blogger XML, set Allowed Domains for Domain Lock, select protection strength, and enable layout hiding or Anti-Inspect guards.'}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {isBn ? 'দ্রুত ব্রাউজার প্রসেসিং' : 'Fast Browser Processing'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isBn
                ? 'বড় ওয়েবসাইট ফাইল ও সম্পূর্ণ Blogger থিম ব্রাউজার হ্যাং না করেই স্মুথভাবে প্রসেস হয় এবং স্বয়ংক্রিয়ভাবে একটি লোকাল ব্যাকআপ সেভ থাকে।'
                : 'Large website files and full Blogger themes process smoothly right inside your browser while saving a local backup copy automatically.'}
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {isBn ? 'যাচাই, প্রিভিউ ও ব্যবহার' : 'Verify, Preview & Deploy'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isBn
                ? 'বিল্ট-ইন লাইভ প্রিভিউ ফ্রেমে কোড চালিয়ে দেখুন, Blogger-এর জন্য XML সঠিক আছে কিনা নিশ্চিত হোন এবং সাথে সাথে কপি বা ডাউনলোড করুন।'
                : 'Test your secured or restored code in the built-in Live Preview frame, confirm XML safety for Blogger, and copy or download immediately.'}
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'সাধারণ জিজ্ঞাসা (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isBn
              ? 'প্রাইভেসি, ব্লগার থিম নিরাপত্তা, ব্যাকআপ ও কোড রিস্টোর সংক্রান্ত জরুরি প্রশ্নোত্তর।'
              : 'Quick answers about privacy, Blogger theme safety, backups, and code restoration.'}
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

      {/* About CodeGuard / MRS Engineers BD */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isBn ? 'MRS Engineers BD সম্পর্কে' : 'About CodeGuard & MRS Engineers BD'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {isBn
                ? 'CodeGuard হলো MRS Engineers BD-এর একটি অফিশিয়াল ও ১০০% ক্লায়েন্ট-সাইড (প্রাইভেসি-ফার্স্ট) ডেভেলপার টুল। আপনার সব কোড সরাসরি নিজের ব্রাউজারেই প্রসেস হয়।'
                : 'CodeGuard is an official, 100% client-side (privacy-first) developer tool developed and maintained by MRS Engineers BD. Everything executes securely inside your own browser.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://mrs-engineersbd.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg border border-cyan-600/40 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{isBn ? 'অফিশিয়াল ওয়েবসাইট' : 'Official Website'}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href="https://qr-code-tools.2bd.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>QR Code Tools</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
