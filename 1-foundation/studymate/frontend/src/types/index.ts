export interface HealthResponse {
  status: string;
  app_name: string;
  model: string;
  ai_ready: boolean;
}

export interface SummarizeRequest {
  content: string;
}

export interface SummarizeResponse {
  summary: string;
}

export interface ExplainRequest {
  topic: string;
}

export interface ExplainResponse {
  topic: string;
  explanation: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizRequest {
  topic: string;
  num_questions?: number;
}

export interface QuizResponse {
  title: string;
  questions: QuizQuestion[];
}

export interface FlashcardItem {
  front: string;
  back: string;
}

export interface FlashcardsRequest {
  topic: string;
  num_cards?: number;
}

export interface FlashcardsResponse {
  title: string;
  flashcards: FlashcardItem[];
}

export type ActivePage = 'dashboard' | 'summarize' | 'explain' | 'quiz' | 'flashcards';
