import React, { useState } from 'react';
import { Shield, Mail } from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface Props {
  onNavigate: (page: ActivePage) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  const [logoLoadError, setLogoLoadError] = useState(false);

  const handleLink = (page: ActivePage) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Overview */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center overflow-hidden shrink-0">
                {!logoLoadError ? (
                  <img
                    src="https://pxdrop.online/raw/db4t4h281qec73f6ose0"
                    alt="CodeGaurd Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={() => setLogoLoadError(true)}
                  />
                ) : (
                  <Shield className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CodeGaurd</span>
            </div>
            <div className="text-xs text-slate-500">
              Developed by <span className="text-slate-300 font-medium">MRS Engineers BD</span>
            </div>
          </div>

          {/* Core Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Tools & Utilities</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleLink('secure')} className="hover:text-cyan-400 transition-colors">
                  Secure Code (Minify & Obfuscate)
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('restore')} className="hover:text-cyan-400 transition-colors">
                  Restore Code (Format & Unpack)
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('how-to-use')} className="hover:text-cyan-400 transition-colors">
                  Step-by-Step Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Legal & Policy</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleLink('privacy')} className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('terms')} className="hover:text-cyan-400 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('contact')} className="hover:text-cyan-400 transition-colors">
                  Developer Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Connect</h4>
            <div className="space-y-2 text-xs">
              <a
                href="mailto:mrs.engineers.bd26@gmail.com"
                className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">mrs.engineers.bd26@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © {new Date().getFullYear()} CodeGaurd. Engineered by MRS Engineers BD. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
