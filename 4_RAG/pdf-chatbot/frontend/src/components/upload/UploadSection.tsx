import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  FileText
} from 'lucide-react';
import { FileDropzone } from './FileDropzone';
import { UploadProgress } from './UploadProgress';
import { api } from '../../services/api';
import type { ActiveTab, DocumentMetadata, UploadResponse } from '../../types';

interface UploadSectionProps {
  onUploadSuccess: (doc: DocumentMetadata) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onUploadSuccess,
  onNavigate,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'processing' | 'indexing' | 'completed' | 'error'>('uploading');
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setUploadResult(null);
    setErrorMessage(null);
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setUploadStage('uploading');

    // Progression timer for informative stage updates while backend processes
    const pTimer = setTimeout(() => {
      setUploadStage('processing');
    }, 1500);

    const iTimer = setTimeout(() => {
      setUploadStage('indexing');
    }, 4000);

    try {
      const response = await api.uploadPDF(selectedFile);
      clearTimeout(pTimer);
      clearTimeout(iTimer);

      setUploadStage('completed');
      setUploadResult(response);

      const newDoc: DocumentMetadata = {
        document_id: response.document_id,
        filename: response.filename,
        total_pages: response.total_pages,
        pages_with_text: response.pages_with_text,
        total_characters: response.total_characters,
        total_chunks: response.total_chunks,
        file_size: selectedFile.size,
        uploaded_at: new Date().toISOString(),
        status: 'ready',
        preview: response.preview,
      };

      onUploadSuccess(newDoc);
    } catch (err: unknown) {
      clearTimeout(pTimer);
      clearTimeout(iTimer);
      setUploadStage('error');
      setErrorMessage((err as Error)?.message || 'Upload failed. Please check the backend connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMessage(null);
    setUploadStage('uploading');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          Upload & Index PDF
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Upload a document to extract text, calculate embeddings with OpenAI, and store vectors in ChromaDB.
        </p>
      </div>

      {/* Main Upload Box */}
      {!uploadResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
          <FileDropzone
            onFileSelected={handleFileSelected}
            isUploading={isUploading}
          />

          {selectedFile && !isUploading && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={handleStartUpload}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Process Document</span>
              </button>
            </div>
          )}

          {isUploading && selectedFile && (
            <UploadProgress
              filename={selectedFile.name}
              stage={uploadStage}
            />
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Upload Processing Failed</h4>
                <p className="mt-0.5">{errorMessage}</p>
                <button
                  onClick={handleStartUpload}
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Retry Upload
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Success & Inspection Card */}
      {uploadResult && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 md:p-8 space-y-6 shadow-xs animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  Document Successfully Indexed!
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your PDF was parsed, chunked, and embedded into the ChromaDB vector collection.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Ready for RAG
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Pages</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{uploadResult.total_pages}</p>
              <p className="text-[11px] text-slate-400">{uploadResult.pages_with_text} with text</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Total Chunks</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{uploadResult.total_chunks}</p>
              <p className="text-[11px] text-slate-400">Sliding window</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>Vectors Stored</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{uploadResult.vector_records_stored}</p>
              <p className="text-[11px] text-slate-400">{uploadResult.embedding_dimensions} dimensions</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Characters</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{uploadResult.total_characters.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">Total extracted text</p>
            </div>
          </div>

          {/* Chunk Previews */}
          {uploadResult.chunk_previews && uploadResult.chunk_previews.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Chunk Previews (First {uploadResult.chunk_previews.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {uploadResult.chunk_previews.map((chunk, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                      <span>{chunk.chunk_id}</span>
                      <span>Page {chunk.page_number}</span>
                    </div>
                    <p className="line-clamp-2 italic text-slate-600">"{chunk.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Upload Another PDF
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <span>Start Chatting with this Document</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
