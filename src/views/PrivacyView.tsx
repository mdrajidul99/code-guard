import React from 'react';
import { ShieldCheck, Lock, Database, Mail } from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface PrivacyViewProps {
  onBack?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 text-slate-300">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Effective Date: October 2026 · Engineered by MRS Engineers BD
        </p>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>1. Zero Remote Transmission of Source Code</span>
          </h2>
          <p className="text-slate-400">
            When you paste HTML, CSS, JavaScript, or Blogger XML templates into the CodeGaurd workspace, the minification, syntax parsing, identifier mangling, and restoration algorithms execute entirely within your client browser environment. If you disconnect your internet connection after loading the application, all transformation tools will continue to operate with full functionality.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>2. Local Storage &amp; Cookie Usage</span>
          </h2>
          <p className="text-slate-400">
            CodeGaurd does not use advertising cookies, third-party tracking beacons, or marketing analytics. The only data persisted in your browser is:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>
              <strong className="text-slate-200">codegaurd_theme</strong>: A browser <code className="text-cyan-300">localStorage</code> item storing your preferred interface color scheme (<code className="text-cyan-300">&quot;dark&quot;</code> or <code className="text-cyan-300">&quot;light&quot;</code>).
            </li>
          </ul>
          <p className="text-slate-400">
            We do not store your source code in localStorage or IndexedDB. Once you refresh or close the tab, any code held in active memory is wiped immediately.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">
            3. Third-Party CDNs &amp; External Assets
          </h2>
          <p className="text-slate-400">
            To render the interface, CodeGaurd loads standard web fonts from Google Fonts (Plus Jakarta Sans &amp; JetBrains Mono) and the official branded application logo. No source code or identifiable user parameters are transmitted to these asset endpoints.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">
            4. User Rights &amp; Code Ownership
          </h2>
          <p className="text-slate-400">
            You retain 100% intellectual property ownership of all source code, templates, and scripts you process using CodeGaurd. MRS Engineers BD asserts zero copyright or licensing claims over code transformed or restored using this utility.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>5. Contact for Privacy Inquiries</span>
          </h2>
          <p className="text-slate-400">
            If you have questions regarding this privacy policy or our local processing architecture, you may reach the engineering team directly:
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
