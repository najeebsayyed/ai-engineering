import type {
  HealthResponse,
  SummarizeRequest,
  SummarizeResponse,
  ExplainRequest,
  ExplainResponse,
  QuizRequest,
  QuizResponse,
  FlashcardsRequest,
  FlashcardsResponse,
} from '../types';

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = `Server error (${response.status})`;
    try {
      const errData = await response.json();
      if (errData && typeof errData === 'object' && 'detail' in errData) {
        errorDetail = String(errData.detail);
      }
    } catch {
      // Failed to parse JSON error; fallback to status text
      if (response.statusText) {
        errorDetail = response.statusText;
      }
    }
    throw new ApiError(errorDetail, response.status);
  }
  return response.json() as Promise<T>;
}

async function fetchWithNetworkHandler<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    return await handleResponse<T>(res);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors (e.g. backend server offline, CORS block, timeout)
    const err = error as Error;
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new ApiError(
        `Unable to connect to StudyMate API at ${API_BASE_URL}. Please ensure the backend server is running (uv run python app/main.py --serve).`
      );
    }
    throw new ApiError(err.message || 'An unknown network error occurred.');
  }
}

export const apiService = {
  async checkHealth(): Promise<HealthResponse> {
    return fetchWithNetworkHandler<HealthResponse>(`${API_BASE_URL}/api/health`);
  },

  async summarize(content: string): Promise<SummarizeResponse> {
    const payload: SummarizeRequest = { content };
    return fetchWithNetworkHandler<SummarizeResponse>(`${API_BASE_URL}/api/summarize`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async explain(topic: string): Promise<ExplainResponse> {
    const payload: ExplainRequest = { topic };
    return fetchWithNetworkHandler<ExplainResponse>(`${API_BASE_URL}/api/explain`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async generateQuiz(topic: string, numQuestions: number = 5): Promise<QuizResponse> {
    const payload: QuizRequest = { topic, num_questions: numQuestions };
    return fetchWithNetworkHandler<QuizResponse>(`${API_BASE_URL}/api/quiz`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async generateFlashcards(topic: string, numCards: number = 5): Promise<FlashcardsResponse> {
    const payload: FlashcardsRequest = { topic, num_cards: numCards };
    return fetchWithNetworkHandler<FlashcardsResponse>(`${API_BASE_URL}/api/flashcards`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
