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
        'Security Control Panel থেকে পছন্দমতো Protection Strength (Maximum, Standard, বা Light), Hide CSS & Static HTML inside JS, Anti-Inspect & Anti-Copy, এবং প্রয়োজনে Domain Lock সেট করুন।',
        '"Secure Code (Encode)" বাটনে ক্লিক করুন। ব্রাউজার হ্যাং না হয়েই কোড সুরক্ষিত হবে এবং আপনার মূল কোডের একটি অটো-ব্যাকআপ সেভ হয়ে যাবে।',
        '"Test & Run Output" দিয়ে লাইভ প্রিভিউ চালিয়ে যাচাই করুন এবং Copy বা Download (.html) করে ব্যবহার করুন।',
      ],
      tip: 'আপনার SEO meta ট্যাগ, পেজ টাইটেল, Google Fonts, ওয়েব অ্যাপ ম্যানিফেস্ট এবং বাহ্যিক লাইব্রেরি লিংকগুলো সম্পূর্ণ অক্ষত থাকে যেন ওয়েবসাইট স্বাভাবিক গতিতে চলে।',
    },
    {
      id: 'blogger',
      title: 'Blogger XML (Themes & Widgets)',
      icon: <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      steps: [
        'সতর্কতা হিসেবে প্রথমে আপনার Blogger Dashboard -> Theme -> Backup থেকে মূল থিমের একটি ব্যাকআপ ডাউনলোড করে রাখুন।',
        'CodeGuard-এ Format থেকে "Blogger XML (Theme & Widget Code)" নির্বাচন করুন এবং সম্পূর্ণ XML থিম বা উইজেট পেস্ট করুন।',
        'নির্দিষ্ট ডোমেইনে থিমটি লক করতে চাইলে Domain Lock বক্সে ডোমেইন লিখুন (যেমন: myblog.blogspot.com) এবং Blogger Dashboard প্রিভিউ সচল রাখতে "Allow Blogger Preview (www.blogger.com)" চালু রাখুন।',
        '"Secure Code (Encode)" চাপুন। CodeGuard স্বয়ংক্রিয়ভাবে ব্লগারের সেকশন, উইজেট, থিম ভ্যারিয়েবল, পোস্ট লুপ এবং AdSense/Analytics অক্ষত রেখে কাস্টম ডিজাইন ও স্ক্রিপ্ট সুরক্ষিত করবে।',
        'আউটপুট তৈরি হলে সবুজ "XML Validation Passed" ব্যানার নিশ্চিত করুন, এরপর Copy বা XML ডাউনলোড করে Blogger Theme Editor-এ সেভ করুন।',
      ],
      tip: 'প্রতিটি সুরক্ষিত ব্লক ব্লগার থিম এডিটরের নিয়ম মেনে তৈরি করা হয় এবং আউটপুটের আগে অটোমেটিক XML স্ট্রাকচার ভ্যালিডেশন চেক সম্পন্ন হয়, তাই সেভ করার সময় কোনো XML এরর আসে না।',
    },
    {
      id: 'domain-lock',
      title: 'Domain Lock & Anti-Inspect',
      icon: <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      steps: [
        'Domain Lock বক্সে আপনার অনুমোদিত ডোমেইন লিখে Enter বা কমা (,) চাপুন (যেমন: example.blogspot.com, username.github.io)।',
        'অন্য কোনো ডোমেইন বা অজানা সার্ভার থেকে এই কোড চালানোর চেষ্টা করলে পেজ সঙ্গে সঙ্গে খালি হয়ে সুরক্ষিত থাকবে।',
        'Anti-Inspect & Anti-Copy চালু থাকলে ভিজিটরের ব্রাউজারে Right-Click, F12, Ctrl+U, Ctrl+S, Ctrl+P এবং টেক্সট কপি ব্লক থাকবে।',
        'তবে ওয়েবসাইটের সার্চ বার, লগইন ফর্ম বা কমেন্ট বক্সের ইনপুট ফিল্ডগুলোতে টাইপ ও পেস্ট স্বাভাবিকভাবেই কাজ করবে।',
      ],
      tip: 'Domain Lock দেওয়ার পরেও CodeGuard-এর "Test & Run Output" বাটনে ক্লিক করলে প্রিভিউ কাজ করবে, কিন্তু Copy/Download করা আসল আউটপুটে Domain Lock সম্পূর্ণ সক্রিয় থাকবে।',
    },
    {
      id: 'restore',
      title: 'Restore Code & Auto-Backup',
      icon: <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      steps: [
        'যখন আপনি একই ব্রাউজারে CodeGuard দিয়ে কোনো কোড সিকিউর করেন, তখন তার ম্যাচিং তথ্য ও ব্যাকআপ আপনার ব্রাউজারের লোকাল ভল্টে নিরাপদে সংরক্ষিত থাকে।',
        'পরবর্তীতে সেই সিকিউরড কোড (এমনকি ব্লগার থেকে view-source করা কোডও) Restore Code পেজে পেস্ট করে "Restore & Decode" চাপলে আপনার মূল কোড ফিরিয়ে আনা যায়।',
        'এছাড়া যেকোনো এনকোডেড স্ক্রিপ্ট ডিকোড করতে, লুকানো স্টাইল ও লেআউট ব্লক সাজাতে অথবা HTML, CSS, JavaScript ও Blogger XML ফরম্যাট করতে "Restore & Decode" বা "Beautify Code Only" ব্যবহার করুন।',
        'আউটপুট তৈরি হলে "Test & Run Restored Output" বাটনে ক্লিক করে সরাসরি প্রিভিউ দেখুন অথবা ডাউনলোড করুন।',
      ],
      tip: 'গুরুত্বপূর্ণ প্রজেক্টের মূল সোর্স ফাইল সবসময় সুরক্ষিত রাখতে "Download Original Backup" ব্যবহার করে নিজের পিসি বা ক্লাউড ড্রাইভে একটি কপি সেভ রাখুন।',
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
          HTML ওয়েবসাইট, Blogger XML থিম, Domain Lock এবং Restore/Backup ব্যবহারের সহজ গাইড।
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
            <span className="font-semibold text-cyan-900 dark:text-cyan-100">Helpful Tip:</span>
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
