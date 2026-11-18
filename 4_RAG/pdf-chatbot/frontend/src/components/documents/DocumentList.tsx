import React, { useState } from 'react';
import {
  FileText,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { PdfViewerModal } from './PdfViewerModal';
import { api } from '../../services/api';
import type { ActiveTab, DocumentMetadata } from '../../types';

interface DocumentListProps {
  documents: DocumentMetadata[];
  activeDocument: DocumentMetadata | null;
  onSelectDocument: (doc: DocumentMetadata) => void;
  onDeleteDocument: (docId: string) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  onDeleteDocument,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [docToDelete, setDocToDelete] = useState<DocumentMetadata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [docToView, setDocToView] = useState<DocumentMetadata | null>(null);
  const [actionNotification, setActionNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    setActionNotification(null);

    try {
      await api.deleteDocument(docToDelete.document_id);
      onDeleteDocument(docToDelete.document_id);
      setActionNotification({
        type: 'success',
        message: `Successfully deleted "${docToDelete.filename}" and cleaned vector records.`,
      });
      setDocToDelete(null);
    } catch (err: unknown) {
      setActionNotification({
        type: 'error',
        message: (err as Error)?.message || 'Failed to delete document. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Document Library
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Browse and manage all PDFs indexed in your local ChromaDB vector store.
          </p>
        </div>

        <button
          onClick={() => onNavigate('upload')}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload PDF</span>
        </button>
      </div>

      {/* Notifications */}
      {actionNotification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
            actionNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionNotification.message}</span>
          </div>
          <button
            onClick={() => setActionNotification(null)}
            className="text-[11px] font-medium underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      {documents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
            />
          </div>

          <div className="text-xs text-slate-500 px-2 shrink-0">
            Showing <span className="font-semibold text-slate-800">{filteredDocs.length}</span> of {documents.length} files
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Your document library is empty
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            Upload PDF files to start generating vector embeddings and querying them using AI.
          </p>
          <button
            onClick={() => onNavigate('upload')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-brand-400" />
            <span>Upload your first PDF</span>
          </button>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-xs text-slate-500">
            No documents matched your search query "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.document_id}
              document={doc}
              isActive={activeDocument?.document_id === doc.document_id}
              onSelect={() => onSelectDocument(doc)}
              onDelete={() => setDocToDelete(doc)}
              onViewPdf={() => setDocToView(doc)}
              onChat={() => {
                onSelectDocument(doc);
                onNavigate('chat');
              }}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        document={docToDelete}
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* PDF Viewer / Inspector Modal */}
      <PdfViewerModal
        document={docToView}
        isOpen={!!docToView}
        onClose={() => setDocToView(null)}
      />
    </div>
  );
};
