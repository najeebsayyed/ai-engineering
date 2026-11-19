import React, { useState, useEffect } from 'react';
import { Menu, GraduationCap } from 'lucide-react';
import type { ActivePage, HealthResponse } from './types';
import { apiService } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Summarize } from './pages/Summarize';
import { Explain } from './pages/Explain';
import { Quiz } from './pages/Quiz';
import { Flashcards } from './pages/Flashcards';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const data = await apiService.checkHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Periodically re-check health status every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} health={health} />;
      case 'summarize':
        return <Summarize />;
      case 'explain':
        return <Explain />;
      case 'quiz':
        return <Quiz />;
      case 'flashcards':
        return <Flashcards />;
      default:
        return <Dashboard onNavigate={setActivePage} health={health} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        health={health}
        healthLoading={healthLoading}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Mobile Top Bar */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: '#2563eb',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={16} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                StudyMate
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <span
              className={`status-dot ${
                healthLoading ? 'checking' : health?.status === 'ok' ? 'online' : 'offline'
              }`}
            />
            <span style={{ color: '#64748b' }}>
              {health?.status === 'ok' ? health.model : 'Offline'}
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="content-container">{renderPage()}</main>
      </div>
    </div>
  );
};

export default App;
