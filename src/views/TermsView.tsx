import React from 'react';
import { AlertTriangle, ShieldCheck, FileText, Scale } from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface TermsViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 text-slate-300">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Last Updated: October 2026 · MRS Engineers BD
        </p>
      </div>

      {/* Articles */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        
        {/* Article 1 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>1. Acceptable Use</span>
          </h2>
          <p className="text-slate-400">
            You agree to use CodeGaurd only for lawful purposes. You must possess the legal right, ownership, or authorized license to minify, obfuscate, format, or modify any code you submit to this application. You must not use this tool to package or disguise malicious software, exploit payloads, rootkits, phishing vectors, or unlawful computer intrusions.
          </p>
        </section>

        {/* Article 2 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>2. Ownership &amp; Intellectual Property</span>
          </h2>
          <p className="text-slate-400">
            You retain complete, unencumbered ownership of all intellectual property, source code, and assets you process with CodeGaurd. MRS Engineers BD claims no rights, licenses, or royalties over transformed outputs.
          </p>
        </section>

        {/* Article 3 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">
            3. Sole User Responsibility for Backups
          </h2>
          <p className="text-slate-400">
            Minification and identifier mangling are destructive transformations designed to discard comments, reformat spacing, and replace human-readable identifiers with non-reversible tokens. <strong>You are solely responsible for creating and maintaining pristine backups of your original source files.</strong> CodeGaurd provides a local &quot;Backup&quot; download utility, but under no circumstances is MRS Engineers BD responsible for lost, deleted, or unrecoverable source code.
          </p>
        </section>

        {/* Article 4 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">
            4. Transformation Limitations &amp; Compatibility
          </h2>
          <p className="text-slate-400">
            Due to the diverse variations of JavaScript runtimes, CSS vendor specifications, and third-party Blogger theme frameworks, certain aggressive transformations (such as string array rotation or container encapsulation) may conflict with specific browser configurations, Content Security Policies (CSP), or template tags. Users must test transformed code in a controlled test environment before deploying to live systems.
          </p>
        </section>

        {/* Article 5 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">
            5. Restoration Limitations
          </h2>
          <p className="text-slate-400">
            The Restore Code feature re-formats code structures and reverses documented, reversible transforms (such as hexadecimal escapes and string lookup tables). CodeGaurd does not and cannot restore original variable names that were irreversibly stripped or deduce deleted comments. No guarantee of original-source reproduction is made or implied.
          </p>
        </section>

        {/* Article 6 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>6. Disclaimer of Warranties &amp; Limitation of Liability</span>
          </h2>
          <p className="text-slate-400">
            CodeGaurd is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranty of any kind, express or implied. To the maximum extent permitted by applicable law, MRS Engineers BD and its contributors disclaim all warranties, including merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use this software.
          </p>
        </section>

        {/* Article 7 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">
            7. Contact Information
          </h2>
          <p className="text-slate-400">
            For technical inquiries or legal concerns regarding these Terms, contact:
          </p>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-xs">
            <div className="font-semibold text-slate-200">MRS Engineers BD</div>
            <div className="text-slate-400 mt-1">
              Email: <a href="mailto:mrs.engineers.bd26@gmail.com" className="text-cyan-400 hover:underline">mrs.engineers.bd26@gmail.com</a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
