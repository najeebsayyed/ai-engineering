export interface DocumentMetadata {
  document_id: string;
  filename: string;
  total_pages: number;
  pages_with_text?: number;
  total_characters?: number;
  total_chunks?: number;
  file_size?: number;
  uploaded_at: string;
  status: 'ready' | 'processing' | 'error';
  preview?: string;
}

export interface SourceCitationData {
  source: string;
  filename: string;
  page_number: number | string;
  chunk_id?: string;
  text?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SourceCitationData[];
  retrieved_chunks?: number;
  error?: boolean;
}

export interface UploadResponse {
  filename: string;
  total_pages: number;
  pages_with_text: number;
  total_characters: number;
  preview: string;
  message: string;
  total_chunks: number;
  chunk_previews: Array<{
    chunk_id: string;
    page_number: number;
    text: string;
  }>;
  total_embeddings: number;
  embedding_dimensions: number;
  embedding_preview: number[];
  document_id: string;
  vector_records_stored: number;
}

export interface ChatRequestPayload {
  question: string;
  document_id?: string | null;
  top_k?: number;
}

export interface ChatResponsePayload {
  question: string;
  answer: string;
  sources: SourceCitationData[];
  retrieved_chunks: number;
}

export interface SearchResultItem {
  id: string;
  text: string;
  metadata: {
    document_id: string;
    filename: string;
    page_number: number;
    chunk_index: number;
  };
  distance: number;
}

export interface SearchResponsePayload {
  question: string;
  total_results: number;
  results: SearchResultItem[];
}

export type ActiveTab = 'dashboard' | 'chat' | 'documents' | 'upload';
