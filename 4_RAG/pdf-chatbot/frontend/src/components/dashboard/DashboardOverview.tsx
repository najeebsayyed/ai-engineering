import React from 'react';
import {
  FileText,
  Database,
  Layers,
  Sparkles,
  UploadCloud,
  MessageSquare,
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { ActiveTab, DocumentMetadata } from '../../types';
import { QuickStartGuide } from './QuickStartGuide';

interface DashboardOverviewProps {
  documents: DocumentMetadata[];
  activeDocument: DocumentMetadata | null;
  onSelectDocument: (doc: DocumentMetadata) => void;
  onNavigate: (tab: ActiveTab) => void;
  backendOnline: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  onNavigate,
  backendOnline,
}) => {
  const totalPages = documents.reduce((acc, doc) => acc + (doc.total_pages || 0), 0);
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.total_chunks || 0), 0);

  const stats = [
    {
      label: 'Indexed Documents',
      value: documents.length.toString(),
      subtext: documents.length === 1 ? '1 active PDF' : `${documents.length} files available`,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Total Pages Processed',
      value: totalPages.toLocaleString(),
      subtext: 'Extracted with PyMuPDF',
      icon: Layers,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      label: 'Stored Vector Chunks',
      value: totalChunks.toLocaleString(),
      subtext: 'ChromaDB HNSW cosine space',
      icon: Database,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      label: 'RAG Model Pipeline',
      value: 'OpenAI GPT',
      subtext: 'Embeddings + Semantic Search',
      icon: Sparkles,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-7 md:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Production-Grade Document Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Ask Questions. Verify Citations. Understand Any PDF.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Upload your PDF documents to instantly parse text, chunk content with sliding windows,
            embed into high-dimensional vector space, and perform hallucination-resistant Q&A.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('upload')}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-xs md:text-sm flex items-center gap-2 transition-all shadow-sm shadow-brand-500/20 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New PDF</span>
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs md:text-sm flex items-center gap-2 backdrop-blur-xs border border-white/10 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Chat Interface</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow effect */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Backend connection warning if offline */}
      {!backendOnline && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900">Backend Server Offline or Connecting</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Make sure your FastAPI server is running on <code className="px-1 py-0.5 bg-amber-100 rounded">http://localhost:8000</code>.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Start Guide */}
      <QuickStartGuide onNavigate={onNavigate} />

      {/* Recent Activity / Document Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Recent Indexed Documents
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              PDFs stored in your local ChromaDB vector collection.
            </p>
          </div>
          <button
            onClick={() => onNavigate('documents')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({documents.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No documents indexed yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Upload your first PDF to generate vector embeddings and enable AI-powered semantic search.
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.slice(0, 5).map((doc) => {
              const isSelected = activeDocument?.document_id === doc.document_id;
              return (
                <div
                  key={doc.document_id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-3 -mx-3 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate" title={doc.filename}>
                          {doc.filename}
                        </p>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>{doc.total_pages} pages</span>
                        <span>•</span>
                        <span>{doc.total_chunks || 0} chunks</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectDocument(doc);
                        onNavigate('chat');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-slate-700 border border-slate-200/80 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
