import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  UploadCloud,
  FileText,
  ChevronRight,
  Layers,
  BookOpen
} from 'lucide-react';
import type { ActiveTab, DocumentMetadata } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentMetadata[];
  activeDocument: DocumentMetadata | null;
  onSelectDocument: (doc: DocumentMetadata) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  documents,
  activeDocument,
  onSelectDocument,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & system stats',
    },
    {
      id: 'chat' as ActiveTab,
      label: 'AI Chat',
      icon: MessageSquare,
      description: 'Q&A with citations',
      badge: activeDocument ? '1 Active' : undefined,
    },
    {
      id: 'upload' as ActiveTab,
      label: 'Upload PDF',
      icon: UploadCloud,
      description: 'Embed & index files',
    },
    {
      id: 'documents' as ActiveTab,
      label: 'Document Library',
      icon: FileText,
      description: 'Manage indexed PDFs',
      count: documents.length,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-20 h-screen md:h-[calc(100vh-4rem)] w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Document Indicator & Quick Switcher */}
        <div className="px-4 py-3 border-t border-slate-100 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Context
            </span>
            <button
              onClick={() => handleNavClick('documents')}
              className="text-[11px] text-brand-600 hover:text-brand-700 font-medium cursor-pointer"
            >
              All files
            </button>
          </div>

          {activeDocument ? (
            <div className="p-3 rounded-xl bg-brand-50/60 border border-brand-200/60 text-slate-800">
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate" title={activeDocument.filename}>
                    {activeDocument.filename}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeDocument.total_pages} pages • {activeDocument.total_chunks || 0} chunks
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNavClick('chat')}
                className="mt-2.5 w-full py-1.5 px-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Chat with this doc</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-dashed border-slate-200 text-center">
              <BookOpen className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-600">No document selected</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Search queries will query all indexed documents or choose one below.
              </p>
            </div>
          )}

          {/* Quick list of documents */}
          {documents.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="px-3 text-[11px] font-medium text-slate-400">
                Recent Documents
              </p>
              {documents.slice(0, 4).map((doc) => (
                <button
                  key={doc.document_id}
                  onClick={() => {
                    onSelectDocument(doc);
                    handleNavClick('chat');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                    activeDocument?.document_id === doc.document_id
                      ? 'bg-slate-100 text-slate-900 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate pr-2">{doc.filename}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>OpenAI + ChromaDB RAG</span>
          </div>
        </div>
      </aside>
    </>
  );
};
