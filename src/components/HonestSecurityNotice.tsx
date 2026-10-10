import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const HonestSecurityNotice: React.FC<Props> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-200 text-xs leading-relaxed">
        <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
        <p>
          <strong>Security Notice:</strong> CodeGaurd helps make supported source code harder to read and reuse casually. Browser-delivered HTML, CSS, and JavaScript can still be inspected. No client-side transformation guarantees complete secrecy.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 text-slate-300 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm">
          <h4 className="font-semibold text-slate-100 flex items-center gap-2">
            Code Protection Integrity Notice
          </h4>
          <p className="text-slate-300 leading-relaxed">
            CodeGaurd helps make supported source code harder to read and reuse casually. Browser-delivered HTML, CSS, and JavaScript can still be inspected. No client-side transformation guarantees complete secrecy.
          </p>
          <div className="pt-1 text-slate-400 text-xs space-y-1">
            <p>
              • <strong>Client-side reality:</strong> Web browsers must execute your code to render it. Any motivated analyst can open Developer Tools, inspect network packets, or format output.
            </p>
            <p>
              • <strong>Backend recommendation:</strong> Never embed private API secret keys, database credentials, or proprietary server business rules inside client-side files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
