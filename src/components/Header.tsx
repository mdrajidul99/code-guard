import React, { useState } from 'react';
import { Shield, Moon, Sun, Menu, X } from 'lucide-react';
import { ActivePage } from '../types/index.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import codegaurdLogo from '../assets/logo.png';

interface Props {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onBack?: () => void;
}

export const Header: React.FC<Props> = ({ activePage, onNavigate, onBack }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);

  const navLinks: { id: ActivePage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'secure', label: 'Secure Code' },
    { id: 'restore', label: 'Restore Code' },
    { id: 'how-to-use', label: 'How to Use' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/90 light:bg-white/90 light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Zone 1: Brand Wordmark & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg p-1 group shrink-0"
            >
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-cyan-400 transition-colors">
                {!logoLoadError ? (
                  <img
                    src={codegaurdLogo}
                    alt="CodeGaurd Logo"
                    className="w-full h-full object-contain"
                    onError={() => setLogoLoadError(true)}
                  />
                ) : (
                  <Shield className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white dark:text-white light:text-slate-900 group-hover:text-cyan-400 transition-colors">
                  CodeGaurd
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`whitespace-nowrap transition-colors px-1 py-1 text-sm border-b-2 font-medium ${
                    isActive
                      ? 'text-cyan-400 border-cyan-400'
                      : 'text-slate-300 dark:text-slate-300 light:text-slate-600 border-transparent hover:text-cyan-300 hover:border-slate-600'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Theme Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-cyan-300 hover:border-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 light:border-slate-300 light:bg-slate-100 light:text-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activePage === link.id
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
