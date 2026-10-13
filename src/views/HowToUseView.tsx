import React, { useState } from 'react';
import {
  FileCode,
  Code2,
  Layers,
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
      title: 'Protecting a Single HTML File',
      icon: <FileCode className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Open the Secure Code workspace and select your format (HTML, JavaScript, CSS, or Blogger XML) in the format dropdown.',
        'Paste your HTML document into the Source Code Input editor. You can also click "Sample" to test with our built-in markup sample.',
        'Click "Secure Code". The optimal minification and protection pipeline runs automatically.',
        'Click "Download HTML" or "Copy" to retrieve your finalized file. Test the output in a local browser to verify all links, forms, and scripts function as expected.',
      ],
      tip: 'Do not remove important metadata or script elements required for SEO or accessibility. CodeGaurd preserves essential meta tags and DOM attributes automatically.',
    },
    {
      id: 'javascript',
      title: 'Processing & Obfuscating JavaScript',
      icon: <Code2 className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Select "JavaScript" in the format dropdown inside the Secure Code workspace.',
        'Paste your client-side JavaScript code into the source editor.',
        'Click "Secure Code". CodeGaurd automatically applies identifier mangling, string lookup table rotation, and syntax compression.',
        'Copy or download the resulting .js file using the "JS" download button.',
        'Important: Test your code in your browser console or test suite to ensure execution behavior remains identical.',
      ],
      tip: 'Never place private API credentials, server database passwords, or payment processor private keys in client-side JavaScript files. Obfuscation is a deterrent, not encryption.',
    },
    {
      id: 'css',
      title: 'Minifying CSS Stylesheets',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Select "CSS" from the format dropdown.',
        'Paste your CSS rules, media queries, and variable declarations into the source editor.',
        'Click "Secure Code". CodeGaurd removes redundant whitespace and comments while preserving all CSS custom properties (--var: ...), @keyframes, and @media rules.',
        'Download the minified stylesheet using the "CSS" download button.',
      ],
      tip: 'Check that CSS variables and calc() operations remain intact. CodeGaurd strictly preserves calc() expressions and CSS custom property structures.',
    },
    {
      id: 'blogger',
      title: 'Processing Blogger XML Themes',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Crucial First Step: In your Blogger Dashboard, navigate to Theme -> Customize -> Backup and download your existing theme XML.',
        'In CodeGaurd, switch to the "Blogger XML" format.',
        'Paste your full Blogger XML theme file into the editor. You can also load the built-in sample.',
        'Click "Backup" to save another copy with a timestamp.',
        'CodeGaurd runs strict XML validation via DOMParser before performing transformations, verifying that all closing tags, namespaces (xmlns:b, xmlns:expr), and CDATA sections are valid.',
        'Click "Secure Code". The engine minifies styles within <b:skin><![CDATA[ ... ]]></b:skin> and trims outer template whitespace while protecting <b:widget>, <b:section>, and <b:includable> blocks.',
        'Download the finalized .xml file and upload it into your Blogger theme manager. Test your blog homepage and individual post layouts.',
      ],
      tip: 'Arbitrary Blogger themes may contain bespoke third-party plugins. Always retain a local backup so you can revert instantly if any widget expression is mismatched.',
    },
    {
      id: 'beautify',
      title: 'Beautifying & Formatting Code',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Navigate to the "Restore Code" workspace via the top navigation bar.',
        'Paste messy, minified, or compressed code into the input editor.',
        'Select the corresponding format from the format dropdown (HTML, JavaScript, CSS, or Blogger XML).',
        'Click "Beautify Code Only".',
        'CodeGaurd automatically applies uniform indentation, statement line breaks, and bracket hierarchy without altering any identifier names or tokens.',
      ],
      tip: 'Beautification does not modify code semantics. It restores clean readability to minified vendor libraries and compressed files.',
    },
    {
      id: 'restore',
      title: 'Restoring Supported Obfuscations',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Open the "Restore Code" workspace.',
        'Paste obfuscated code (e.g. code containing hex sequences like \\x68\\x65... or string array tables).',
        'Click "Restore Code".',
        'CodeGaurd automatically detects table structures, inlines referenced strings, converts hex escapes back to readable characters, and beautifies the final output.',
        'Review the Operations Applied log in the results header to see exactly how many tokens were decoded.',
      ],
      tip: 'Notice: If variable names were mangled to _0x1a2b, the original English variable names cannot be miraculously guessed because that information was permanently stripped during compilation.',
    },
    {
      id: 'export',
      title: 'Copying & Downloading Results',
      icon: <Download className="w-4 h-4 text-cyan-400" />,
      steps: [
        'Once code processing finishes in either tool, inspect the stats strip to check the byte size and compression percentage.',
        'Click "Copy" to immediately copy the entire output to your system clipboard.',
        'Click "TXT" to download as a universally readable .txt file.',
        'Click the native format button ("HTML", "JS", "CSS", or "XML") to save the file with the proper extension and MIME type.',
        'All downloads are generated locally via browser Blob URLs; no temporary files are retained or stored on any server.',
      ],
      tip: 'Never deploy newly transformed code directly into production without verifying its syntax and behavior on a test server.',
    },
  ];

  const activeGuide = guides.find((g) => g.id === activeTab) || guides[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          How to Use CodeGaurd
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Comprehensive step-by-step guides for protecting HTML, JavaScript, CSS, and Blogger XML themes, as well as restoring and beautifying code.
        </p>
      </div>

      {/* Guide Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        {guides.map((g) => {
          const isActive = activeTab === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveTab(g.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {g.icon}
              <span>{g.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Guide Content */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
            {activeGuide.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{activeGuide.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Follow these numbered steps for guaranteed results.</p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {activeGuide.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3.5 text-xs sm:text-sm text-slate-300">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed pt-0.5">{step}</p>
            </div>
          ))}
        </div>

        {/* Pro Tip Box */}
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-200 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-cyan-100">Engineering Recommendation:</span>
            <p className="text-cyan-200/90 leading-relaxed text-xs">{activeGuide.tip}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => onNavigate(activeGuide.id === 'restore' || activeGuide.id === 'beautify' ? 'restore' : 'secure')}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>Open {activeGuide.id === 'restore' || activeGuide.id === 'beautify' ? 'Restore Tool' : 'Secure Tool'}</span>
          </button>
        </div>
      </div>

      {/* Safety Reminder */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-300 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-200">Rule of Thumb: Maintain Backups </span>
          <p className="mt-0.5 text-amber-300/90">
            Never overwrite your only copy of unminified source code. Code minification and identifier mangling are destructive to human readability. Always preserve your clean source in secure offline backups or using the local Backup button.
          </p>
        </div>
      </div>
    </div>
  );
};
