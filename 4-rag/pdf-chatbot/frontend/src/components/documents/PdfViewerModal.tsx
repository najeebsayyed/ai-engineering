import React from 'react';
import { X, ExternalLink, FileText, Download } from 'lucide-react';
import { api } from '../../services/api';
import type { DocumentMetadata } from '../../types';

interface PdfViewerModalProps {
  document: DocumentMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  targetPage?: number | string | null;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  document,
  isOpen,
  onClose,
  targetPage,
}) => {
  if (!isOpen || !document) return null;

  const pdfUrl = `${api.getDocumentPdfUrl(document.document_id)}${
    targetPage ? `#page=${targetPage}` : ''
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
              <FileText className="w-4 h-4 text-brand-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs md:text-sm font-semibold text-slate-900 truncate max-w-md">
                {document.filename}
              </h3>
              {targetPage && (
                <p className="text-[11px] text-brand-600 font-medium">
                  Navigating to Page {targetPage}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={pdfUrl}
              download={document.filename}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-100 p-1">
          <iframe
            src={pdfUrl}
            title={document.filename}
            className="w-full h-full rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
