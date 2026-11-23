import React from 'react';
import { ShieldCheck, FileText, Scale } from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface TermsViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const TermsView: React.FC<TermsViewProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          MRS Engineers BD · Client-Side Utility Terms
        </p>
      </div>

      {/* Articles */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>1. Acceptable Use</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You agree to use CodeGuard only for lawful purposes. You must possess the legal right, ownership, or authorized license to minify, obfuscate, format, or modify any code you submit to this application. You must not use this tool to package or disguise malicious software, exploit payloads, phishing kits, or unlawful computer intrusions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>2. Ownership &amp; Intellectual Property</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            You retain complete, unencumbered ownership of all intellectual property, source code, and assets you process with CodeGuard. MRS Engineers BD claims no rights, licenses, or royalties over transformed outputs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            3. Sole User Responsibility for Backups
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            RC4 string encryption, control flow flattening, and identifier mangling are intentionally one-way transformations designed to protect source logic. <strong>You are solely responsible for creating and maintaining pristine backups of your original source files.</strong> CodeGuard provides a local &quot;Download Original Backup&quot; button and stores your 5 most recent inputs in browser storage for convenience, but MRS Engineers BD is not responsible for lost, overwritten, or unrecoverable source code.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            4. Transformation Compatibility &amp; Testing
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Always verify obfuscated HTML applications and Blogger XML templates in the Live Execution Sandbox and/or a staging Blogger blog before deploying to production, especially when enabling strict Domain Lock or Content Security Policies (CSP).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            5. Restoration Limitations
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            The Restore Code feature reformats code with <code className="font-mono">js-beautify</code> and decodes reversible Base64, hexadecimal (<code className="font-mono">\xHH</code>), unicode (<code className="font-mono">\uHHHH</code>), and <code className="font-mono">unescape</code> payloads. CodeGuard cannot reverse one-way RC4, control flow flattening, or self-defending obfuscation back into the original readable source code.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>6. Disclaimer of Warranties &amp; Limitation of Liability</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            CodeGuard is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranty of any kind, express or implied. To the maximum extent permitted by applicable law, MRS Engineers BD and its contributors disclaim all warranties, including merchantability, fitness for a particular purpose, and non-infringement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            7. Contact Information
          </h2>
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
