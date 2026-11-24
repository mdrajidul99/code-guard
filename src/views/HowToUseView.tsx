import React, { useState } from 'react';
import {
  FileCode,
  Zap,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  Github,
} from 'lucide-react';
import { ActivePage } from '../types/index.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface Props {
  onNavigate: (page: ActivePage) => void;
  onBack?: () => void;
}

export const HowToUseView: React.FC<Props> = ({ onNavigate }) => {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<string>('blogger-github');

  const guides = isBn
    ? [
        {
          id: 'blogger-github',
          title: 'Blogger + GitHub (দুটি সাইট একসাথে)',
          icon: <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'আপনার যদি একটি Blogger সাইট (যেমন: myblog.blogspot.com) এবং একটি GitHub Pages সাইট (যেমন: username.github.io) একসাথে সংযুক্ত থাকে (যেমন: ব্লগারের ভেতরে গিটহাব অ্যাপ এম্বেড করা বা দুই ডোমেইনেই প্রজেক্ট চালানো), তবে প্রতিটি কোড তার নিজস্ব ফরম্যাটে আলাদাভাবে সিকিউর করতে হবে।',
            'প্রথমে GitHub-এর HTML/App ফাইলের জন্য "HTML (Website & App Code)" নির্বাচন করুন। এরপর Domain Lock বক্সে আপনার GitHub ডোমেইন এবং Blogger ডোমেইন—দুটোই লিখুন (যেমন: username.github.io এবং myblog.blogspot.com — প্রতিটির পর Enter বা কমা চাপুন)। যদি আপনার Custom Domain থাকে তবে সেটিও যুক্ত করুন।',
            'এরপর Blogger থিমের জন্য ফরম্যাট বদলে "Blogger XML (Theme & Widget Code)" নির্বাচন করুন। এখানেও Domain Lock বক্সে ব্লগার ও কাস্টম ডোমেইন যুক্ত করুন এবং "Allow Blogger Preview (www.blogger.com)" অপশনটি চালু রাখুন।',
            'দুটো আউটপুটই "Test & Run Output" দিয়ে আলাদাভাবে পরীক্ষা করে নিন এবং তারপর নিজ নিজ প্ল্যাটফর্মে (GitHub repo-তে index.html এবং Blogger Theme Editor-এ XML) সেভ করুন।',
          ],
          tip: 'যখন GitHub-এর কোনো অ্যাপ Blogger পেজে iframe বা লিংকের মাধ্যমে চলে, তখন Domain Lock-এ দুইটি ডোমেইনই রাখা জরুরি—নাহলে একটির ভেতর থেকে অন্যটি লোড হতে গেলে ডোমেইন লক আটকে দেবে।',
        },
        {
          id: 'blogger-only',
          title: 'শুধুমাত্র Blogger সাইট (XML থিম)',
          icon: <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'সতর্কতা হিসেবে প্রথমে আপনার Blogger Dashboard -> Theme -> Customize এর পাশের তীর -> Backup থেকে মূল XML থিমের একটি কপি ডাউনলোড করে রাখুন।',
            'CodeGuard-এর Secure Code ট্যাবে গিয়ে Select Format থেকে "Blogger XML (Theme & Widget Code)" নির্বাচন করুন এবং আপনার সম্পূর্ণ থিম বা উইজেট XML কোড পেস্ট করুন।',
            'Security Control Panel-এ আপনার প্রয়োজনমতো অপশন সেট করুন: Protection Strength (প্রস্তাবিত: Maximum), Hide CSS & Static HTML inside JS, Anti-Inspect & Anti-Copy এবং Domain Lock-এ আপনার ব্লগের ডোমেইন (যেমন: myblog.blogspot.com বা কাস্টম ডোমেইন) যোগ করুন।',
            '"Allow Blogger Preview (www.blogger.com)" অবশ্যই চালু রাখুন যেন ব্লগার ড্যাশবোর্ডের Layout/Preview এডিট করতে কোনো সমস্যা না হয়।',
            '"Secure Code (Encode)" বাটনে ক্লিক করুন। সবুজ "XML Validation Passed" ব্যানার নিশ্চিত হয়ে আউটপুট কপি বা .xml ডাউনলোড করে Blogger -> Theme -> Edit HTML-এ পেস্ট করে সেভ করুন।',
          ],
          tip: 'CodeGuard ব্লগারের সেকশন, উইজেট, পোস্ট লুপ, ডাইনামিক ট্যাগ এবং AdSense/Analytics কোড সম্পূর্ণ অক্ষত রেখে শুধুমাত্র থিমের ডিজাইন ও কাস্টম স্ক্রিপ্ট সুরক্ষিত করে—তাই ব্লগারে সেভ করতে কোনো XML এরর আসে না।',
        },
        {
          id: 'single-app',
          title: 'শুধুমাত্র সিঙ্গেল-ফাইল App কোড',
          icon: <FileCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'আপনার অ্যাপ যদি একটি সিঙ্গেল HTML ফাইলের মধ্যে তৈরি হয়ে থাকে (HTML + CSS + JavaScript একসাথে), তবে Select Format থেকে "HTML (Website & App Code)" নির্বাচন করুন।',
            'সম্পূর্ণ অ্যাপ কোডটি ইনপুট বক্সে পেস্ট করুন। আপনার <meta>, <title>, ওয়েব অ্যাপ ম্যানিফেস্ট, CDN লাইব্রেরি এবং অ্যাপের সব ইন্টারেক্টিভ ফাংশন সুরক্ষিত অবস্থাতেও স্বাভাবিক থাকবে।',
            'যদি অ্যাপটি নির্দিষ্ট একটি ওয়েবসাইটে হোস্ট করেন তবে Domain Lock-এ সেই ডোমেইনটি দিন; আর যদি অ্যাপটি অফলাইনে ফাইল হিসেবে বা একাধিক জায়গায় ব্যবহারের জন্য হয়, তবে Domain Lock বক্সটি খালি রাখুন।',
            'Protection Strength (Maximum), Hide CSS & Static HTML inside JS এবং Anti-Inspect & Anti-Copy চালু রেখে "Secure Code (Encode)" বাটনে ক্লিক করুন।',
            '"Test & Run Output" বাটনে ক্লিক করে অ্যাপটির সব বাটন, ফর্ম ও ফিচার কাজ করছে কিনা যাচাই করুন, তারপর Copy বা .html ফাইল হিসেবে ডাউনলোড করুন।',
          ],
          tip: 'অ্যাপের লগইন ফর্ম, সার্চ বক্স বা ইনপুট ফিল্ডে টাইপিং ও পেস্ট করতে Anti-Inspect কোনো বাধা দেয় না—শুধু অবাঞ্ছিত কোড কপি ও Inspect Element বন্ধ রাখে।',
        },
        {
          id: 'github-html',
          title: 'শুধুমাত্র GitHub সিঙ্গেল-ফাইল HTML',
          icon: <Github className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'GitHub Pages-এ হোস্ট করা সিঙ্গেল-ফাইল ওয়েবসাইটের (যেমন: index.html) জন্য Select Format থেকে "HTML (Website & App Code)" নির্বাচন করুন।',
            'আপনার GitHub রিপোজিটরির index.html ফাইলের সম্পূর্ণ কোড ইনপুট বক্সে পেস্ট করুন।',
            'Domain Lock বক্সে আপনার GitHub Pages ডোমেইন লিখুন (যেমন: username.github.io) এবং Enter চাপুন। যদি কাস্টম ডোমেইন যুক্ত থাকে তবে সেটিও যোগ করুন।',
            'প্রয়োজনীয় সুরক্ষা অপশন (Protection Strength: Maximum, Hide CSS & Static HTML inside JS, Anti-Inspect & Anti-Copy) নির্বাচন করে "Secure Code (Encode)" চাপুন।',
            'আউটপুট তৈরি হলে "Test & Run Output" দিয়ে সাইটের ডিজাইন ও লিংক ঠিক আছে কিনা দেখুন, এরপর .html ডাউনলোড করে বা কপি করে আপনার GitHub রিপোজিটরির index.html-এ রিপ্লেস ও Commit করুন।',
          ],
          tip: 'GitHub Pages আপডেট হওয়ার পর লাইভ সাইটে ডান-ক্লিক, F12 বা Ctrl+U দিয়ে সোর্স কোড দেখা বন্ধ থাকবে এবং অন্য কেউ আপনার HTML কপি করে নিজের সাইটে চালালে পেজটি কাজ করবে না।',
        },
        {
          id: 'restore',
          title: 'কোড রিস্টোর ও অটো-ব্যাকআপ',
          icon: <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'যখনই আপনি CodeGuard দিয়ে কোনো কোড সুরক্ষিত করেন, তখন মূল সোর্স কোডের একটি অটো-ব্যাকআপ আপনার ব্রাউজারে সেভ হয় এবং সাথে সাথে "Download Original Backup" বাটন পাওয়া যায়।',
            'Restore Code পেজে শুধুমাত্র দুটি ফরম্যাট রয়েছে: "HTML (ওয়েবসাইট ও অ্যাপ কোড)" এবং "Blogger XML (থিম ও উইজেট)"। আপনার কোড অনুযায়ী ফরম্যাট নির্বাচন করুন।',
            'একই ব্রাউজারে সিকিউর করা কোড (এমনকি ব্লগার থেকে view-source করা কোডও) Restore Code বক্সে দিয়ে "রিস্টোর ও ডিকোড করুন" চাপলে লোকাল ভল্ট থেকে হুবহু মূল কোড পুনরুদ্ধার হয়ে যাবে।',
            'এছাড়া সাধারণ এনকোডেড HTML/Blogger স্ক্রিপ্ট ডিকোড করতে, লুকানো স্টাইল ও লেআউট পুনর্গঠন করতে বা শুধু ইন্ডেন্টেশন সাজাতে "শুধু কোড সাজান (Beautify)" ব্যবহার করতে পারবেন।',
            'আউটপুট পাওয়ার পর "রিস্টোর করা আউটপুট চালিয়ে দেখুন" বাটনে ক্লিক করে সরাসরি প্রিভিউ দেখে নিশ্চিত হয়ে ডাউনলোড করুন।',
          ],
          tip: 'গুরুত্বপূর্ণ সব প্রজেক্টের মূল কোড নিজের ডিভাইস বা গুগল ড্রাইভে নিরাপদ রাখতে সবসময় "Download Original Backup" করে রাখা সবচেয়ে ভালো অভ্যাস।',
        },
      ]
    : [
        {
          id: 'blogger-github',
          title: 'Blogger + GitHub (Combined Setup)',
          icon: <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'If you run a Blogger site (e.g., myblog.blogspot.com) alongside a GitHub Pages site (e.g., username.github.io)—such as embedding a GitHub web app inside a Blogger page or sharing assets across both—secure each platform’s code using its matching format.',
            'First, select "HTML (Website & App Code)" for your GitHub file. Inside Domain Lock, add BOTH your GitHub domain and your Blogger domain (e.g., username.github.io and myblog.blogspot.com — press Enter or comma after each), plus any custom domain.',
            'Next, switch the format to "Blogger XML (Theme & Widget Code)" for your Blogger template. Add your Blogger/custom domains to Domain Lock and keep "Allow Blogger Preview (www.blogger.com)" enabled.',
            'Verify both outputs individually using "Test & Run Output", then save the HTML output into your GitHub repository (index.html) and the XML output into your Blogger Theme Editor.',
          ],
          tip: 'Whenever a GitHub app runs inside an iframe or link on your Blogger site, keeping BOTH domains in Domain Lock ensures the protected app loads smoothly for visitors without triggering a domain mismatch block.',
        },
        {
          id: 'blogger-only',
          title: 'Blogger Site Only (XML Theme)',
          icon: <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'As a best practice, first download a backup of your current theme from Blogger Dashboard -> Theme -> Customize dropdown -> Backup.',
            'Open CodeGuard Secure Code, select "Blogger XML (Theme & Widget Code)", and paste your complete Blogger XML theme or widget code.',
            'Configure your protection options: choose Protection Strength (Maximum recommended), enable Hide CSS & Static HTML inside JS and Anti-Inspect & Anti-Copy, and add your blog domain (e.g., myblog.blogspot.com) to Domain Lock.',
            'Keep "Allow Blogger Preview (www.blogger.com)" checked so your Blogger Dashboard Layout and Theme Preview continue working normally.',
            'Click "Secure Code (Encode)". Confirm the green "XML Validation Passed" banner, then copy or download the .xml file and save it in Blogger -> Theme -> Edit HTML.',
          ],
          tip: 'CodeGuard preserves Blogger sections, widgets, post loops, dynamic data tags, and AdSense/Analytics blocks untouched while protecting custom styles and scripts—preventing XML save errors.',
        },
        {
          id: 'single-app',
          title: 'Single-File App Code Only',
          icon: <FileCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'For standalone single-file web applications (HTML + CSS + JavaScript in one file), select "HTML (Website & App Code)" in the Secure Code workspace.',
            'Paste your full single-file app code into the editor. Meta tags, page titles, app manifests, external CDN libraries, and interactive app logic remain fully functional.',
            'If hosting on a specific domain, add that domain inside Domain Lock. If the single-file app is meant to run offline or across multiple arbitrary environments, leave Domain Lock empty.',
            'Enable Protection Strength (Maximum), Hide CSS & Static HTML inside JS, and Anti-Inspect & Anti-Copy, then click "Secure Code (Encode)".',
            'Click "Test & Run Output" to verify every button, form, and interactive feature in the preview sandbox, then copy or download the .html file.',
          ],
          tip: 'Interactive form inputs, search bars, and text areas remain completely usable for visitors even when Anti-Inspect & Anti-Copy is turned on.',
        },
        {
          id: 'github-html',
          title: 'GitHub Single-File HTML Website',
          icon: <Github className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'For a single-file HTML website hosted on GitHub Pages (such as index.html), choose "HTML (Website & App Code)" in Secure Code.',
            'Paste the complete contents of your GitHub repository’s index.html file into the source editor.',
            'Enter your GitHub Pages domain (e.g., username.github.io) into Domain Lock and press Enter. Add your custom domain too if one is connected to GitHub Pages.',
            'Enable Maximum Protection Strength, Hide CSS & Static HTML inside JS, and Anti-Inspect & Anti-Copy, then click "Secure Code (Encode)".',
            'Test the result with "Test & Run Output", then download the .html file (or copy it) to replace index.html in your GitHub repository and commit your changes.',
          ],
          tip: 'Once deployed to GitHub Pages, casual view-source/inspect shortcuts stay blocked and anyone copying your hosted HTML onto an unauthorized domain will be blocked automatically.',
        },
        {
          id: 'restore',
          title: 'Restore Code & Local Backups',
          icon: <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          steps: [
            'Every time you secure code in CodeGuard, a local backup of your original code is saved automatically inside your browser alongside the "Download Original Backup" button.',
            'In Restore Code, select between the two supported formats: "HTML (Website & App)" or "Blogger XML".',
            'If you paste code secured in this same browser (even live view-source output from Blogger), clicking "Restore & Decode" automatically recovers your exact original code from your private browser vault.',
            'Restore Code also decodes common encoded wrappers, reconstructs hidden style and layout blocks cleanly, and offers "Beautify Code Only" to format messy HTML or Blogger XML.',
            'Use "Test & Run Restored Output" to verify your restored code live before downloading.',
          ],
          tip: 'Always keep a copy via "Download Original Backup" on your computer or cloud drive for long-term project safety.',
        },
      ];

  const currentGuide = guides.find((g) => g.id === activeTab) || guides[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isBn ? 'CodeGuard ব্যবহারের সম্পূর্ণ নিয়মাবলী' : 'How to Use CodeGuard'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isBn
            ? 'Blogger ও GitHub একসাথে, শুধুমাত্র Blogger থিম, সিঙ্গেল-ফাইল App, GitHub HTML ওয়েবসাইট এবং Restore/Backup ব্যবহারের বর্তমান নিয়ম ও নির্দেশিকা।'
            : 'Complete step-by-step guide for Blogger + GitHub combined sites, Blogger-only XML themes, single-file Apps, GitHub HTML sites, and Restore/Backup.'}
        </p>
      </div>

      {/* Guide Tabs */}
      <div className="flex justify-center flex-wrap gap-2 sm:gap-3 p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        {guides.map((guide) => (
          <button
            key={guide.id}
            type="button"
            onClick={() => setActiveTab(guide.id)}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === guide.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800/60'
            }`}
          >
            {guide.icon}
            <span>{guide.title}</span>
          </button>
        ))}
      </div>

      {/* Active Guide Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center shrink-0">
            {currentGuide.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentGuide.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
                ? 'সর্বোচ্চ নিরাপত্তা ও ত্রুটিমুক্ত ফলাফলের জন্য নিচের ধাপগুলো অনুসরণ করুন।'
                : 'Follow these updated guidelines for maximum protection and error-free deployment.'}
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            {isBn ? 'অনুসরণীয় ধাপসমূহ' : 'Execution Steps'}
          </h3>
          <ol className="space-y-4">
            {currentGuide.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-cyan-700 dark:text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Quick Domain Lock Rules Reference */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>{isBn ? 'ডোমেইন লক ও সুরক্ষার সাধারণ নিয়ম' : 'General Domain Lock & Protection Rules'}</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {isBn
              ? 'Domain Lock-এ শুধু মূল ডোমেইন লিখুন (যেমন: example.blogspot.com বা user.github.io); https:// বা শেষের / দেওয়ার দরকার নেই, সিস্টেম নিজেই পরিষ্কার করে নেয়। আপনার নিজের টেস্ট প্রিভিউ সবসময় সচল থাকলেও কপি/ডাউনলোড করা কোডে Domain Lock শতভাগ কার্যকর থাকবে।'
              : 'Enter only hostnames in Domain Lock (e.g., example.blogspot.com or user.github.io); any accidental https:// or trailing / is cleaned automatically. Your built-in Test & Run preview works safely while the exported Copy/Download output keeps Domain Lock 100% enforced.'}
          </p>
        </div>

        {/* Tip Callout */}
        <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-950 dark:text-cyan-200 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-cyan-900 dark:text-cyan-100">
              {isBn ? 'গুরুত্বপূর্ণ পরামর্শ:' : 'Helpful Tip:'}
            </span>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">{currentGuide.tip}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate(activeTab === 'restore' ? 'restore' : 'secure')}
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {activeTab === 'restore'
              ? isBn
                ? 'রিস্টোর ওয়ার্কস্পেস খুলুন'
                : 'Open Restore Workspace'
              : isBn
                ? 'সিকিউর ওয়ার্কস্পেস খুলুন'
                : 'Open Secure Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
};
