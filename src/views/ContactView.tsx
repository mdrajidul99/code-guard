import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Info, Globe, QrCode, ExternalLink } from 'lucide-react';
import { ActivePage } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ContactViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const ContactView: React.FC<ContactViewProps> = () => {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [topic, setTopic] = useState<string>('General Inquiry');
  const [subjectDetails, setSubjectDetails] = useState<string>('');

  const email = 'mrs.engineers.bd26@gmail.com';
  const mailtoSubject = encodeURIComponent(`[CodeGuard] ${topic}${subjectDetails ? ` - ${subjectDetails}` : ''}`);
  const mailtoLink = `mailto:${email}?subject=${mailtoSubject}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {isBn ? 'ডেভেলপার টিমের সাথে যোগাযোগ' : 'Contact Engineering Team'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
          {isBn
            ? 'যেকোনো সমস্যা, নতুন ফিচারের অনুরোধ বা Blogger XML থিম সামঞ্জস্যতা বিষয়ে CodeGuard ডেভেলপারদের সাথে সরাসরি যোগাযোগ করুন।'
            : 'Connect directly with the developers behind CodeGuard for bug disclosures, feature requests, or Blogger XML theme compatibility reports.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 space-y-5 shadow-sm">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isBn ? 'নির্মাতা প্রতিষ্ঠান' : 'Engineering Entity'}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">MRS Engineers BD</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn
                  ? 'CodeGuard হলো MRS Engineers BD-এর একটি অফিশিয়াল ও ১০০% ক্লায়েন্ট-সাইড (প্রাইভেসি-ফার্স্ট) ডেভেলপার টুল, যা সম্পূর্ণভাবে ব্রাউজারে নিরাপদে কাজ করে।'
                  : 'CodeGuard is an official, 100% client-side (privacy-first) developer tool by MRS Engineers BD, engineered for safe local browser execution.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn ? 'সরাসরি ইমেইল ঠিকানা' : 'Direct Email Address'}
                </div>
                <a
                  href={`mailto:${email}`}
                  className="text-sm font-semibold text-cyan-700 dark:text-cyan-400 hover:underline transition-colors flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="break-all">{email}</span>
                </a>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 space-y-2">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBn ? 'অফিশিয়াল প্ল্যাটফর্ম ও টুলস' : 'Official Platforms & Tools'}
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <a
                    href="https://mrs-engineersbd.blogspot.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>{isBn ? 'অফিশিয়াল ওয়েবসাইট ও অ্যাপ হাব' : 'Official Website & App Hub'}</span>
                    <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                  </a>
                  <a
                    href="https://qr-code-tools.2bd.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>QR Code Tools</span>
                    <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-300 font-semibold">
              <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{isBn ? 'উত্তর দেওয়ার সময়সীমা' : 'Response Time Expectation'}</span>
            </div>
            <p className="leading-relaxed">
              {isBn
                ? 'আমরা সব প্রশ্ন ও বাগ রিপোর্ট গুরুত্বের সাথে পর্যালোচনা করি। Blogger XML বা ওয়েব অ্যাপ সংক্রান্ত সমস্যার ক্ষেত্রে অনুগ্রহ করে কোডের ছোট একটি অংশ সংযুক্ত করবেন।'
                : 'We review all inquiries and bug reports promptly. For Blogger XML or web app compatibility edge cases, please include a minimal snippet to help reproduce the issue.'}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 space-y-5 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{isBn ? 'সরাসরি ইমেইল পাঠান' : 'Launch Direct Email'}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isBn
                  ? 'নিচে আপনার বিষয় নির্বাচন করে বাটনে ক্লিক করলে ডিফল্ট ইমেইল অ্যাপ চালু হবে।'
                  : 'Configure your subject line below to launch your default email client with a verified recipient and topic header.'}
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label htmlFor="cg-contact-topic" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'বিষয় নির্বাচন করুন' : 'Select Inquiry Topic'}
                </label>
                <select
                  id="cg-contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg px-3 py-2.5 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="General Inquiry">{isBn ? 'সাধারণ জিজ্ঞাসা' : 'General Inquiry'}</option>
                  <option value="Bug Report">{isBn ? 'বাগ রিপোর্ট / সিনট্যাক্স সমস্যা' : 'Bug Report / Syntax Issue'}</option>
                  <option value="Blogger XML Compatibility">{isBn ? 'Blogger XML সামঞ্জস্যতা' : 'Blogger XML Compatibility'}</option>
                  <option value="Feature Request">{isBn ? 'নতুন ফিচারের অনুরোধ' : 'Feature Request'}</option>
                  <option value="Security Disclosure">{isBn ? 'নিরাপত্তা সংক্রান্ত তথ্য' : 'Security Responsible Disclosure'}</option>
                </select>
              </div>

              <div>
                <label htmlFor="cg-contact-subject" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)' : 'Optional Brief Context / Subject Detail'}
                </label>
                <input
                  id="cg-contact-subject"
                  type="text"
                  value={subjectDetails}
                  onChange={(e) => setSubjectDetails(e.target.value)}
                  placeholder={isBn ? 'যেমন: ব্লগার থিমে ডোমেইন লক সংক্রান্ত প্রশ্ন' : 'e.g. Script parsing edge case in Blogger theme'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg px-3 py-2.5 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <a
                  href={mailtoLink}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBn ? `${email}-এ ইমেইল লিখুন` : `Compose Email to ${email}`}</span>
                </a>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                {isBn
                  ? 'উপরের বাটনে ক্লিক করলে আপনার ডিভাইসের স্ট্যান্ডার্ড মেইল অ্যাপ (mailto:) ওপেন হবে।'
                  : "Clicking the button above triggers your operating system's standard mail client (mailto:). CodeGuard never uses unverified mock forms."}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-200 dark:border-cyan-800/40 bg-cyan-50 dark:bg-cyan-950/20 p-4 text-xs text-cyan-900 dark:text-cyan-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p>
              {isBn ? (
                <>
                  <strong>সম্পূর্ণ ফ্রি ও স্বচ্ছ:</strong> CodeGuard সম্পূর্ণ বিনামূল্যে আপনার ব্রাউজারে স্থানীয়ভাবে কাজ করে।
                </>
              ) : (
                <>
                  <strong>Community Verified:</strong> CodeGuard is free, transparent, and operates 100% locally in your browser.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
