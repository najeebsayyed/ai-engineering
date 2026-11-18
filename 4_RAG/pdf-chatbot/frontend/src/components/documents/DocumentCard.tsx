import React from 'react';
import {
  FileText,
  Trash2,
  MessageSquare,
  ExternalLink,
  Clock
} from 'lucide-react';
import type { DocumentMetadata } from '../../types';

interface DocumentCardProps {
  document: DocumentMetadata;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onViewPdf: () => void;
  onChat: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isActive,
  onSelect,
  onDelete,
  onViewPdf,
  onChat,
}) => {
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formattedDate = document.uploaded_at
    ? new Date(document.uploaded_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
        isActive
          ? 'border-brand-500 ring-2 ring-brand-500/10 shadow-sm'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isActive
                ? 'bg-brand-50 border-brand-200 text-brand-600'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3
                className="text-sm font-semibold text-slate-900 truncate"
                title={document.filename}
              >
                {document.filename}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {isActive ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
              Active Context
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              Indexed
            </span>
          )}
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center my-3 bg-slate-50/50 rounded-xl">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Pages</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{document.total_pages}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Chunks</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{document.total_chunks || '—'}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Size</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{formatFileSize(document.file_size)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onViewPdf}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Inspect / Open PDF"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete Document & Vectors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isActive && (
            <button
              onClick={onSelect}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Select
            </button>
          )}

          <button
            onClick={onChat}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xs'
                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-2xs'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
