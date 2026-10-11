import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ActivePage } from '../types/index.ts';

interface Props {
  currentPage: ActivePage;
  onBack: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const PageBackBar: React.FC<Props> = ({ currentPage, onBack }) => {
  if (currentPage === 'home') return null;

  return (
    <div className="w-full bg-slate-900/30 border-b border-slate-800/60 backdrop-blur-sm transition-colors py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all shadow-sm group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          title="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      </div>
    </div>
  );
};
