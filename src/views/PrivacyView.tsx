import React from 'react';
import { Lock, Database, Mail } from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface PrivacyViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Engineered by MRS Engineers BD · 100% Client-Side Processing
        </p>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>1. Zero Remote Transmission of Source Code</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            When you paste HTML, CSS, JavaScript, or Blogger XML templates into the CodeGuard workspace, every CSS minification pass, Web Worker obfuscation job, XML validation check, and js-beautify pass runs strictly inside your own browser. No source code is ever sent to any backend server.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>2. Local Browser Storage Usage</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            CodeGuard does not use advertising cookies, tracking pixels, or analytics telemetry. The only data stored locally in your browser&apos;s <code className="font-mono text-cyan-700 dark:text-cyan-300">localStorage</code> is:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-900 dark:text-slate-200">codeguard_theme</strong>: Stores your preferred color theme (<code className="font-mono text-cyan-700 dark:text-cyan-300">&quot;dark&quot;</code> or <code className="font-mono text-cyan-700 dark:text-cyan-300">&quot;light&quot;</code>).
            </li>
            <li>
              <strong className="text-slate-900 dark:text-slate-200">codeguard_backups_v1</strong>: Stores up to your last 5 original source inputs locally so you can recover or download your un-obfuscated source at any time. You can delete these backups in one click from the Backups panel.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            3. Static Assets &amp; Fonts
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            CodeGuard loads web typography from Google Fonts (Plus Jakarta Sans &amp; JetBrains Mono). Application scripts and Web Worker obfuscation libraries are bundled directly inside the static client build with zero external API calls during code processing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            4. User Rights &amp; Code Ownership
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You retain 100% intellectual property ownership of all source code, templates, and scripts you process using CodeGuard. MRS Engineers BD asserts zero copyright or licensing claims over transformed outputs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>5. Contact for Privacy Inquiries</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            If you have questions regarding this privacy policy or our local Web Worker architecture, reach the engineering team directly:
          </p>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-200">MRS Engineers BD</div>
            <div className="text-slate-600 dark:text-slate-400 mt-1">
              Email:{' '}
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
