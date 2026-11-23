import React, { useState } from 'react';
import {
  FileCode,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface Props {
  onNavigate: (page: ActivePage) => void;
  onBack?: () => void;
}

export const HowToUseView: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<string>('html');

  const guides = [
    {
      id: 'html',
      title: 'HTML (Website & App Code)',
      icon: <FileCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      steps: [
        'Secure Code ট্যাবে গিয়ে Select Format থেকে "HTML (Website & App Code)" নির্বাচন করুন।',
        'ইনপুট বক্সে আপনার সম্পূর্ণ HTML বা App কোড পেস্ট করুন (অথবা Sample বাটনে ক্লিক করে টেস্ট কোড লোড করুন)।',
        'Security Control Panel থেকে আপনার পছন্দমতো অপশন সেট করুন: String Array Encoding (ডিফল্ট RC4 Strongest), Hide CSS & Static HTML inside JS, Anti-Inspect & Anti-Copy, এবং প্রয়োজন হলে Domain Lock।',
        '"Secure Code (Encode)" বাটনে ক্লিক করুন। Web Worker-এ ব্রাউজার হ্যাং না করেই লাইভ প্রগ্রেসসহ আপনার কোড এনকোড হবে এবং অরিজিনাল কোডের একটি অটো-ব্যাকআপ সেভ হয়ে যাবে।',
        '"Test & Run Output" দিয়ে লাইভ স্যান্ডবক্সে আউটপুট চালিয়ে যাচাই করুন এবং Copy বা Download (.html) করে ব্যবহার করুন।',
      ],
      tip: 'আপনার <meta>, <title>, <link> (Google Fonts/Manifest/Favicon), এবং CDN <script src="..."> লিংক সম্পূর্ণ অক্ষত থাকবে। <script type="module">-এর টপ-লেভেল import স্টেটমেন্টগুলো আলাদা রেখে শুধুমাত্র ভেতরের লজিক সুরক্ষিত করা হয়।',
    },
    {
      id: 'blogger',
      title: 'Blogger XML (Themes & Widgets)',
      icon: <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      steps: [
        'সতর্কতা হিসেবে প্রথমে আপনার Blogger Dashboard -> Theme -> Backup থেকে মূল থিমের একটি ব্যাকআপ ডাউনলোড করে রাখুন।',
        'CodeGuard-এ Format থেকে "Blogger XML (Theme & Widget Code)" নির্বাচন করুন এবং সম্পূর্ণ XML থিম বা উইজেট পেস্ট করুন।',
        'যদি আপনার ব্লগের নির্দিষ্ট ডোমেইনে থিমটি লক করতে চান, তবে Domain Lock বক্সে আপনার ডোমেইন লিখুন (যেমন: myblog.blogspot.com) এবং "Allow Blogger Preview (www.blogger.com)" চালু রাখুন যেন থিম প্রিভিউ কাজ করে।',
        '"Secure Code (Encode)" চাপুন। CodeGuard স্বয়ংক্রিয়ভাবে <b:section>, <b:widget>, <b:includable>, <b:if>, <data:.../> এবং AdSense/Analytics অক্ষত রেখে কাস্টম JS ও CSS সুরক্ষিত করবে।',
        'আউটপুট তৈরি হলে সবুজ "DOMParser XML Validation Passed" ব্যানার নিশ্চিত করুন, এরপর Copy বা XML ডাউনলোড করে Blogger Theme Editor-এ সেভ করুন।',
      ],
      tip: 'প্রতিটি Obfuscated স্ক্রিপ্ট নিরাপদ //<![CDATA[ ... //]]> ব্লকের ভেতরে থাকে এবং কোনো কাঁচা "]]>" ক্যারেক্টার থাকে না, তাই org.xml.sax.SAXParseException এরর আসার ঝুঁকি থাকে না।',
    },
    {
      id: 'domain-lock',
      title: 'Domain Lock & Anti-Inspect',
      icon: <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      steps: [
        'Domain Lock ইনপুটে কমা দিয়ে অনুমোদিত ডোমেইনগুলো লিখুন (যেমন: example.blogspot.com, username.github.io)।',
        'অন্য কোনো ডোমেইন বা কারও লোকাল কম্পিউটার (localhost) থেকে এই কোড চালানোর চেষ্টা করলে পেজ সঙ্গে সঙ্গে খালি হয়ে about:blank-এ রিডাইরেক্ট হবে।',
        'Anti-Inspect & Anti-Copy চালু থাকলে ভিজিটরের ব্রাউজারে Right-Click, F12, Ctrl+U, Ctrl+S, Ctrl+P, Ctrl+Shift+I/J/C/K এবং টেক্সট কপি ব্লক থাকবে।',
        'তবে ওয়েবসাইটের সার্চ বার, লগইন ফর্ম বা কমেন্ট বক্সের <input>, <textarea>, <select> এবং contenteditable ফিল্ডগুলোতে টাইপ, সিলেক্ট ও কপি স্বাভাবিকভাবেই কাজ করবে।',
      ],
      tip: 'Domain Lock দেওয়ার পরেও CodeGuard-এর "Test & Run Output" বাটনে ক্লিক করলে স্যান্ডবক্স প্রিভিউ কাজ করবে, কারণ প্রিভিউ দেখার সময় স্বয়ংক্রিয়ভাবে ডোমেইন লক ছাড়া টেস্ট বিল্ড রান হয় (কিন্তু Copy/Download আউটপুটে Domain Lock চালু থাকে)।',
    },
    {
      id: 'restore',
      title: 'Restore Code & Auto-Backup',
      icon: <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      steps: [
        'মনে রাখবেন: RC4 + Control Flow Flattening + Self-Defending দিয়ে এনকোড করা আসল Obfuscated কোড কখনোই আগের সোর্স কোডে ডিকোড করা যায় না (এটি One-Way)।',
        'তাই মূল কোড সংরক্ষণের জন্য Secure Code করার সময়ই CodeGuard আপনার ব্রাউজারের localStorage-এ সর্বশেষ ৫টি অরিজিনাল ব্যাকআপ অটো-সেভ করে এবং "Download Original Backup" বাটন দেয়।',
        'সাধারণ Base64 (atob / document.write), Hex (\\x..), Unicode (\\u....), বা unescape(...) কোড ডিকোড করতে "Restore Code" পেজে যান, ফরম্যাট বাছাই করুন এবং "Restore & Decode" চাপুন।',
        'যেকোনো HTML, CSS, Blogger XML বা JavaScript কোডের অগোছালো ইন্ডেন্টেশন ঠিক করতে "Beautify Code Only" বাটনে ক্লিক করুন।',
      ],
      tip: 'গুরুত্বপূর্ণ প্রজেক্টের জন্য সবসময় "Download Original Backup" ক্লিক করে নিজের পিসি বা গুগল ড্রাইভে মূল ফাইল সংরক্ষণ করুন।',
    },
  ];

  const currentGuide = guides.find((g) => g.id === activeTab) || guides[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How to Use CodeGuard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          HTML ওয়েবসাইট, Blogger XML থিম, Domain Lock এবং Restore/Backup ব্যবহারের সম্পূর্ণ গাইড (বাংলা ও ইংরেজিতে)।
        </p>
      </div>

      {/* Guide Tabs */}
      <div className="flex justify-center flex-wrap gap-2 sm:gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        {guides.map((guide) => (
          <button
            key={guide.id}
            type="button"
            onClick={() => setActiveTab(guide.id)}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === guide.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800/60'
            }`}
          >
            {guide.icon}
            <span>{guide.title}</span>
          </button>
        ))}
      </div>

      {/* Active Guide Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center">
            {currentGuide.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentGuide.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              সর্বোচ্চ নিরাপত্তা ও ত্রুটিমুক্ত ফলাফলের জন্য ধাপগুলো অনুসরণ করুন।
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            Execution Steps
          </h3>
          <ol className="space-y-4">
            {currentGuide.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-cyan-700 dark:text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tip Callout */}
        <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-950 dark:text-cyan-200 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-cyan-900 dark:text-cyan-100">Technical Tip:</span>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">{currentGuide.tip}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate(activeTab === 'restore' ? 'restore' : 'secure')}
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {activeTab === 'restore' ? 'Open Restore Workspace' : 'Open Secure Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
};
