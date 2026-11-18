import type {
  ChatRequestPayload,
  ChatResponsePayload,
  DocumentMetadata,
  SearchResponsePayload,
  UploadResponse,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 60000
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      let errorMessage = `Request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to text
        try {
          const text = await res.text();
          if (text) errorMessage = text;
        } catch {
          // Keep default
        }
      }
      throw new ApiError(errorMessage, res.status);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    clearTimeout(id);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(`Request timed out after ${timeoutMs / 1000} seconds. The backend may still be processing.`, 408);
    }
    throw new ApiError((err as Error)?.message || 'Network request failed. Is the backend server running?', 0);
  }
}

export const api = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async checkHealth(): Promise<{ status: string; total_documents?: number; total_vectors?: number }> {
    return request<{ status: string; total_documents?: number; total_vectors?: number }>('/health', {
      method: 'GET',
    }, 5000);
  },

  async uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return request<UploadResponse>('/upload', {
      method: 'POST',
      body: formData,
    }, 120000); // 2 minute timeout for processing large PDFs & embeddings
  },

  async listDocuments(): Promise<DocumentMetadata[]> {
    const data = await request<{ documents: DocumentMetadata[] }>('/documents', {
      method: 'GET',
    }, 10000);
    return data.documents || [];
  },

  async deleteDocument(documentId: string): Promise<{ status: string; document_id: string }> {
    return request<{ status: string; document_id: string }>(`/documents/${documentId}`, {
      method: 'DELETE',
    }, 15000);
  },

  getDocumentPdfUrl(documentId: string): string {
    return `${API_BASE_URL}/documents/${documentId}/pdf`;
  },

  async chat(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
    return request<ChatResponsePayload>('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: payload.question,
        document_id: payload.document_id || null,
        top_k: payload.top_k || 5,
      }),
    }, 60000);
  },

  async search(question: string, documentId?: string | null, topK = 5): Promise<SearchResponsePayload> {
    return request<SearchResponsePayload>('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        document_id: documentId || null,
        top_k: topK,
      }),
    }, 30000);
  },
};
