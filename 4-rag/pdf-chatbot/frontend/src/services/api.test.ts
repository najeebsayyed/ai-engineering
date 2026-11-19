import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

describe('Frontend API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('provides the correct base URL', () => {
    const baseUrl = api.getBaseUrl();
    expect(baseUrl).toBeDefined();
    expect(baseUrl).toMatch(/^https?:\/\//);
  });

  it('formats getDocumentPdfUrl correctly', () => {
    const url = api.getDocumentPdfUrl('test-uuid-123');
    expect(url).toContain('/documents/test-uuid-123/pdf');
  });

  it('handles successful health check', async () => {
    const mockResponse = { status: 'ok', total_documents: 2, total_vectors: 10 };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await api.checkHealth();
    expect(result).toEqual(mockResponse);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/health'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('throws an error with message from server if request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Only PDF files are allowed.' }),
    } as Response);

    await expect(api.checkHealth()).rejects.toThrow('Only PDF files are allowed.');
  });
});
