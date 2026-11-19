import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { apiService } from '../services/api';

const SAMPLE_TEXT = `FastAPI is a modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints.

The key features are:
- Fast: Very high performance, on par with NodeJS and Go (thanks to Starlette and Pydantic). One of the fastest Python frameworks available.
- Fast to code: Increase the speed to develop features by about 200% to 300%.
- Fewer bugs: Reduce about 40% of human (developer) induced errors.
- Intuitive: Great editor support. Completion everywhere. Less time debugging.
- Easy: Designed to be easy to use and learn. Less time reading documentation.
- Short: Minimize code duplication. Multiple features from each parameter declaration.
- Robust: Get production-ready code. With automatic interactive documentation.
- Standards-based: Based on (and fully compatible with) the open standards for APIs: OpenAPI and JSON Schema.`;

export const Summarize: React.FC = () => {
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please provide some study material to summarize.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setSummary('');

    try {
      const res = await apiService.summarize(content);
      setSummary(res.summary);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const loadSample = () => {
    setContent(SAMPLE_TEXT);
    setError(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <FileText size={28} color="#2563eb" />
          <span>Summarize Content</span>
        </h1>
        <p className="page-subtitle">
          Condense lengthy articles, lecture notes, and documentation into key takeaways.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{error}</div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSummarize}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }} htmlFor="study-content">
                Study Material or Notes
              </label>
              <button
                type="button"
                onClick={loadSample}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px' }}
              >
                <FileCode size={14} />
                <span>Load Sample Text</span>
              </button>
            </div>
            <textarea
              id="study-content"
              className="textarea"
              placeholder="Paste the chapter, article, lecture notes, or technical documentation you would like summarized here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              disabled={isLoading}
            />
            <div className="form-hint" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Provide at least a sentence or paragraph for the best summary.</span>
              <span>{content.length} characters</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="spinner" />
                  <span>Generating Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Summary</span>
                </>
              )}
            </button>

            {content && !isLoading && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setContent('');
                  setSummary('');
                  setError(null);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {summary && (
        <div className="result-box">
          <div className="result-header">
            <div className="result-header-title">
              <Sparkles size={16} color="#2563eb" />
              <span>AI-Generated Summary</span>
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
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>
          <div className="result-content">{summary}</div>
        </div>
      )}
    </div>
  );
};
