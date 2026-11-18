import React from 'react';
import { Bot, User, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import { SourceCitation } from './SourceCitation';
import type { ChatMessage, SourceCitationData } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
  onInspectSource?: (source: SourceCitationData) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRetry,
  onInspectSource,
}) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Render text with styled [Source X] references
  const renderFormattedContent = (content: string) => {
    // Split by source references like [Source 1]
    const parts = content.split(/(\[Source\s*\d+\])/g);
    return parts.map((part, index) => {
      if (/\[Source\s*\d+\]/.test(part)) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded text-[11px] font-semibold bg-brand-100 text-brand-900 border border-brand-200"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={`flex gap-3 md:gap-4 max-w-3xl ${
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-1 shadow-2xs ${
          isUser
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-brand-500 border-brand-600 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Body */}
      <div
        className={`rounded-2xl p-4 md:p-5 shadow-xs transition-all ${
          isUser
            ? 'bg-slate-900 text-white rounded-tr-none'
            : message.error
            ? 'bg-red-50 border border-red-200 text-red-900 rounded-tl-none'
            : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400 mb-1.5 font-medium">
          <span className={isUser ? 'text-slate-300' : 'text-slate-600'}>
            {isUser ? 'You' : 'DocuRAG Assistant'}
          </span>
          <span className={isUser ? 'text-slate-400' : 'text-slate-400'}>
            {formattedTime}
          </span>
        </div>

        {/* Content */}
        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'text-slate-100' : 'text-slate-800'
        }`}>
          {renderFormattedContent(message.content)}
        </div>

        {/* Source Citations */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitation
            sources={message.sources}
            onInspectSource={onInspectSource}
          />
        )}

        {/* Error Retry Option */}
        {message.error && onRetry && (
          <div className="mt-3 pt-3 border-t border-red-200 flex items-center justify-between">
            <span className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Failed to generate answer
            </span>
            <button
              onClick={onRetry}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Copy button for assistant responses */}
        {!isUser && !message.error && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleCopy}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
