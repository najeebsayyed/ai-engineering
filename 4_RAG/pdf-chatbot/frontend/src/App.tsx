import { useEffect, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { UploadSection } from './components/upload/UploadSection';
import { DocumentList } from './components/documents/DocumentList';
import { api } from './services/api';
import type { ActiveTab, DocumentMetadata } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentMetadata | null>(null);
  const [backendOnline, setBackendOnline] = useState(true);

  // Initial load of documents & health check
  useEffect(() => {
    let mounted = true;

    const checkServerAndDocs = async () => {
      try {
        await api.checkHealth();
        if (mounted) setBackendOnline(true);
        const docs = await api.listDocuments();
        if (mounted) {
          setDocuments(docs);
          if (docs.length > 0 && !activeDocument) {
            setActiveDocument(docs[0]);
          }
        }
      } catch {
        if (mounted) setBackendOnline(false);
      }
    };

    checkServerAndDocs();
    const interval = setInterval(checkServerAndDocs, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleUploadSuccess = (newDoc: DocumentMetadata) => {
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.document_id !== newDoc.document_id)]);
    setActiveDocument(newDoc);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
    if (activeDocument?.document_id === docId) {
      const remaining = documents.filter((d) => d.document_id !== docId);
      setActiveDocument(remaining.length > 0 ? remaining[0] : null);
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      documents={documents}
      activeDocument={activeDocument}
      onSelectDocument={(doc) => setActiveDocument(doc)}
      backendOnline={backendOnline}
    >
      {activeTab === 'dashboard' && (
        <DashboardOverview
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={(doc) => {
            setActiveDocument(doc);
            setActiveTab('chat');
          }}
          onNavigate={(tab) => setActiveTab(tab)}
          backendOnline={backendOnline}
        />
      )}

      {activeTab === 'upload' && (
        <UploadSection
          onUploadSuccess={handleUploadSuccess}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'documents' && (
        <DocumentList
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={(doc) => setActiveDocument(doc)}
          onDeleteDocument={handleDeleteDocument}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'chat' && (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">AI Chat</h2>
          <p className="text-sm text-slate-500">Chat interface coming right up.</p>
        </div>
      )}
    </MainLayout>
  );
}

export default App;
