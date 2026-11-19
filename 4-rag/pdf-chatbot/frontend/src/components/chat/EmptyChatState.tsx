import React from 'react';
import { Bot, Sparkles, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import type { DocumentMetadata } from '../../types';

interface EmptyChatStateProps {
  activeDocument: DocumentMetadata | null;
  onSelectPrompt: (prompt: string) => void;
  onOpenUpload: () => void;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({
  activeDocument,
  onSelectPrompt,
  onOpenUpload,
}) => {
  const samplePrompts = activeDocument
    ? [
        `What are the key takeaways from ${activeDocument.filename}?`,
        'Summarize the main sections and conclusions in this document.',
        'List any dates, deadlines, or monetary figures mentioned.',
        'What specific recommendations or next steps are outlined?',
      ]
    : [
        'What are the main topics discussed across the indexed PDFs?',
        'Summarize the key findings from the uploaded documents.',
        'Compare the methodologies or conclusions in these documents.',
        'What are the most recent dates or actions referenced?',
      ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-xl mx-auto space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <Bot className="w-8 h-8" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs border border-slate-100">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
          {activeDocument ? (
            <span>Chatting with <span className="text-brand-600">{activeDocument.filename}</span></span>
          ) : (
            <span>What would you like to know?</span>
          )}
        </h2>
        <p className="text-xs md:text-sm text-slate-500 max-w-md leading-relaxed">
          {activeDocument
            ? `Ask any question. Answers are retrieved from ${activeDocument.total_pages} pages and cited with verifiable page numbers.`
            : 'No specific document selected. Queries will search across all indexed documents in your ChromaDB collection.'}
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="w-full space-y-2 text-left">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
          <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
          <span>Suggested Questions</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(prompt)}
              className="w-full text-left p-3 rounded-xl bg-white hover:bg-brand-50/50 border border-slate-200/80 hover:border-brand-300 text-xs text-slate-700 hover:text-brand-900 shadow-2xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate pr-2 font-medium">{prompt}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {!activeDocument && (
        <div className="pt-2">
          <button
            onClick={onOpenUpload}
            className="text-xs text-slate-500 hover:text-slate-800 underline inline-flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload a new PDF to get started</span>
          </button>
        </div>
      )}
    </div>
  );
};
