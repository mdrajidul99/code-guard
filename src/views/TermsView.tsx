import React from 'react';
import { ShieldCheck, FileText, Scale } from 'lucide-react';
import { ActivePage } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface TermsViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const TermsView: React.FC<TermsViewProps> = () => {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {isBn ? 'ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          {isBn
            ? 'MRS Engineers BD · ব্রাউজার-ভিত্তিক টুল ব্যবহারের শর্তাবলী'
            : 'MRS Engineers BD · Client-Side Utility Terms'}
        </p>
      </div>

      {/* Articles */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{isBn ? '১. বৈধ ব্যবহার' : '1. Acceptable Use'}</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'আপনি শুধুমাত্র বৈধ ও আইনসম্মত কাজে CodeGuard ব্যবহার করতে সম্মত হচ্ছেন। যে কোড আপনি এখানে প্রসেস করবেন তার মালিকানা বা ব্যবহারের বৈধ অনুমতি আপনার থাকতে হবে। ক্ষতিকর ম্যালওয়্যার বা অবৈধ কাজে এই টুল ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।'
              : 'You agree to use CodeGuard only for lawful purposes. You must possess the legal right, ownership, or authorized license to protect, format, or modify any code you submit to this application. You must not use this tool to package or disguise malicious software, exploit payloads, or unlawful computer intrusions.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{isBn ? '২. মেধাস্বত্ব ও মালিকানা' : '2. Ownership & Intellectual Property'}</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'CodeGuard-এ প্রসেস করা সমস্ত সোর্স কোড ও ডিজাইনের সম্পূর্ণ মালিকানা আপনার নিজের। আউটপুট কোডের ওপর MRS Engineers BD কোনো অধিকার দাবি করে না।'
              : 'You retain complete, unencumbered ownership of all intellectual property, source code, and assets you process with CodeGuard. MRS Engineers BD claims no rights, licenses, or royalties over transformed outputs.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isBn ? '৩. ব্যাকআপ সংরক্ষণের দায়িত্ব' : '3. Sole User Responsibility for Backups'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn ? (
              <>
                উচ্চ পর্যায়ের কোড সুরক্ষা আপনার লজিক নিরাপদ রাখতে গভীর রূপান্তর প্রয়োগ করে।{' '}
                <strong>মূল সোর্স ফাইলের ব্যাকআপ সংরক্ষণের দায়িত্ব সম্পূর্ণ আপনার।</strong> সুবিধার জন্য CodeGuard-এ "মূল ব্যাকআপ ডাউনলোড" বাটন ও ব্রাউজারে অটো-ব্যাকআপ রয়েছে, তবে কোনো ফাইল হারিয়ে গেলে MRS Engineers BD দায়ী থাকবে না।
              </>
            ) : (
              <>
                Strong protection options apply deep transformations designed to safeguard your source logic.{' '}
                <strong>You are solely responsible for maintaining backups of your original source files.</strong> CodeGuard provides a local &quot;Download Original Backup&quot; button and automatic browser backup storage for convenience, but MRS Engineers BD is not responsible for lost or overwritten files.
              </>
            )}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isBn ? '৪. সামঞ্জস্যতা যাচাই ও টেস্টিং' : '4. Transformation Compatibility & Testing'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'লাইভ ওয়েবসাইট বা ব্লগে পাবলিশ করার আগে অবশ্যই বিল্ট-ইন প্রিভিউ স্যান্ডবক্স অথবা টেস্ট সাইটে আপনার সুরক্ষিত কোড পরীক্ষা করে নেবেন—বিশেষ করে Domain Lock চালু করার সময়।'
              : 'Always verify protected HTML applications and Blogger XML templates using the built-in preview sandbox or a test blog before publishing live, especially when enabling strict Domain Lock rules.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isBn ? '৫. কোড রিস্টোরের সীমা ও সুবিধা' : '5. Restoration Scope'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'Restore Code ওয়ার্কস্পেস এনকোডেড স্ক্রিপ্ট ডিকোড, লুকানো স্টাইল ও লেআউট পুনর্গঠন, একই ব্রাউজারের লোকাল ভল্ট থেকে মূল কোড পুনরুদ্ধার এবং HTML ও Blogger XML পরিচ্ছন্নভাবে সাজাতে পারে। অন্য ডিভাইসে নন-রিভার্সিবল লক করা কোডের ক্ষেত্রে মূল ব্যাকআপ ফাইলের প্রয়োজন হতে পারে।'
              : 'The Restore Code workspace decodes common encoded wrappers, reconstructs hidden style and layout blocks, recovers matching source code saved in the same browser vault, and reformats HTML and Blogger XML cleanly. Non-reversible locked code created on other devices may require the original backup file.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>
              {isBn
                ? '৬. ওয়ারেন্টি ও দায়বদ্ধতার সীমাবদ্ধতা'
                : '6. Disclaimer of Warranties & Limitation of Liability'}
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isBn
              ? 'CodeGuard "AS IS" ও "AS AVAILABLE" ভিত্তিতে বিনামূল্যে প্রদান করা হচ্ছে। প্রযোজ্য আইন অনুযায়ী সর্বোচ্চ সীমা পর্যন্ত MRS Engineers BD কোনো প্রত্যক্ষ বা পরোক্ষ ক্ষতির দায়ভার গ্রহণ করে না।'
              : 'CodeGuard is provided on an "AS IS" and "AS AVAILABLE" basis, without warranty of any kind, express or implied. To the maximum extent permitted by applicable law, MRS Engineers BD and its contributors disclaim all warranties, including merchantability, fitness for a particular purpose, and non-infringement.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isBn ? '৭. যোগাযোগের তথ্য' : '7. Contact Information'}
          </h2>
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
