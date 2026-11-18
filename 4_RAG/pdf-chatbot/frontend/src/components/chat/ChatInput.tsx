import React, { useRef, useEffect } from 'react';
import { Send, Loader2, SlidersHorizontal, Trash2 } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onClear: () => void;
  hasMessages: boolean;
  topK: number;
  setTopK: (val: number) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  onClear,
  hasMessages,
  topK,
  setTopK,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div className="bg-white border-t border-slate-200/80 p-3 md:p-4">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Controls Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Chunks (top_k):</span>
            </span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              disabled={isLoading || disabled}
              className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value={3}>3 chunks</option>
              <option value={5}>5 chunks (default)</option>
              <option value={8}>8 chunks</option>
              <option value={10}>10 chunks</option>
            </select>
          </div>

          {hasMessages && (
            <button
              onClick={onClear}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer text-xs"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>

        {/* Input Textarea Container */}
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 rounded-2xl p-2 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document... (Press Enter to send, Shift+Enter for new line)"
            disabled={isLoading || disabled}
            className="w-full bg-transparent resize-none px-2 py-1.5 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden max-h-36 overflow-y-auto leading-relaxed"
          />

          <button
            onClick={onSend}
            disabled={isLoading || !input.trim() || disabled}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              !input.trim() || isLoading || disabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
            }`}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Responses are grounded strictly in document context with verified citations.</span>
          <span>Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
};
