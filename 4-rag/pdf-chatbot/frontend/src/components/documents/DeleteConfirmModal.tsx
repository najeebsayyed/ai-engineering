import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import type { DocumentMetadata } from '../../types';

interface DeleteConfirmModalProps {
  document: DocumentMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  document,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            Delete Document & Vectors?
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-slate-800">"{document.filename}"</span>?
            This will permanently remove the uploaded PDF and all associated embedding vectors from ChromaDB.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800">
          This operation cannot be undone. Other documents will remain untouched.
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
