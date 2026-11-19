import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { apiService } from '../services/api';

const EXAMPLE_TOPICS = [
  'Binary Search Trees',
  'REST vs GraphQL APIs',
  'Docker Containers',
  'Git Merge vs Rebase',
  'Recursion in Python',
  'Asynchronous JavaScript',
];

export const Explain: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExplain = async (topicToRun: string) => {
    const target = topicToRun.trim();
    if (!target) {
      setError('Please enter a topic to explain.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setExplanation('');

    try {
      const res = await apiService.explain(target);
      setExplanation(res.explanation);
      setCurrentTopic(res.topic);
    } catch (err: any) {
      setError(err.message || 'Failed to explain topic.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExplain(topic);
  };

  const handleCopy = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <HelpCircle size={28} color="#8b5cf6" />
          <span>Explain Topics</span>
        </h1>
        <p className="page-subtitle">
          Break down difficult technical concepts into intuitive analogies, clear steps, and practical examples.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{error}</div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="topic-input">
              Concept or Topic to Explain
            </label>
            <input
              id="topic-input"
              type="text"
              className="input-text"
              placeholder="e.g. Asynchronous Programming, Database Indexing, OAuth2..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
            <div className="form-hint">
              Try typing any engineering, computer science, or data science concept.
            </div>

            {/* Quick Topic Chips */}
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                Popular Ideas:
              </span>
              <div className="chips-container">
                {EXAMPLE_TOPICS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip"
                    onClick={() => {
                      setTopic(item);
                      handleExplain(item);
                    }}
                    disabled={isLoading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !topic.trim()}
              style={{ background: '#8b5cf6' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="spinner" />
                  <span>Explaining Concept...</span>
                </>
              ) : (
                <>
                  <Lightbulb size={18} />
                  <span>Explain Topic</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {explanation && (
        <div className="result-box">
          <div className="result-header">
            <div className="result-header-title">
              <Sparkles size={16} color="#8b5cf6" />
              <span>Explanation for &quot;{currentTopic}&quot;</span>
            </div>
            <button
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              {copied ? (
                <>
                  <Check size={14} color="#10b981" />
                  <span style={{ color: '#10b981' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Explanation</span>
                </>
              )}
            </button>
          </div>
          <div className="result-content">{explanation}</div>
        </div>
      )}
    </div>
  );
};
