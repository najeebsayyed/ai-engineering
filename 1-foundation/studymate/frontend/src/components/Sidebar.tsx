import React from 'react';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Award,
  Layers,
  GraduationCap,
  X,
  Sparkles,
} from 'lucide-react';
import type { ActivePage, HealthResponse } from '../types';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isOpen: boolean;
  onClose: () => void;
  health: HealthResponse | null;
  healthLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpen,
  onClose,
  health,
  healthLoading,
}) => {
  const navItems = [
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'summarize' as ActivePage, label: 'Summarize', icon: FileText },
    { id: 'explain' as ActivePage, label: 'Explain Topics', icon: HelpCircle },
    { id: 'quiz' as ActivePage, label: 'Quiz Generator', icon: Award },
    { id: 'flashcards' as ActivePage, label: 'Flashcards', icon: Layers },
  ];

  const handleSelect = (page: ActivePage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand" onClick={() => handleSelect('dashboard')}>
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="brand-title">StudyMate</div>
            <div className="brand-subtitle">AI Learning Assistant</div>
          </div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          style={{ display: isOpen ? 'flex' : 'none', padding: '4px 8px' }}
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="health-badge">
          <span
            className={`status-dot ${
              healthLoading
                ? 'checking'
                : health?.status === 'ok'
                ? 'online'
                : 'offline'
            }`}
          />
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {healthLoading ? (
              'Connecting to API...'
            ) : health?.status === 'ok' ? (
              <span>
                <strong>Connected</strong> ({health.model})
              </span>
            ) : (
              <span style={{ color: '#ef4444' }}>Backend Offline</span>
            )}
          </div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} /> Powered by OpenAI Responses API
        </div>
      </div>
    </aside>
  );
};
