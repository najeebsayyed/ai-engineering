import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { QuizResponse } from '../types';

const SAMPLE_QUIZ_TOPICS = [
  'Python Data Structures',
  'HTTP Status Codes',
  'SQL Joins & Queries',
  'Git & Version Control',
  'Object-Oriented Programming',
];

export const Quiz: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = async (selectedTopic?: string) => {
    const targetTopic = (selectedTopic ?? topic).trim();
    if (!targetTopic) {
      setError('Please enter a topic for the quiz.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setQuizData(null);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      const res = await apiService.generateQuiz(targetTopic, numQuestions);
      setQuizData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    if (isSubmitted) return; // Prevent changing after submission
    setUserAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;
    if (Object.keys(userAnswers).length < quizData.questions.length) {
      const unasked = quizData.questions.length - Object.keys(userAnswers).length;
      if (
        !window.confirm(
          `You have ${unasked} unanswered question${unasked > 1 ? 's' : ''}. Do you still want to submit?`
        )
      ) {
        return;
      }
    }
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const handleNewQuiz = () => {
    setQuizData(null);
    setUserAnswers({});
    setIsSubmitted(false);
  };

  // Calculate score
  const calculateScore = () => {
    if (!quizData) return 0;
    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  const totalQuestions = quizData?.questions.length || 0;
  const score = calculateScore();
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Award size={28} color="#10b981" />
          <span>Quiz Generator</span>
        </h1>
        <p className="page-subtitle">
          Test your knowledge with AI-crafted multiple-choice quizzes and immediate step-by-step feedback.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{error}</div>
        </div>
      )}

      {/* Quiz Input Form (shown if no quiz or user wants to change topic) */}
      {!quizData && (
        <div className="card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateQuiz();
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="quiz-topic">
                Quiz Subject or Topic
              </label>
              <input
                id="quiz-topic"
                type="text"
                className="input-text"
                placeholder="e.g. JavaScript Promises, SQL Basics, Cybersecurity Principles..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />

              <div className="chips-container" style={{ marginTop: '12px' }}>
                {SAMPLE_QUIZ_TOPICS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="chip"
                    onClick={() => {
                      setTopic(item);
                      handleGenerateQuiz(item);
                    }}
                    disabled={isLoading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="num-questions">
                Number of Questions
              </label>
              <select
                id="num-questions"
                className="select"
                style={{ maxWidth: '200px' }}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                disabled={isLoading}
              >
                <option value={3}>3 Questions (Quick)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={8}>8 Questions (In-depth)</option>
                <option value={10}>10 Questions (Comprehensive)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !topic.trim()}
              style={{ background: '#10b981' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="spinner" />
                  <span>Crafting Quiz Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Active Quiz View */}
      {quizData && (
        <div>
          {/* Header Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
                {quizData.title}
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                {quizData.questions.length} Questions &bull; Topic: {topic || 'Custom'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleRetake} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
                <RotateCcw size={14} />
                <span>Reset Answers</span>
              </button>
              <button onClick={handleNewQuiz} className="btn btn-secondary btn-sm">
                Create New Quiz
              </button>
            </div>
          </div>

          {/* Score Banner when submitted */}
          {isSubmitted && (
            <div className="score-banner">
              <div className="score-title">
                Score: {score} / {totalQuestions} ({percentage}%)
              </div>
              <div className="score-desc">
                {percentage === 100
                  ? 'Flawless! You have mastered this topic completely.'
                  : percentage >= 80
                  ? 'Outstanding work! You demonstrated strong conceptual understanding.'
                  : percentage >= 60
                  ? 'Good effort! Review the explanations below to patch any knowledge gaps.'
                  : 'Keep learning! Take note of the explanations below and try another quiz to reinforce.'}
              </div>
            </div>
          )}

          {/* Questions List */}
          {quizData.questions.map((q, qIdx) => {
            const selectedAnswer = userAnswers[qIdx];

            return (
              <div key={qIdx} className="quiz-question-card">
                <div className="question-meta">
                  <span className="question-number">Question {qIdx + 1} of {totalQuestions}</span>
                  {isSubmitted && (
                    <span>
                      {selectedAnswer === q.correct_answer ? (
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <CheckCircle2 size={16} /> Correct
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <XCircle size={16} /> Incorrect
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <div className="question-text">{q.question}</div>

                <div className="options-list">
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === q.correct_answer;

                    let optionClass = 'option-item';
                    if (isSubmitted) {
                      optionClass += ' submitted';
                      if (isCorrect) {
                        optionClass += ' correct';
                      } else if (isSelected && !isCorrect) {
                        optionClass += ' incorrect-selected';
                      }
                    } else if (isSelected) {
                      optionClass += ' selected';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={optionClass}
                        onClick={() => handleSelectOption(qIdx, opt)}
                      >
                        <div className="option-letter">{letter}</div>
                        <div style={{ flex: 1, fontSize: '0.94rem' }}>{opt}</div>
                        {isSubmitted && isCorrect && (
                          <CheckCircle2 size={18} color="#10b981" />
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <XCircle size={18} color="#ef4444" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation shown after submission */}
                {isSubmitted && (
                  <div className="quiz-explanation-box">
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HelpCircle size={15} color="#2563eb" />
                      <span>Explanation:</span>
                    </div>
                    <div>{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Submit / Action Bar */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {!isSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                className="btn btn-primary"
                style={{ background: '#10b981', minWidth: '220px', padding: '12px 24px' }}
              >
                <CheckCircle2 size={18} />
                <span>Submit Quiz Answers</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleRetake}
                  className="btn btn-secondary"
                  style={{ gap: '6px' }}
                >
                  <RotateCcw size={16} />
                  <span>Retake This Quiz</span>
                </button>
                <button
                  onClick={handleNewQuiz}
                  className="btn btn-primary"
                  style={{ background: '#10b981' }}
                >
                  <Sparkles size={16} />
                  <span>Generate Another Quiz</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
