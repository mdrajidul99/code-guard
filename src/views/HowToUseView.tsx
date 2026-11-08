import React, { useState } from 'react';
import {
  FileCode,
  Zap,
  Sparkles,
  Download,
  ShieldAlert,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface Props {
  onNavigate: (page: ActivePage) => void;
  onBack?: () => void;
}

export const HowToUseView: React.FC<Props> = ({ onNavigate, onBack }) => {
  const [activeTab, setActiveTab] = useState<string>('html');

  const guides = [
    {
      id: 'html',
      title: 'Protecting HTML, Website & App Code',
      icon: <FileCode className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Open the Secure Code workspace and select "HTML (Website & App Code)" in the format selector.',
        'Paste your HTML document, app snippet, or widget into the input editor. You can also click "Sample" to load realistic markup.',
        'Click "Secure Code (Encode)". CodeGaurd instantly encodes your code into a self-executing, non-destructive runner.',
        'Click "Test & Run Output" to verify that your code runs cleanly in the live sandbox.',
        'Copy or download the output. Paste it directly into your website, app, or widget—it will execute smoothly without wiping or breaking the parent page.',
      ],
      tip: 'The output hides all raw HTML tags from "View Source" (Ctrl+U) while remaining 100% executable in all modern web browsers.',
    },
    {
      id: 'blogger',
      title: 'Securing Blogger XML Themes & Widgets',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Recommended First Step: In your Blogger Dashboard, go to Theme -> Backup and save a copy of your theme.',
        'In CodeGaurd, select "Blogger XML (Theme & Widget Code)".',
        'Paste your full Blogger XML theme or widget into the editor.',
        'Click "Secure Code (Encode)".',
        'CodeGaurd preserves all Blogger tags (<b:includable>, <b:widget>, <b:section>, <b:skin>, <data:...>) without error, while encoding custom JavaScript into Blogger-compliant CDATA blocks.',
        'Copy or download the output and paste it into Blogger Theme Editor (Theme -> Edit HTML) and click Save. It saves and publishes with zero XML errors!',
      ],
      tip: 'CodeGaurd is specially built to never corrupt <b:includable> or other Blogger XML tags. All tags remain perfectly balanced.',
    },
    {
      id: 'restore',
      title: 'Restoring & Decoding Encoded Code',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Open the "Restore Code" workspace from the navigation bar.',
        'Select your format: HTML or Blogger XML.',
        'Paste the encoded code into the editor.',
        'Click "Restore Code (Decode)".',
        'CodeGaurd automatically detects the encoded payload, unpacks the original source, and cleans up the indentation with js-beautify.',
        'Copy your restored, clean original code back into your editor.',
      ],
      tip: 'You can also click "Beautify Code Only" if you just want to reformat messy or compressed markup.',
    },
  ];

  const currentGuide = guides.find((g) => g.id === activeTab) || guides[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-10">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-8 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How to Use CodeGaurd
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Step-by-step guides for protecting HTML website and app code, securing Blogger XML themes without syntax errors, and decoding your files.
        </p>
      </div>

      {/* Guide Tabs */}
      <div className="flex justify-center flex-wrap gap-2 sm:gap-3 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        {guides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setActiveTab(guide.id)}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === guide.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {guide.icon}
            <span>{guide.title}</span>
          </button>
        ))}
      </div>

      {/* Active Guide Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 space-y-8 shadow-sm animate-in fade-in">
        
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            {currentGuide.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {currentGuide.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Follow these recommended steps for optimal security and reliability.
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Execution Steps
          </h3>
          <ol className="space-y-4">
            {currentGuide.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-4 text-xs sm:text-sm text-slate-300">
                <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Pro Tip Callout */}
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-cyan-100">Security Recommendation:</span>
            <p className="leading-relaxed text-slate-300">{currentGuide.tip}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onNavigate(activeTab === 'restore' ? 'restore' : 'secure')}
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {activeTab === 'restore' ? 'Open Restore Workspace' : 'Open Secure Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
};
