import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, FileCheck } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelected,
  isUploading,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndStage = (file: File) => {
    setValidationError(null);

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setValidationError('Only PDF documents (.pdf) are supported.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError('PDF file size exceeds the 20 MB limit.');
      return;
    }

    if (file.size === 0) {
      setValidationError('The selected PDF file is empty (0 bytes).');
      return;
    }

    setStagedFile(file);
    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndStage(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndStage(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50'
        } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200/60 shadow-2xs mb-4">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1">
          {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF file here'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Supports text-based PDF documents up to 20 MB. Chunks and embeddings are created automatically.
        </p>

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Browse Files</span>
        </button>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Staged File Card if selected */}
      {stagedFile && !validationError && (
        <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{stagedFile.name}</p>
              <p className="text-[11px] text-slate-500">{formatFileSize(stagedFile.size)}</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Ready to upload
          </span>
        </div>
      )}
    </div>
  );
};
