import React from 'react';
import { UploadCloud, FileSearch, MessageSquareText, ArrowRight } from 'lucide-react';
import type { ActiveTab } from '../../types';

interface QuickStartGuideProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: '01',
      title: 'Upload your PDF',
      description:
        'Upload invoices, whitepapers, contracts, research papers, or user manuals up to 20 MB.',
      icon: UploadCloud,
      actionText: 'Upload File',
      actionTab: 'upload' as ActiveTab,
    },
    {
      step: '02',
      title: 'Automatic Indexing',
      description:
        'The backend extracts clean text, splits into contextual chunks, and generates vector embeddings with ChromaDB.',
      icon: FileSearch,
      actionText: 'View Library',
      actionTab: 'documents' as ActiveTab,
    },
    {
      step: '03',
      title: 'Chat with Precision',
      description:
        'Ask questions in plain English. Get answers grounded strictly in your document with verifiable page citations.',
      icon: MessageSquareText,
      actionText: 'Start Chatting',
      actionTab: 'chat' as ActiveTab,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Three simple steps to extract actionable intelligence from any PDF.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                    <Icon className="w-4 h-4 text-brand-600" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => onNavigate(item.actionTab)}
                className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-brand-700 hover:text-brand-800 transition-colors cursor-pointer"
              >
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
