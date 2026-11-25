import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Globe,
  QrCode,
  Youtube,
  Facebook,
  Send,
  Github,
  ExternalLink,
} from 'lucide-react';
import { ActivePage } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import codeguardLogo from '../assets/logo.png';

interface Props {
  onNavigate: (page: ActivePage) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  const [logoLoadError, setLogoLoadError] = useState(false);
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const handleLink = (page: ActivePage) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ecosystemLinks = [
    {
      label: isBn ? 'অফিশিয়াল ওয়েবসাইট ও অ্যাপ হাব' : 'Official Website & App Hub',
      href: 'https://mrs-engineersbd.blogspot.com/',
      icon: <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />,
    },
    {
      label: 'QR Code Tools',
      href: 'https://qr-code-tools.2bd.net/',
      icon: <QrCode className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />,
    },
    {
      label: 'YouTube',
      href: 'https://youtube.com/@mrs-engineersbd',
      icon: <Youtube className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />,
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/p/MRS-Engineers-BD-61594304166361/',
      icon: <Facebook className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />,
    },
    {
      label: 'Telegram',
      href: 'https://t.me/mrsengbd',
      icon: <Send className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />,
    },
    {
      label: 'GitHub',
      href: 'https://github.com/mdrajidul99',
      icon: <Github className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />,
    },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Overview */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center overflow-hidden shrink-0">
                {!logoLoadError ? (
                  <img
                    src={codeguardLogo}
                    alt="CodeGuard Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={() => setLogoLoadError(true)}
                  />
                ) : (
                  <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                )}
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">CodeGuard</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isBn ? 'নির্মাতা ও পরিচালনায়: ' : 'Developed & Maintained by '}
              <a
                href="https://mrs-engineersbd.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-800 dark:text-slate-200 font-semibold hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors underline decoration-cyan-500/40 underline-offset-2"
              >
                MRS Engineers BD
              </a>
            </p>

            <div className="pt-1">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-500 mb-1">
                {isBn ? 'যোগাযোগের ইমেইল:' : 'Contact Email:'}
              </div>
              <a
                href="mailto:mrs.engineers.bd26@gmail.com"
                className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="break-all">mrs.engineers.bd26@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Core Tools */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
              {isBn ? 'টুলস ও সুবিধা' : 'Tools & Utilities'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('secure')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  {isBn ? 'কোড সুরক্ষা (HTML ও Blogger XML)' : 'Secure Code (HTML & Blogger XML)'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('restore')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  {isBn ? 'কোড রিস্টোর (ডিকোড ও সাজানো)' : 'Restore Code (Decode & Beautify)'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('how-to-use')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  {isBn ? 'ব্যবহারবিধি গাইড' : 'How to Use Guides'}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
              {isBn ? 'নীতিমালা ও শর্তাবলী' : 'Legal & Policy'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('privacy')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  {isBn ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('terms')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  {isBn ? 'শর্তাবলী' : 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('contact')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  {isBn ? 'ডেভেলপার যোগাযোগ' : 'Developer Contact'}
                </button>
              </li>
            </ul>
          </div>

          {/* MRS Engineers BD Ecosystem */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
              {isBn ? 'MRS Engineers BD ইকোসিস্টেম ও অফিশিয়াল লিংক' : 'MRS Engineers BD Ecosystem'}
            </h4>
            <ul className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              {ecosystemLinks.map((item) => (
                <li key={item.href + item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 text-center sm:text-left">
          <div>
            © 2026 MRS Engineers BD. All rights reserved.
          </div>
          <div>
            {isBn ? '১০০% ব্রাউজার-ভিত্তিক প্রসেসিং' : '100% Client-Side Browser Processing'}
          </div>
        </div>
      </div>
    </footer>
  );
};
