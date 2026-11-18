import React from 'react';
import { Bot, Menu, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  backendOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, backendOnline }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 tracking-tight text-base">DocuRAG</span>
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200 rounded">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Enterprise PDF Intelligence & RAG</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200/80 text-slate-600">
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="hidden sm:inline">Backend:</span>
          <span>{backendOnline ? 'Connected' : 'Connecting...'}</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 border-l border-slate-200 pl-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local Vector DB (ChromaDB)</span>
        </div>
      </div>
    </header>
  );
};
