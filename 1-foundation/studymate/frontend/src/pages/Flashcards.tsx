import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { FlashcardsResponse } from '../types';

const SAMPLE_FLASHCARD_TOPICS = [
  'Python Built-in Functions',
  'CSS Flexbox & Grid',
  'HTTP Methods & Statuses',
  'SQL Database Terminology',
  'Operating System Basics',
];

export const Flashcards: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [numCards, setNumCards] = useState<number>(5);
  const [deck, setDeck] = useState<FlashcardsResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCards = async (selectedTopic?: string) => {
    const targetTopic = (selectedTopic ?? topic).trim();
    if (!targetTopic) {
      setError('Please enter a topic for flashcards.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setDeck(null);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const res = await apiService.generateFlashcards(targetTopic, numCards);
      setDeck(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = useCallback(() => {
    if (!deck) return;
    if (currentIndex < deck.flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  }, [deck, currentIndex]);

  const handlePrev = useCallback(() => {
    if (!deck) return;
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  }, [deck, currentIndex]);

  const handleResetDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNewSet = () => {
    setDeck(null);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation: Left/Right arrow keys for navigation, Space to flip
  useEffect(() => {
    if (!deck) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, handleNext, handlePrev]);

  const totalCards = deck?.flashcards.length || 0;
  const currentCard = deck?.flashcards[currentIndex];
  const progressPercent = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Layers size={28} color="#f59e0b" />
          <span>Flashcards Revision</span>
        </h1>
        <p className="page-subtitle">
          Master essential terms and core concepts with 3D interactive flip cards.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{error}</div>
        </div>
      )}

      {/* Input Form when no active deck */}
      {!deck && (
        <div className="card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateCards();
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="flashcard-topic">
                Topic or Subject for Flashcards
              </label>
              <input
                id="flashcard-topic"
                type="text"
                className="input-text"
                placeholder="e.g. Git Commands, Python Decorators, HTTP Headers..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />

              <div className="chips-container" style={{ marginTop: '12px' }}>
                {SAMPLE_FLASHCARD_TOPICS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip"
                    onClick={() => {
                      setTopic(item);
                      handleGenerateCards(item);
                    }}
                    disabled={isLoading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="num-cards">
                Number of Cards
              </label>
              <select
                id="num-cards"
                className="select"
                style={{ maxWidth: '200px' }}
                value={numCards}
                onChange={(e) => setNumCards(Number(e.target.value))}
                disabled={isLoading}
              >
                <option value={3}>3 Cards (Quick Review)</option>
                <option value={5}>5 Cards (Standard)</option>
                <option value={8}>8 Cards (Deep Dive)</option>
                <option value={12}>12 Cards (Mastery)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !topic.trim()}
              style={{ background: '#f59e0b' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="spinner" />
                  <span>Building Flashcard Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Flashcards</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Active Flashcard Viewer */}
      {deck && currentCard && (
        <div>
          {/* Header Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>
                {deck.title}
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
                Card {currentIndex + 1} of {totalCards} &bull; Use Space or click to flip
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleResetDeck} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
                <RotateCcw size={14} />
                <span>Restart Deck</span>
              </button>
              <button onClick={handleNewSet} className="btn btn-secondary btn-sm">
                Generate New Deck
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* 3D Flip Card Container */}
          <div className="flashcard-wrapper" onClick={handleFlip}>
            <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* Front of Card */}
              <div className="flashcard-face flashcard-front">
                <span className="flashcard-tag">Concept / Question</span>
                <div className="flashcard-body">{currentCard.front}</div>
                <div className="flashcard-hint">
                  <RotateCcw size={14} />
                  <span>Click or press Space to reveal answer</span>
                </div>
              </div>

              {/* Back of Card */}
              <div className="flashcard-face flashcard-back">
                <span className="flashcard-tag">Explanation / Answer</span>
                <div className="flashcard-body" style={{ fontSize: '1.05rem', fontWeight: 500 }}>
                  {currentCard.back}
                </div>
                <div className="flashcard-hint">
                  <RotateCcw size={14} />
                  <span>Click to flip back</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flashcard-controls">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-secondary"
              style={{ gap: '6px' }}
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              onClick={handleFlip}
              className="btn btn-secondary"
              style={{ gap: '6px' }}
            >
              <RotateCcw size={16} />
              <span>{isFlipped ? 'Show Front' : 'Show Answer'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalCards - 1}
              className="btn btn-secondary"
              style={{ gap: '6px' }}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '16px',
              fontSize: '0.8rem',
              color: '#94a3b8',
            }}
          >
            Tip: You can use &larr; and &rarr; arrow keys to navigate cards, and Space to flip.
          </div>
        </div>
      )}
    </div>
  );
};
