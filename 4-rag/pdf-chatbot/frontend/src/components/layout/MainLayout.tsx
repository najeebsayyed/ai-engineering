import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import type { ActiveTab, DocumentMetadata } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  documents: DocumentMetadata[];
  activeDocument: DocumentMetadata | null;
  onSelectDocument: (doc: DocumentMetadata) => void;
  backendOnline: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  documents,
  activeDocument,
  onSelectDocument,
  backendOnline,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        backendOnline={backendOnline}
      />

      <div className="flex-1 flex w-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          documents={documents}
          activeDocument={activeDocument}
          onSelectDocument={onSelectDocument}
        />

        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
