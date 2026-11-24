import React from 'react';
import { Lock, Database, Mail } from 'lucide-react';
import { ActivePage } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface PrivacyViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = () => {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {isBn ? 'প্রাইভেসি পলিসি (গোপনীয়তা নীতি)' : 'Privacy Policy'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          {isBn
            ? 'নির্মাতা: MRS Engineers BD · ১০০% ব্রাউজার-ভিত্তিক প্রসেসিং'
            : 'Engineered by MRS Engineers BD · 100% Client-Side Processing'}
        </p>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>
              {isBn
                ? '১. সার্ভারে কোনো সোর্স কোড পাঠানো হয় না'
                : '1. Zero Remote Transmission of Source Code'}
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'আপনি যখন CodeGuard-এ HTML, CSS, JavaScript বা Blogger XML কোড পেস্ট করেন, তখন সুরক্ষা, ভ্যালিডেশন, রিস্টোর এবং ফরম্যাটিংয়ের প্রতিটি ধাপ সম্পূর্ণভাবে আপনার নিজের ব্রাউজারের ভেতরেই চলে। কোনো কোড কখনোই বাইরের সার্ভারে পাঠানো হয় না।'
              : 'When you paste HTML, CSS, JavaScript, or Blogger XML templates into CodeGuard, every protection, validation, restoration, and formatting step runs strictly inside your own browser. No source code is ever sent to any external server.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>
              {isBn ? '২. ব্রাউজার লোকাল স্টোরেজ ব্যবহার' : '2. Local Browser Storage Usage'}
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'CodeGuard কোনো বিজ্ঞাপনী কুকি, ট্র্যাকিং পিক্সেল বা অ্যানালিটিক্স ব্যবহার করে না। শুধু আপনার ডিভাইসে স্থানীয়ভাবে যা সংরক্ষিত থাকে:'
              : 'CodeGuard does not use advertising cookies, tracking pixels, or analytics telemetry. Data saved strictly on your local device includes:'}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-900 dark:text-slate-200">
                {isBn ? 'থিম ও ভাষা পছন্দ:' : 'Theme & Language Preference:'}
              </strong>{' '}
              {isBn
                ? 'আপনি ডার্ক/লাইট মোড এবং বাংলা/ইংরেজি কোন ভাষা বেছে নিয়েছেন তা মনে রাখে।'
                : 'Remembers your Dark/Light theme and English/Bangla language choice.'}
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">
                {isBn ? 'লোকাল ব্যাকআপ ও রিকভারি ভল্ট:' : 'Local Backups & Recovery Vault:'}
              </strong>{' '}
              {isBn
                ? 'আপনার সাম্প্রতিক মূল কোডের ব্যাকআপ ও রিকভারি তথ্য শুধু আপনার ব্রাউজারের ভেতরেই সংরক্ষণ করে যেন আপনি যেকোনো সময় তা পুনরুদ্ধার করতে পারেন।'
                : 'Stores recent source backups and recovery signatures locally inside your browser so you can recover or restore your own code at any time without uploading anything.'}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isBn ? '৩. স্ট্যাটিক অ্যাসেট ও ফন্ট' : '3. Static Assets & Fonts'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'CodeGuard Google Fonts থেকে ওয়েব ফন্ট লোড করে। সমস্ত কোড প্রসেসিং টুল কোনো ব্যাকএন্ড API কল ছাড়াই আপনার ব্রাউজারের স্ট্যাটিক ফাইল থেকে চলে।'
              : 'CodeGuard loads web typography from Google Fonts. All processing tools run directly from static application files inside your browser with zero backend API calls during code transformation.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isBn ? '৪. ব্যবহারকারীর অধিকার ও কোডের মালিকানা' : '4. User Rights & Code Ownership'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'CodeGuard ব্যবহার করে প্রসেস করা সমস্ত সোর্স কোড, টেমপ্লেট ও স্ক্রিপ্টের ১০০% মালিকানা আপনার। MRS Engineers BD আপনার কোডের ওপর কোনো স্বত্ব দাবি করে না।'
              : 'You retain 100% intellectual property ownership of all source code, templates, and scripts you process using CodeGuard. MRS Engineers BD asserts zero copyright or licensing claims over transformed outputs.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{isBn ? '৫. গোপনীয়তা সংক্রান্ত যোগাযোগ' : '5. Contact for Privacy Inquiries'}</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'এই প্রাইভেসি পলিসি বা ডেটা নিরাপত্তা সম্পর্কে কোনো প্রশ্ন থাকলে সরাসরি আমাদের টিমের সাথে যোগাযোগ করুন:'
              : 'If you have questions regarding this privacy policy or how CodeGuard handles data locally, reach our team directly:'}
          </p>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-200">MRS Engineers BD</div>
            <div className="text-slate-600 dark:text-slate-400 mt-1">
              {isBn ? 'ইমেইল: ' : 'Email: '}
              <a href="mailto:mrs.engineers.bd26@gmail.com" className="text-cyan-700 dark:text-cyan-400 hover:underline">
                mrs.engineers.bd26@gmail.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
