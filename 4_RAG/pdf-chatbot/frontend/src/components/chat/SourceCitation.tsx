import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-react';
import type { SourceCitationData } from '../../types';

interface SourceCitationProps {
  sources: SourceCitationData[];
  onInspectSource?: (source: SourceCitationData) => void;
}

export const SourceCitation: React.FC<SourceCitationProps> = ({
  sources,
  onInspectSource,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <BookOpen className="w-3.5 h-3.5 text-brand-600" />
        <span>Retrieved Sources ({sources.length})</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sources.map((src, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all text-xs ${
                isExpanded
                  ? 'bg-brand-50/60 border-brand-300 w-full p-3 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 inline-flex flex-col'
              }`}
            >
              <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="flex items-center gap-1.5 font-medium text-slate-800 hover:text-brand-700 transition-colors cursor-pointer text-left"
                >
                  <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-800 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[150px] sm:max-w-[200px]" title={src.filename}>
                    {src.filename}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    • p.{src.page_number}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {onInspectSource && (
                  <button
                    type="button"
                    onClick={() => onInspectSource(src)}
                    className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-white transition-colors cursor-pointer"
                    title={`Open PDF at page ${src.page_number}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-brand-200/60 text-xs text-slate-700 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{src.source || `Source ${idx + 1}`}</span>
                    <span>Chunk: {src.chunk_id || 'N/A'}</span>
                  </div>
                  {src.text ? (
                    <blockquote className="bg-white/90 p-2.5 rounded-lg border border-brand-200/50 italic text-slate-700 text-xs leading-relaxed">
                      "{src.text}"
                    </blockquote>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Context chunk retrieved for answering from page {src.page_number}.
                    </p>
                  )}
                  {onInspectSource && (
                    <button
                      type="button"
                      onClick={() => onInspectSource(src)}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inspect page {src.page_number} in document viewer</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
