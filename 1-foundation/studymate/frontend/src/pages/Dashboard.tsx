import React from 'react';
import {
  FileText,
  HelpCircle,
  Award,
  Layers,
  ArrowRight,
  BookOpen,
  Zap,
  Target,
} from 'lucide-react';
import type { ActivePage, HealthResponse } from '../types';

interface DashboardProps {
  onNavigate: (page: ActivePage) => void;
  health: HealthResponse | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, health }) => {
  const features = [
    {
      id: 'summarize' as ActivePage,
      title: 'Summarize Content',
      description:
        'Condense lengthy articles, textbooks, and study notes into clear, digestible key takeaways and bullet points.',
      icon: FileText,
      iconClass: 'feature-icon-blue',
      badge: 'Text Summarizer',
      cta: 'Summarize Notes',
    },
    {
      id: 'explain' as ActivePage,
      title: 'Explain Topics',
      description:
        'Break down complex or technical concepts into plain English using intuitive analogies, simple steps, and real-world examples.',
      icon: HelpCircle,
      iconClass: 'feature-icon-purple',
      badge: 'Concept Breakdown',
      cta: 'Explain a Concept',
    },
    {
      id: 'quiz' as ActivePage,
      title: 'Generate Quizzes',
      description:
        'Test your retention with AI-generated multiple-choice questions complete with instant feedback, scoring, and explanations.',
      icon: Award,
      iconClass: 'feature-icon-green',
      badge: 'Self-Testing',
      cta: 'Start a Quiz',
    },
    {
      id: 'flashcards' as ActivePage,
      title: 'Create Flashcards',
      description:
        'Master definitions, code syntax, and core terminology with interactive 3D flip cards designed for rapid spaced-repetition revision.',
      icon: Layers,
      iconClass: 'feature-icon-amber',
      badge: 'Revision Deck',
      cta: 'Generate Cards',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span>Welcome to StudyMate</span>
        </h1>
        <p className="page-subtitle">Your AI-powered learning companion.</p>
      </div>

      {health && !health.ai_ready && (
        <div className="alert-error" style={{ marginBottom: '24px' }}>
          <div>
            <strong>Configuration Notice:</strong> OPENAI_API_KEY is not detected in your backend
            environment. Please add your API key to the backend <code>.env</code> file to enable AI
            generations.
          </div>
        </div>
      )}

      {/* Feature Cards Grid */}
      <div className="dashboard-grid">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              className="feature-card"
              onClick={() => onNavigate(f.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onNavigate(f.id);
              }}
            >
              <div>
                <div className="feature-card-header">
                  <div className={`feature-icon-wrapper ${f.iconClass}`}>
                    <Icon size={24} />
                  </div>
                  <span className="feature-badge">{f.badge}</span>
                </div>
                <h3 className="card-title">{f.title}</h3>
                <p className="card-desc">{f.description}</p>
              </div>
              <div className="feature-card-footer">
                <span>{f.cta}</span>
                <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Study Tips Banner */}
      <div
        className="card"
        style={{
          marginTop: '36px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
              Active Recall
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
              Generate custom quizzes right after reading to cement concepts in long-term memory.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: '#ecfdf5',
              color: '#10b981',
            }}
          >
            <Target size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
              Spaced Repetition
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
              Flip through flashcards daily to reinforce key definitions and syntax.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: '#f5f3ff',
              color: '#8b5cf6',
            }}
          >
            <Zap size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
              Feynman Technique
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
              Use simple explanations to master technical jargon through real-world analogies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
