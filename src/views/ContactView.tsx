import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Info } from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface ContactViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const ContactView: React.FC<ContactViewProps> = () => {
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
          Contact Engineering Team
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
          Connect directly with the developers behind CodeGuard for bug disclosures, feature requests, or Blogger XML theme compatibility reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 space-y-5 shadow-sm">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">Engineering Entity</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">MRS Engineers BD</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Specialized in client-side security tooling, browser utilities, and template optimization architectures.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Direct Email Address</div>
                <a
                  href={`mailto:${email}`}
                  className="text-sm font-semibold text-cyan-700 dark:text-cyan-400 hover:underline transition-colors flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="break-all">{email}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-300 font-semibold">
              <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>Response Time Expectation</span>
            </div>
            <p className="leading-relaxed">
              We review all inquiries and bug reports promptly. For Blogger XML or ES module edge cases, please include a minimal snippet to help reproduce the issue.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 space-y-5 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Launch Direct Email</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Configure your subject line below to launch your default email client with a verified recipient and topic header.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label htmlFor="cg-contact-topic" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Inquiry Topic
                </label>
                <select
                  id="cg-contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg px-3 py-2.5 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bug Report">Bug Report / Syntax Issue</option>
                  <option value="Blogger XML Compatibility">Blogger XML Compatibility</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Security Disclosure">Security Responsible Disclosure</option>
                </select>
              </div>

              <div>
                <label htmlFor="cg-contact-subject" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Optional Brief Context / Subject Detail
                </label>
                <input
                  id="cg-contact-subject"
                  type="text"
                  value={subjectDetails}
                  onChange={(e) => setSubjectDetails(e.target.value)}
                  placeholder="e.g. Script parsing edge case in Blogger theme"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg px-3 py-2.5 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <a
                  href={mailtoLink}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compose Email to {email}</span>
                </a>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Clicking the button above triggers your operating system&apos;s standard mail client (<code className="font-mono">mailto:</code>). CodeGuard never uses unverified mock forms.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-200 dark:border-cyan-800/40 bg-cyan-50 dark:bg-cyan-950/20 p-4 text-xs text-cyan-900 dark:text-cyan-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Community Verified:</strong> CodeGuard is free, transparent, and operates 100% locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
