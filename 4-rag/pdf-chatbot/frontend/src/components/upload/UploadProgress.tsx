import React from 'react';
import { Loader2, FileText, Layers, Database, CheckCircle2 } from 'lucide-react';

interface UploadProgressProps {
  filename: string;
  stage: 'uploading' | 'processing' | 'indexing' | 'completed' | 'error';
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ filename, stage }) => {
  const stages = [
    {
      id: 'uploading',
      label: 'Uploading document',
      description: 'Transferring PDF binary to backend server',
      icon: FileText,
    },
    {
      id: 'processing',
      label: 'Extracting text & chunking',
      description: 'PyMuPDF text extraction & sliding window overlap',
      icon: Layers,
    },
    {
      id: 'indexing',
      label: 'Generating embeddings & ChromaDB indexing',
      description: 'OpenAI embeddings & HNSW vector store upsert',
      icon: Database,
    },
  ];

  const getStageStatus = (stepId: string) => {
    if (stage === 'completed') return 'completed';
    if (stage === 'error') return 'pending';

    const stageOrder = ['uploading', 'processing', 'indexing', 'completed'];
    const currentIndex = stageOrder.indexOf(stage);
    const stepIndex = stageOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 truncate max-w-sm">
              Processing {filename}
            </h3>
            <p className="text-xs text-slate-500">
              Please wait while the document pipeline indexes your file.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
          In Progress
        </span>
      </div>

      <div className="space-y-4">
        {stages.map((s) => {
          const status = getStageStatus(s.id);
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                status === 'active'
                  ? 'bg-brand-50/50 border-brand-300 shadow-2xs'
                  : status === 'completed'
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-white border-slate-100 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                  status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : status === 'active'
                    ? 'bg-brand-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : status === 'active' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold ${
                    status === 'active' ? 'text-brand-900' : 'text-slate-800'
                  }`}>
                    {s.label}
                  </h4>
                  {status === 'active' && (
                    <span className="text-[10px] font-medium text-brand-600 animate-pulse">
                      Running...
                    </span>
                  )}
                  {status === 'completed' && (
                    <span className="text-[10px] font-medium text-emerald-600">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
