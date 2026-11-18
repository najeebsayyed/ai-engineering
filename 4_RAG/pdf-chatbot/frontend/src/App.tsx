import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import type { ActiveTab, DocumentMetadata } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [documents] = useState<DocumentMetadata[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentMetadata | null>(null);
  const [backendOnline] = useState(true);

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
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Upload PDF</h2>
          <p className="text-sm text-slate-500">Upload interface coming right up.</p>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">AI Chat</h2>
          <p className="text-sm text-slate-500">Chat interface coming right up.</p>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Document Library</h2>
          <p className="text-sm text-slate-500">Document management coming right up.</p>
        </div>
      )}
    </MainLayout>
  );
}

export default App;
