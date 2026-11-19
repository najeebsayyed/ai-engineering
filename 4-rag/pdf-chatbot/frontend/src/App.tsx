import { useEffect, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { UploadSection } from './components/upload/UploadSection';
import { DocumentList } from './components/documents/DocumentList';
import { ChatInterface } from './components/chat/ChatInterface';
import { ToastContainer } from './components/common/Toast';
import type { ToastItem } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { api } from './services/api';
import type { ActiveTab, DocumentMetadata } from './types';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentMetadata | null>(null);
  const [backendOnline, setBackendOnline] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load of documents & health check
  useEffect(() => {
    let mounted = true;

    const checkServerAndDocs = async () => {
      try {
        await api.checkHealth();
        if (mounted && !backendOnline) {
          setBackendOnline(true);
          addToast('Connected to FastAPI backend.', 'success');
        }
        const docs = await api.listDocuments();
        if (mounted) {
          setDocuments(docs);
          if (docs.length > 0 && !activeDocument) {
            setActiveDocument(docs[0]);
          }
        }
      } catch {
        if (mounted) {
          setBackendOnline(false);
        }
      }
    };

    checkServerAndDocs();
    const interval = setInterval(checkServerAndDocs, 8000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [backendOnline, activeDocument]);

  const handleUploadSuccess = (newDoc: DocumentMetadata) => {
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.document_id !== newDoc.document_id)]);
    setActiveDocument(newDoc);
    addToast(`"${newDoc.filename}" uploaded and indexed successfully.`, 'success');
  };

  const handleDeleteDocument = (docId: string) => {
    const deleted = documents.find((d) => d.document_id === docId);
    setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
    if (activeDocument?.document_id === docId) {
      const remaining = documents.filter((d) => d.document_id !== docId);
      setActiveDocument(remaining.length > 0 ? remaining[0] : null);
    }
    if (deleted) {
      addToast(`Deleted "${deleted.filename}" and its vector records.`, 'info');
    }
  };

  const handleSelectDocument = (doc: DocumentMetadata | null) => {
    setActiveDocument(doc);
    if (doc) {
      addToast(`Switched active context to "${doc.filename}".`, 'info');
    } else {
      addToast('Switched to global search across all documents.', 'info');
    }
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      documents={documents}
      activeDocument={activeDocument}
      onSelectDocument={handleSelectDocument}
      backendOnline={backendOnline}
    >
      {activeTab === 'dashboard' && (
        <DashboardOverview
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={(doc) => {
            handleSelectDocument(doc);
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
          onSelectDocument={handleSelectDocument}
          onDeleteDocument={handleDeleteDocument}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'chat' && (
        <ChatInterface
          activeDocument={activeDocument}
          onSelectDocument={handleSelectDocument}
          onNavigate={(tab) => setActiveTab(tab)}
          documents={documents}
          backendOnline={backendOnline}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </MainLayout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
